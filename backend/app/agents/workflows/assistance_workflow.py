import logging
import uuid
from typing import Literal, cast

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode

from app.agents.agents.adviser import get_adviser_prompt
from app.agents.agents.classifier import classifier
from app.agents.state.state import QueryState
from app.agents.tools.search_tools import TOOLS as search_tools
from app.schemas.schemas import ImageBlock, ResponseContent, TextBlock
from app.services.llm import load_model

logger = logging.getLogger(__name__)
llm = load_model()


def thread_to_messages(thread):
    """Convert a thread to a list of messages."""
    messages = []
    for message in thread.messages:
        content = []
        for block in message.blocks:
            if block.type == "text":
                content.append({"type": "text", "text": block.data})
            elif block.type == "image_url":
                content.append({"type": "image_url", "image_url": {"url": block.data}})
        if message.role == "user":
            messages.append(HumanMessage(content=content))
        else:
            messages.append(AIMessage(content=content))
    return messages


def recover_chats(state: QueryState):
    question = state.messages[-1].content if state.messages else ""
    return {"question": question, "step": "recover_chat"}


def classify_intent(state: QueryState):
    """Classify the intent of the user's question."""
    question = state.question
    last_messages = state.messages[-5:-1] or []
    result = classifier.invoke({"question": question, "messages": last_messages})
    return {"topic": result.topic, "allowed": result.allowed, "step": "classify_intent"}


def route_intent(state: QueryState) -> Literal["rejection", "llm"]:
    """Route the intent to the appropriate node."""
    if not state.allowed:
        logger.warning("Intent not allowed, routing to rejection")
        return "rejection"
    return "llm"


def reject_question(state: QueryState):
    """Reject the question if it is out of scope."""
    system_prompt = (
        "Tu misión es informar al usuario analista de soporte que su pregunta "
        "no puede ser respondida porque no cumple con el propósito del agente, "
        "que es brindar asesoría especializada en soporte técnico para el contrato "
        "24TE20 de Telefónica Colombia. El agente proporciona asesoría interna "
        "a los analistas de soporte N1 y Oncall, respondiendo preguntas con base "
        "en workarounds y documentos de referencia."
    )
    prompt = (
        "El usuario ha realizado la siguiente pregunta, la cual está fuera "
        "del alcance y el propósito del agente:\n\n"
        f"Pregunta del usuario: '{state.question}'\n\n "
        "Genera una respuesta amable y breve para el usuario, indicando que "
        "su pregunta no puede ser respondida porque no cumple con el propósito "
        "del agente."
    )
    response = llm.invoke(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ]
    )
    id_answer = str(uuid.uuid4())
    answer = AIMessage(id=id_answer, content=response.content)
    return {"messages": [answer], "step": "reject_question"}


def call_model(state: QueryState):
    """Call the language model to generate a response."""
    titles = state.titles
    llm_model = llm.bind_tools(search_tools)
    response = cast(
        AIMessage,
        llm_model.invoke(
            [
                {"role": "system", "content": get_adviser_prompt()},
                *state.messages,
                HumanMessage(content=state.question),
            ]
        ),
    )
    if response.tool_calls:
        tool_name = response.tool_calls[0]["name"]
        if tool_name == "search_relevant_chunks":
            titles = response.tool_calls[0]["args"]["titles"]
            for title in titles:
                if title not in state.titles:
                    state.titles.append(title)
        if state.is_last_step:
            logger.critical(
                "Model called tools but it's the last step, returning error message"
            )
            return {
                "messages": [
                    AIMessage(
                        id=response.id,
                        content="Sorry, I could not find an answer to your question in the specified number of steps.",
                    )
                ]
            }
    return {"messages": [response], "titles": titles, "step": "llm_call"}


def route_model_output(state: QueryState) -> Literal["response", "tools"]:
    """Route the model output to the appropriate node."""
    last_message = state.messages[-1]
    if not isinstance(last_message, AIMessage):
        raise ValueError(
            f"Expected AIMessage in output edges, but got {type(last_message).__name__}"
        )
    if not last_message.tool_calls:
        logger.warning("No tool calls found in model output, routing to response")
        return "response"
    return "tools"


def build_response(state: QueryState):
    """Build the final response from the model output."""
    raw_answer = state.messages[-1].content
    text_answer = raw_answer[0]["text"] if raw_answer else ""
    answer = ResponseContent(content=[TextBlock(type="text", data=text_answer)])
    return {"content": answer.content, "step": "build_response"}


def save_answer(state: QueryState):
    """Save the final response to the state."""
    msg_content = []
    for item in state.content:
        if isinstance(item, TextBlock):
            msg_content.append({"type": "text", "text": item.data})
        elif isinstance(item, ImageBlock):
            msg_content.append({"type": "image_url", "image_url": {"url": item.url}})
    ai_message = AIMessage(content=msg_content)
    return {"messages": [ai_message], "step": "save_answer"}


graph = StateGraph(QueryState)

graph.add_node("recover", recover_chats)
graph.add_node("intent", classify_intent)
graph.add_node("rejection", reject_question)
graph.add_node("llm", call_model)
graph.add_node("tools", ToolNode(search_tools))
graph.add_node("response", build_response)
graph.add_node("save", save_answer)

graph.add_edge(START, "recover")
graph.add_edge("recover", "intent")
graph.add_conditional_edges("intent", route_intent)
graph.add_edge("rejection", "response")
graph.add_conditional_edges("llm", route_model_output)
graph.add_edge("tools", "llm")
graph.add_edge("response", "save")
graph.add_edge("save", END)

memory = MemorySaver()
# assistant_graph = graph.compile(checkpointer=memory)

assistant_graph = (
    StateGraph(QueryState)
    .add_node("recover", recover_chats)
    .add_node("intent", classify_intent)
    .add_node("rejection", reject_question)
    .add_node("llm", call_model)
    .add_node("tools", ToolNode(search_tools))
    .add_node("response", build_response)
    .add_node("save", save_answer)
    .add_edge(START, "recover")
    .add_edge("recover", "intent")
    .add_conditional_edges("intent", route_intent)
    .add_edge("rejection", "response")
    .add_conditional_edges("llm", route_model_output)
    .add_edge("tools", "llm")
    .add_edge("response", "save")
    .add_edge("save", END)
    .compile()
    # .compile(checkpointer=memory)
)

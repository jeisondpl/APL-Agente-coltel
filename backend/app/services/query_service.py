import json
import logging
from pathlib import Path

from langchain_core.messages import AIMessage, HumanMessage
from langgraph.prebuilt import ToolCallTransformer
from sqlalchemy.orm import Session

from app.agents.workflows.assistance_workflow import assistant_graph
from app.crud.message import get_last_message_order_from_thread, save_message
from app.crud.thread import create_new_thread, get_thread, update_thread_topic
from app.models.block import Block
from app.models.message import Message
from app.schemas.schemas import ChatResponse, ResponseContent, TextBlock
from app.services.storage_service import (
    get_images_as_base64,
)

logger = logging.getLogger(__name__)


async def retrieve_images(path: str):
    """Retrieve images from a given path."""
    logger.warning(f"Getting images from path: {path}")
    images = get_images_as_base64(path)
    content = []
    for image in images:
        name = str(Path(image.name).stem)
        content.append(image)
        content.append(TextBlock(type="text", data=name))
    response = ResponseContent(content=content)
    return response


def thread_to_messages(thread):
    """Convert a thread to a list of messages."""
    messages = []
    for message in thread.messages:
        content = []
        for block in message.blocks:
            if block.type == "text":
                content.append({"type": "text", "text": block.content["data"]})
            elif block.type == "image":
                content.append(
                    {"type": "image_url", "image_url": {"url": block.content["url"]}}
                )
        if message.role == "user":
            messages.append(HumanMessage(content=content))
        else:
            messages.append(AIMessage(content=content))
    return messages


async def query_agent(
    question: str, thread_id: str, user_id: str, db: Session, limit: int = 5
):
    """Answer query using the agent workflow."""
    if not thread_id:
        thread_id = str(create_new_thread(user_id, db))
    config = {"configurable": {"thread_id": thread_id}}
    result = await assistant_graph.ainvoke(
        {"messages": [HumanMessage(content=question)]}, config=config
    )
    logger.info(f"Topic: {result['topic']}")
    content = result["content"]
    chat_response = ChatResponse(content=content, thread_id=thread_id)
    try:
        order = get_last_message_order_from_thread(thread_id, db) + 1
        question_block = Block(type="text", content={"data": question}, position=1)
        user_msg = Message(
            thread_id=thread_id, order=order, role="user", blocks=[question_block]
        )
        answer_blocks = []
        for i, block in enumerate(chat_response.content):
            answer_block = Block(type=block.type, position=i + 1)
            if block.type == "text":
                answer_block.content = {"data": block.data}
            elif block.type == "picture":
                answer_block.content = {
                    "data": block.data,
                    "name": block.name,
                    "format": block.format,
                }
            elif block.type == "image":
                answer_block.content = {"url": block.url}
            elif block.type == "code":
                answer_block.content = {"language": block.language, "data": block.data}
            answer_blocks.append(answer_block)
        assistant_msg = Message(
            thread_id=thread_id,
            order=order + 1,
            role="assistant",
            blocks=answer_blocks,
        )
        question_msg = save_message(user_msg, db)
        answer_msg = save_message(assistant_msg, db)
    except Exception as e:
        logger.error(f"Error saving message: {e}")
    return answer_msg


async def query_agent_stream(
    question: str, thread_id: str, user_id: str, bg_tasks, db: Session, limit: int = 5
):
    """Answer query using the agent workflow."""
    if not thread_id:
        thread_id = str(create_new_thread(user_id, db))
    thread = get_thread(thread_id, db)
    MAX_MESSAGES_RECOVERED = 4
    messages = thread_to_messages(thread)[-MAX_MESSAGES_RECOVERED:]
    config = {"configurable": {"thread_id": thread_id}}
    stream = assistant_graph.stream_events(
        {
            "messages": messages + [HumanMessage(content=question)],
            "thread_id": thread_id,
        },
        config=config,
        version="v3",
        transformers=[ToolCallTransformer],
    )
    for event in stream:
        if event["method"] == "values":
            query_state = event["params"]["data"]
            if query_state.titles:
                logger.warning(f"Titles: {query_state.titles}")
                data = {"type": "sources", "content": query_state.titles}
                yield json.dumps(data) + "\n"
            if query_state.step:
                logger.warning(f"Step: {query_state.step}")
                data = {"type": "step", "name": query_state.step, "status": "started"}
                yield json.dumps(data) + "\n"
        elif event["method"] == "messages":
            message, metadata = event["params"]["data"]
            node = metadata.get("langgraph_node", None)
            if node == "llm" or node == "rejection":
                if message["event"] == "content-block-delta":
                    if "text" in message["delta"]:
                        data = {"type": "text", "content": message["delta"]["text"]}
                        yield json.dumps(data) + "\n"
        elif event["method"] == "tools":
            logger.warning(f"Tool event: {event}")
            tool_event = event["params"]["data"]
            if tool_event["event"] == "tool-started":
                data = {
                    "type": "step",
                    "name": tool_event["tool_name"],
                    "status": "started",
                }
                yield json.dumps(data) + "\n"
            elif tool_event["event"] == "tool-finished":
                data = {
                    "type": "step",
                    "name": tool_event["output"].name,
                    "status": "finished",
                }
                yield json.dumps(data) + "\n"
        else:
            logger.warning(f"Other event: {event}")
    final_state = stream.output
    chat_response = ChatResponse(
        content=final_state.content, thread_id=thread_id, sources=final_state.titles
    )
    try:
        order = get_last_message_order_from_thread(thread_id, db) + 1
        question_block = Block(type="text", content={"data": question}, position=1)
        user_msg = Message(
            thread_id=thread_id, order=order, role="user", blocks=[question_block]
        )
        answer_blocks = []
        for i, block in enumerate(chat_response.content):
            answer_block = Block(type=block.type, position=i + 1)
            if block.type == "text":
                answer_block.content = {"data": block.data}
            elif block.type == "picture":
                answer_block.content = {
                    "data": block.data,
                    "name": block.name,
                    "format": block.format,
                }
            elif block.type == "image":
                answer_block.content = {"url": block.url}
            elif block.type == "code":
                answer_block.content = {"language": block.language, "data": block.data}
            answer_blocks.append(answer_block)
        assistant_msg = Message(
            thread_id=thread_id,
            order=order + 1,
            role="assistant",
            blocks=answer_blocks,
        )
        question_msg = save_message(user_msg, db)
        answer_msg = save_message(assistant_msg, db)
        bg_tasks.add_task(update_thread_topic, thread_id, db)
    except Exception as e:
        logger.error(f"Error saving message: {e}")
    yield json.dumps({"type": "metadata", "content": chat_response.model_dump()}) + "\n"
    return

from langchain_core.prompts import PromptTemplate

from app.schemas.file_schemas import FileSummary
from app.services.llm import load_model

PROMPT_TEMPLATES_PATH = "app/agents/prompts"

llm = load_model()

structured_llm = llm.with_structured_output(
    schema=FileSummary.model_json_schema(), method="json_schema"
)

summarizer_prompt = PromptTemplate.from_file(
    f"{PROMPT_TEMPLATES_PATH}/summarizer.txt", template_format="jinja2"
)

summarizer = summarizer_prompt | llm.with_structured_output(FileSummary)

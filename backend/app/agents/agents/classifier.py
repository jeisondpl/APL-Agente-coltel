from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from app.schemas.schemas import Intent
from app.services.llm import load_model

PROMPT_TEMPLATES_PATH = "app/agents/prompts"

llm = load_model()

parser = PydanticOutputParser(pydantic_object=Intent)

classifier_prompt = PromptTemplate.from_file(
    f"{PROMPT_TEMPLATES_PATH}/classifier.txt", template_format="jinja2"
)

classifier = classifier_prompt | llm | parser

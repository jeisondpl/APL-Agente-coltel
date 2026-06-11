import httpx
from langchain_openai import ChatOpenAI

from app.core.config import settings


def load_model():
    """Loads the appropriate LLM model based on the specified provider."""
    llm = ChatOpenAI(
        model=settings.openai_llm_name,
        temperature=0,
        api_key=settings.openai_api_key,
        http_client=httpx.Client(verify=False),
    )
    return llm

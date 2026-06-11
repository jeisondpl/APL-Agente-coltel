from typing import List

from openai import OpenAI

from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)

EMBEDDINGS_MODEL = "text-embedding-3-small"


def embed_texts(texts: List[str]):
    """Embed texts using the OpenAI API."""
    response = client.embeddings.create(model=EMBEDDINGS_MODEL, input=texts)
    vectors = [item.embedding for item in response.data]
    return vectors

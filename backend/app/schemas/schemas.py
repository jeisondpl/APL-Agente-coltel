from typing import List, Literal, Optional

from pydantic import BaseModel, Field


class LLMConfig(BaseModel):
    temperature: float = 0.0
    max_tokens: int = 256


class QueryData(BaseModel):
    question: str
    limit: int = 5
    thread_id: Optional[str] = None
    config: LLMConfig = Field(default_factory=LLMConfig)


class TextBlock(BaseModel):
    type: Literal["text"]
    data: str


class ImageBlock(BaseModel):
    type: Literal["image"]
    url: str


class PictureBlock(BaseModel):
    type: Literal["picture"]
    data: str
    name: Optional[str] = None
    format: str


class CodeBlock(BaseModel):
    type: Literal["code"]
    language: str
    data: str


ContentBlock = TextBlock | ImageBlock | CodeBlock | PictureBlock


class ResponseContent(BaseModel):
    content: List[ContentBlock]


class ChatResponse(BaseModel):
    content: List[ContentBlock]
    thread_id: str
    sources: Optional[List[str]] = None


class Intent(BaseModel):
    """Represents the intent of a question."""
    topic: str = Field(description="The topic of the question")
    allowed: bool = Field(description="Whether the question is allowed to be answered")

from typing import Annotated, List, Optional, Sequence

from langchain_core.messages import AnyMessage
from langgraph.graph import add_messages
from langgraph.managed import IsLastStep
from pydantic import BaseModel, Field, ConfigDict
from pandas import DataFrame

from app.schemas.file_schemas import ChunkData, FileSummary, ImageData, PointData
from app.schemas.schemas import ChatResponse, ContentBlock, TextBlock


class FileState(BaseModel):
    filename: str
    content: Optional[bytes] = None
    extension: Optional[str] = None
    topic: Optional[str] = None
    summary: Optional[str] = None
    full_text: Optional[str] = None
    chunks: Optional[List[ChunkData]] = []
    vectors: Optional[List[List[float]]] = None
    points: Optional[List[PointData]] = None
    images: Optional[List[ImageData]] = []


class PdfState(FileState):
    filename: str
    content: bytes
    full_text: Optional[str] = None
    summary: Optional[str] = None
    chunks: Optional[List[ChunkData]] = []
    images: Optional[List[ImageData]] = []
    enriched_text: Optional[str] = None


class DocxState(FileState):
    filename: str
    content: bytes
    full_text: Optional[str] = None
    summary: Optional[str] = None
    chunks: Optional[List[ChunkData]] = []
    images: Optional[List[ImageData]] = []


class ExcelState(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    filename: str
    content: Optional[bytes] = None
    data: Optional[DataFrame] = None
    payloads: Optional[List[dict]] = None
    full_text: Optional[str] = None
    vectors: Optional[List[List[float]]] = None
    points: Optional[List[PointData]] = None


class QueryInputState(BaseModel):
    limit: Optional[int] = 5
    messages: Annotated[Sequence[AnyMessage], add_messages] = Field(
        default_factory=list
    )
    thread_id: Optional[str] = None


class QueryState(QueryInputState):
    question: Optional[str] = None
    topic: Optional[str] = None
    allowed: Optional[bool] = None
    splits: Optional[List] = []
    answer: Optional[TextBlock] = None
    sources: Optional[List[FileSummary]] = []
    titles: Optional[List[str]] = []
    points: Optional[List] = []
    images: Optional[List[ContentBlock]] = []
    content: Optional[List[ContentBlock]] = []
    response: Optional[ChatResponse] = None
    is_last_step: IsLastStep = Field(default=False)
    step: Optional[str] = None

    def to_chat_response(self) -> ChatResponse:
        return ChatResponse(
            content=self.content,
            thread_id=str(self.thread_id),
            sources=self.titles if self.titles else [],
        )

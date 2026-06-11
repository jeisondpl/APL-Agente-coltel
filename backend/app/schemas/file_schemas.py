from typing import List, Optional

from pydantic import BaseModel


class FileData(BaseModel):
    filename: str
    extension: str
    size: int
    text: str
    summary: str


class ImageData(BaseModel):
    name: str
    image_type: Optional[str] = None
    parent_file: Optional[str] = None
    title: Optional[str] = None
    caption: Optional[str] = None
    description: Optional[str] = None


class ChunkData(BaseModel):
    text: str
    chunk_type: str
    parent_file: Optional[str] = None
    order: Optional[int] = None
    enriched_text: Optional[str] = None
    image_file: Optional[str] = None


class PointData(BaseModel):
    id: str
    vector: List[float]
    payload: dict


class FileSummary(BaseModel):
    title: str
    summary: str

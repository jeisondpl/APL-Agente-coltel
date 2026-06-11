import logging
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.services.storage_service import (
    list_top_level_folders,
    get_object_stream,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sources", tags=["sources"])


BUCKET_NAME = settings.bucket_name


@router.get("/folders")
async def get_top_level_folders(path: str = ""):
    """List all top level folders in the bucket."""
    result = list_top_level_folders(bucket_name=BUCKET_NAME, path=path)
    return {"folders": result}


@router.get("/download")
async def download_file_from_storage(filename: str):
    """Download a file from storage."""
    path = Path(filename)
    object_name = filename
    file_stream = get_object_stream(object_name, path, bucket_name=BUCKET_NAME)
    return StreamingResponse(
        file_stream,
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

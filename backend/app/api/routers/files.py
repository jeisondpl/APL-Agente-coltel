from celery import states
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.dependencies import require_admin
from app.celery_tasks.tasks import process_file_task
from app.core.config import settings
from app.services.file_service import drop_source, get_task_status, process_file
from app.services.storage_service import upload_file

COLLECTION_NAME = settings.collection_name

router = APIRouter(
    prefix="/admin/files", tags=["files"], dependencies=[Depends(require_admin)]
)


@router.post("/", include_in_schema=False)
async def save_file(file: UploadFile = File(...)):
    """Upload a file to the vector store and bucket."""
    file_bytes = await file.read()
    return {"message": await process_file(file_bytes, file.filename)}


@router.delete("/")
async def delete_source(filename: str):
    """Delete a source from the vector store and bucket."""
    deleted = drop_source(filename)
    return {"deleted": deleted}


@router.post("/async")
async def upload_file_async(file: UploadFile = File(...)):
    """Upload a file to the vector store and bucket to be processed asynchronously."""
    uploaded = upload_file(file, file.filename)
    if not uploaded:
        return HTTPException(status_code=500, detail="Error uploading file")
    task_id = process_file_task.delay(filename=file.filename)
    return {"task_id": task_id.id, "status": str(states.PENDING)}


@router.get("/async")
async def get_task_status_async(task_id: str):
    """Get the status of an asynchronous task."""
    return get_task_status(task_id)

from app.agents.workflows.file_workflow import file_graph
from app.celery_tasks.worker import app
from app.services.qdrant_service import (
    drop_points_by_filter,
    make_filter_by_parent_file,
)
from app.services.storage_service import delete_folder


async def process_file(file_content: bytes, filename: str) -> dict:
    """Process an uploaded file and return its metadata."""
    result = await file_graph.ainvoke({"filename": filename, "content": file_content})
    return {
        "filename": result["filename"],
        "size": len(result["content"]),
        "text": result["full_text"],
        "summary": result["summary"],
        "images": result["images"],
    }


def get_task_status(task_id: str):
    """Function to get task status."""
    result = app.AsyncResult(task_id)
    return {"task_id": task_id, "status": str(result.state)}


def drop_source(filename: str) -> bool:
    """Delete a source from the vector store and bucket."""
    folder = filename
    deleted_files = delete_folder(folder)
    deleted_vectors = drop_points_by_filter(
        query_filter=make_filter_by_parent_file([filename])
    )
    return deleted_files

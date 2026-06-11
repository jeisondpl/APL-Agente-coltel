import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, require_admin
from app.crud.thread import (
    drop_thread_by_id,
    get_thread,
    get_threads_by_user_id,
    get_threads_by_username,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/admin/threads", tags=["threads"], dependencies=[Depends(require_admin)]
)


@router.get("/")
async def list_threads_by_user_id(user_id: str, db: Session = Depends(get_db)):
    """List all threads for a given user."""
    result = get_threads_by_user_id(user_id, db)
    return {"threads": result}


@router.get("/by-username")
async def list_threads_by_username(username: str, db: Session = Depends(get_db)):
    """List all threads for a given username."""
    result = get_threads_by_username(username, db)
    return {"threads": result}


@router.get("/{thread_id}")
async def get_thread_with_messages(thread_id: str, db: Session = Depends(get_db)):
    """Get a thread with its messages."""
    result = get_thread(thread_id, db)
    return {"thread": result}


@router.delete("/{thread_id}")
async def delete_thread(thread_id: str, db: Session = Depends(get_db)):
    """Delete a thread."""
    return drop_thread_by_id(thread_id, db)

import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.crud.thread import (
    delete_user_thread,
    get_threads_by_user_id,
    get_user_thread,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/me/threads", tags=["me"])


@router.get("/")
async def list_threads(request: Request, db: Session = Depends(get_db)):
    """List all threads for a given user."""
    user_id = request.state.user_context.id
    result = get_threads_by_user_id(user_id, db)
    return {"threads": result}


@router.get("/{thread_id}")
async def get_user_thread_with_messages(
    request: Request, thread_id: str, db: Session = Depends(get_db)
):
    """Get a thread with its messages for a given user."""
    user_id = request.state.user_context.id
    thread = get_user_thread(thread_id, user_id, db)
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    return {"thread": thread}


@router.delete("/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
async def drop_user_thread(
    request: Request, thread_id: str, db: Session = Depends(get_db)
):
    """Delete a thread."""
    user_id = request.state.user_context.id
    deleted = delete_user_thread(
        db=db,
        thread_id=thread_id,
        user_id=user_id,
    )
    if not deleted:
        raise HTTPException(status_code=404)
    return None

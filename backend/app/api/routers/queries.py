import logging

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.crud.thread import update_thread_topic
from app.schemas.schemas import QueryData
from app.services.query_service import (
    query_agent,
    query_agent_stream,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/queries", tags=["queries"])


@router.post("/agent", include_in_schema=False)
async def answer_with_agent(
    request: Request,
    query: QueryData,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Answer query using the agent workflow."""
    user_id = request.state.user_context.id
    response = await query_agent(
        query.question, query.thread_id, user_id, db, query.limit
    )
    background_tasks.add_task(update_thread_topic, response.thread_id, db)
    return {"answer": response}


@router.post("/chat")
async def chat_stream(
    request: Request,
    query: QueryData,
    bg_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Stream chat response for a given question."""
    user_id = request.state.user_context.id
    response = StreamingResponse(
        query_agent_stream(
            query.question, query.thread_id, user_id, bg_tasks, db, query.limit
        )
    )
    return response

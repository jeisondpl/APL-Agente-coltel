from sqlalchemy.orm import Session

from app.models.message import Message
from app.models.block import Block
from app.schemas.schemas import ChatResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload


def get_messages_by_thread_id(thread_id: str, db: Session):
    """Get the messages for a given thread."""
    messages = (
        db.query(Message)
        .filter(Message.thread_id == thread_id)
        .order_by(Message.order)
        .all()
    )
    return messages


def get_last_message_order_from_thread(thread_id: str, db: Session):
    """Get the last message order for a given thread."""
    message = (
        db.query(Message)
        .filter(Message.thread_id == thread_id)
        .order_by(Message.order.desc())
        .first()
    )
    if message:
        return message.order
    return 0


def save_message(message, db: Session):
    """Save a message to the database."""
    db.add(message)
    db.commit()
    db.refresh(message)
    return get_message(message.id, db)


def save_user_message(question: str, thread_id: str, db: Session):
    """Save a user message to the database."""
    order = get_last_message_order_from_thread(thread_id, db) + 1
    question_block = Block(type="text", content=question)
    message = Message(
        thread_id=thread_id, role="user", blocks=[question_block], order=order
    )
    saved_message = save_message(message, db)
    return saved_message


def save_assistant_message(chat_response: ChatResponse, thread_id: str, db: Session):
    """Save an assistant message to the database."""
    order = get_last_message_order_from_thread(thread_id, db) + 1
    answer_blocks = []
    for i, block in enumerate(chat_response.content):
        answer_block = Block(type=block.type, position=i + 1)
        if block.type == "text":
            answer_block.content = {"data": block.data}
        elif block.type == "picture":
            answer_block.content = {
                "data": block.data,
                "name": block.name,
                "format": block.format,
            }
        elif block.type == "image":
            answer_block.content = {"url": block.url}
        elif block.type == "code":
            answer_block.content = {"language": block.language, "data": block.data}
        answer_blocks.append(answer_block)
    message = Message(
        thread_id=thread_id,
        order=order,
        role="assistant",
        blocks=answer_blocks,
    )
    saved_message = save_message(message, db)
    return saved_message


def get_parts_by_message_id(message_id: str, db):
    """Get the parts for a given message."""
    parts = (
        db.query(Block)
        .filter(Block.message_id == message_id)
        .order_by(Block.position)
        .all()
    )
    return parts


def get_message(message_id: str, db):
    """Get a message with its parts by its ID."""
    stmt = (
        select(Message)
        .options(selectinload(Message.blocks))
        .where(Message.id == message_id)
    )
    return db.scalar(stmt)

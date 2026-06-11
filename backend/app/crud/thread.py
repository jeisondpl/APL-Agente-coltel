from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.models.message import Message
from app.models.thread import Thread
from app.models.user_data import UserData
from app.services.llm import load_model

llm = load_model()


def create_new_thread(user_id, db: Session):
    """Create a new thread."""
    new_thread = Thread(user_id=user_id)
    db.add(new_thread)
    db.commit()
    db.refresh(new_thread)
    return new_thread.id


def get_threads_by_user_id(user_id: str, db: Session):
    """Get the threads for a given user."""
    threads = (
        db.query(Thread)
        .filter(Thread.user_id == user_id)
        .order_by(Thread.created_at.desc())
        .all()
    )
    return threads


def get_thread(thread_id: str, db: Session):
    """Get the threads for a given user."""
    stmt = (
        select(Thread)
        .options(selectinload(Thread.messages).selectinload(Message.blocks))
        .where(Thread.id == thread_id)
    )
    return db.scalar(stmt)


def get_threads_by_username(username: str, db: Session):
    """Get the threads for a given msisdn."""
    threads = (
        db.query(Thread)
        .join(UserData)
        .filter(UserData.username == username)
        .order_by(Thread.created_at.desc())
        .all()
    )
    return threads


def update_thread_topic(thread_id: str, db: Session):
    """Extract the topic from the thread messages."""
    thread = get_thread(thread_id, db)
    if not thread.messages:
        return None
    prompt = (
        "Analyze the following conversation and generate a concise, descriptive title "
        "that captures its main essence. The title should be clear, specific, "
        "and between 5-10 words. Use the same language as the conversation."
        "\n\nConversation:\n"
    )
    for message in thread.messages:
        text = ""
        for block in message.blocks:
            if block.type != "text":
                continue
            text += block.content["data"]
        prompt += f"{message.role}: {text}\n"
    prompt += "\nTitle:"
    topic = llm.invoke(prompt).content.strip().strip('"')
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    thread.topic = topic
    db.commit()
    db.refresh(thread)
    return topic


def thread_exists(thread_id: str, db: Session):
    """Check if a thread exists."""
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    return thread is not None


def drop_thread_by_id(thread_id: str, db: Session):
    """Drop the thread by its ID."""
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if thread:
        db.delete(thread)
        db.commit()
        return {"message": "Thread deleted successfully"}
    else:
        return {"message": "Thread not found"}


def get_user_thread(thread_id: str, user_id: str, db: Session):
    """Get a user's thread by its ID."""
    stmt = (
        select(Thread)
        .options(selectinload(Thread.messages).selectinload(Message.blocks))
        .where(Thread.id == thread_id, Thread.user_id == user_id)
    )
    return db.scalar(stmt)


def delete_user_thread(thread_id: str, user_id: str, db: Session):
    """Delete a user's thread by its id for a given user."""
    stmt = delete(Thread).where(
        Thread.id == thread_id,
        Thread.user_id == user_id,
    )
    result = db.execute(stmt)
    db.commit()
    return result.rowcount > 0

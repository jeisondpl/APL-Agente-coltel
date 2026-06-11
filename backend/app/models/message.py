import uuid

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Message(Base):
    __tablename__ = "message"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("thread.id", ondelete="CASCADE"))
    order = Column(Integer, nullable=False)
    role = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    blocks = relationship("Block", order_by="Block.position", passive_deletes=True)

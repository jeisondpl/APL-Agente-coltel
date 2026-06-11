import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Thread(Base):
    __tablename__ = "thread"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user_data.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    topic = Column(String(255))
    user = relationship("UserData", back_populates="threads")
    messages = relationship("Message", order_by="Message.order", passive_deletes=True)

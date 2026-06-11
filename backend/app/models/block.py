import uuid

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.base import Base


class Block(Base):
    __tablename__ = "block"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(
        UUID(as_uuid=True), ForeignKey("message.id", ondelete="CASCADE")
    )
    type = Column(String(50))
    content = Column(JSONB)
    position = Column(Integer, nullable=False)

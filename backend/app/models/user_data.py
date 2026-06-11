import uuid

from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class UserData(Base):
    __tablename__ = "user_data"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String(60), nullable=False)
    last_name = Column(String(60), nullable=False)
    username = Column(String(60), nullable=False, unique=True)
    role = Column(String(60), nullable=False)
    threads = relationship("Thread", back_populates="user")

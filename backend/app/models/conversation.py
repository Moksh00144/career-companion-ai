import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.config.database import Base
from app.models.types import GUID


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), nullable=False, index=True)
    title = Column(String(255), default="New Conversation")
    mode = Column(String(50), default="general")
    metadata_ = Column("metadata", JSON, default=dict)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(
        GUID(),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role = Column(String(10), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    metadata_ = Column("metadata", JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

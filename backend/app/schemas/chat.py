from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    mode: Optional[str] = "general"


class ConversationResponse(BaseModel):
    id: str
    title: str
    mode: str
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0
    last_message: Optional[str] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    content: str
    mode: Optional[str] = "general"


class StreamingEvent(BaseModel):
    token: str
    finish_reason: Optional[str] = None
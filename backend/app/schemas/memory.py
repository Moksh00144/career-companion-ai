from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MemoryCreate(BaseModel):
    key: str
    value: str
    category: str = "fact"
    source: str = "manual"
    importance: int = 0


class MemoryUpdate(BaseModel):
    value: Optional[str] = None
    category: Optional[str] = None
    importance: Optional[int] = None


class MemoryResponse(BaseModel):
    id: str
    user_id: str
    key: str
    value: str
    category: str
    source: str
    confidence: float
    importance: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MemoryContext(BaseModel):
    """Memory context sent to the LLM for personalization."""
    memories: list[dict] = []
    user_profile: dict = {}
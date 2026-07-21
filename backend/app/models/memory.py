import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base
from app.models.types import GUID


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class MemoryEntry(Base):
    """Persistent AI memory entry for user context, facts, skills, and preferences."""

    __tablename__ = "memory_entries"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        GUID(),
        ForeignKey("user_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    key = Column(String(255), nullable=False)
    value = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, default="fact")
    source = Column(String(50), nullable=False, default="manual")
    confidence = Column(Float, default=1.0)
    importance = Column(Integer, default=0)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("UserProfile", back_populates="memories")

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "key": self.key,
            "value": self.value,
            "category": self.category,
            "source": self.source,
            "confidence": self.confidence,
            "importance": self.importance,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.config.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    s3_key = Column(String(500))
    file_size_bytes = Column(Integer)
    extracted_text = Column(Text)
    metadata_ = Column("metadata", Text)
    created_at = Column(DateTime, default=datetime.utcnow)
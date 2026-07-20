import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime
from app.config.database import Base
from app.models.types import GUID


class Document(Base):
    __tablename__ = "documents"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    s3_key = Column(String(500))
    file_size_bytes = Column(Integer)
    extracted_text = Column(Text)
    metadata_ = Column("metadata", Text)
    created_at = Column(DateTime, default=datetime.utcnow)

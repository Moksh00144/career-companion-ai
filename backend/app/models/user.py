import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.config.database import Base
from app.models.types import GUID


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    session_id = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255))
    current_role = Column(String(255))
    years_experience = Column(Integer)
    skills = Column(JSON, default=list)
    interests = Column(JSON, default=list)
    education = Column(JSON, default=dict)
    target_role = Column(String(255))
    resume_text = Column(Text)
    resume_filename = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    career_profile = relationship(
        "CareerProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    activities = relationship(
        "Activity",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        GUID(),
        ForeignKey("user_profiles.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )
    resume_score = Column(Integer, default=0)
    interview_score = Column(Integer, default=0)
    skill_gap_score = Column(Integer, default=0)
    career_readiness = Column(Integer, default=0)
    overall_health = Column(Integer, default=0)
    last_interview_at = Column(DateTime)
    last_resume_analysis_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserProfile", back_populates="career_profile")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        GUID(),
        ForeignKey("user_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="activities")

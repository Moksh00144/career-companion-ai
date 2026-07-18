from pydantic import BaseModel
from typing import Optional, list
from datetime import datetime


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    current_role: Optional[str] = None
    years_experience: Optional[int] = None
    skills: Optional[list[str]] = None
    interests: Optional[list[str]] = None
    education: Optional[dict] = None
    target_role: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    session_id: str
    full_name: Optional[str] = None
    current_role: Optional[str] = None
    years_experience: Optional[int] = None
    skills: list[str] = []
    interests: list[str] = []
    education: Optional[dict] = None
    target_role: Optional[str] = None
    resume_filename: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CareerHealthResponse(BaseModel):
    overall: int
    resume_score: int
    interview_score: int
    skill_gap_score: int
    career_readiness: int
    last_updated: Optional[datetime] = None


class ActivityResponse(BaseModel):
    id: str
    type: str
    title: str
    description: Optional[str] = None
    score: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
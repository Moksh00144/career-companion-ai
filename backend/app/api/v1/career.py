import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserProfile, CareerProfile, Activity
from app.schemas.user import UserProfileUpdate, UserProfileResponse, CareerHealthResponse, ActivityResponse
from app.api.deps import get_session_id, get_db_session
from app.api.v1.chat import get_or_create_user

router = APIRouter()


@router.get("/career/profile")
async def get_profile(
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Get user profile."""
    user = await get_or_create_user(db, session_id)
    return {
        "id": str(user.id),
        "session_id": user.session_id,
        "full_name": user.full_name,
        "current_role": user.current_role,
        "years_experience": user.years_experience,
        "skills": user.skills or [],
        "interests": user.interests or [],
        "education": user.education,
        "target_role": user.target_role,
        "resume_filename": user.resume_filename,
        "created_at": user.created_at,
    }


@router.put("/career/profile")
async def update_profile(
    data: UserProfileUpdate,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Update user profile."""
    user = await get_or_create_user(db, session_id)

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.current_role is not None:
        user.current_role = data.current_role
    if data.years_experience is not None:
        user.years_experience = data.years_experience
    if data.skills is not None:
        user.skills = data.skills
    if data.interests is not None:
        user.interests = data.interests
    if data.education is not None:
        user.education = data.education
    if data.target_role is not None:
        user.target_role = data.target_role

    user.updated_at = datetime.now(timezone.utc)
    await db.flush()

    return {
        "id": str(user.id),
        "session_id": user.session_id,
        "full_name": user.full_name,
        "current_role": user.current_role,
        "years_experience": user.years_experience,
        "skills": user.skills or [],
        "interests": user.interests or [],
        "education": user.education,
        "target_role": user.target_role,
        "resume_filename": user.resume_filename,
        "created_at": user.created_at,
    }


@router.get("/career/health")
async def get_career_health(
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Get career health scores."""
    user = await get_or_create_user(db, session_id)

    result = await db.execute(
        select(CareerProfile).where(CareerProfile.user_id == user.id)
    )
    career = result.scalar_one_or_none()

    if not career:
        return {
            "overall": 0,
            "resume_score": 0,
            "interview_score": 0,
            "skill_gap_score": 0,
            "career_readiness": 0,
            "last_updated": None,
        }

    return {
        "overall": career.overall_health or 0,
        "resume_score": career.resume_score or 0,
        "interview_score": career.interview_score or 0,
        "skill_gap_score": career.skill_gap_score or 0,
        "career_readiness": career.career_readiness or 0,
        "last_updated": career.updated_at,
    }


@router.get("/career/activities")
async def get_activities(
    limit: int = 10,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Get recent activities."""
    user = await get_or_create_user(db, session_id)

    result = await db.execute(
        select(Activity)
        .where(Activity.user_id == user.id)
        .order_by(desc(Activity.created_at))
        .limit(limit)
    )
    activities = result.scalars().all()

    return {
        "activities": [
            {
                "id": str(a.id),
                "type": a.type,
                "title": a.title,
                "description": a.description,
                "score": a.score,
                "created_at": a.created_at,
            }
            for a in activities
        ]
    }
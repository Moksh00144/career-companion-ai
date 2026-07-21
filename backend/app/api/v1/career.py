import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserProfile, CareerProfile, Activity
from app.schemas.user import UserProfileUpdate, UserProfileResponse, CareerHealthResponse, ActivityResponse
from app.api.deps import get_session_id, get_db_session
from app.api.v1.chat import get_or_create_user
from app.services.scoring_service import scoring_service

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
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.put("/career/profile")
async def update_profile(
    data: UserProfileUpdate,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Update user profile and recalculate scores."""
    user = await get_or_create_user(db, session_id)

    changed = False
    if data.full_name is not None:
        user.full_name = data.full_name
        changed = True
    if data.current_role is not None:
        user.current_role = data.current_role
        changed = True
    if data.years_experience is not None:
        user.years_experience = data.years_experience
        changed = True
    if data.skills is not None:
        user.skills = data.skills
        changed = True
    if data.interests is not None:
        user.interests = data.interests
        changed = True
    if data.education is not None:
        user.education = data.education
        changed = True
    if data.target_role is not None:
        user.target_role = data.target_role
        changed = True

    user.updated_at = datetime.now(timezone.utc)
    await db.flush()

    # Recalculate scores on profile update
    if changed:
        await scoring_service.update_scores(db, user)
        await scoring_service.log_activity(
            db, user, "profile_updated",
            "Profile Updated",
            "Career profile information was updated",
        )

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
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.get("/career/health")
async def get_career_health(
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Get career health scores (auto-calculated)."""
    user = await get_or_create_user(db, session_id)
    career = await scoring_service.update_scores(db, user)

    return {
        "overall": career.overall_health or 0,
        "resume_score": career.resume_score or 0,
        "interview_score": career.interview_score or 0,
        "skill_gap_score": career.skill_gap_score or 0,
        "career_readiness": career.career_readiness or 0,
        "last_updated": career.updated_at.isoformat() if career.updated_at else None,
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
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in activities
        ]
    }


@router.get("/career/dashboard")
async def get_dashboard(
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Get comprehensive dashboard data: scores + recent activity."""
    user = await get_or_create_user(db, session_id)
    data = await scoring_service.get_dashboard_data(db, user)
    return data
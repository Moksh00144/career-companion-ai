"""
Career Health Scoring Service for CareerForge AI.

Calculates and updates career health scores based on:
- User profile completeness
- Number and quality of interactions per mode
- Resume analysis results
- Interview practice scores
- Skill gap assessment
"""
import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserProfile, CareerProfile, Activity
from app.models.conversation import Conversation, Message


class ScoringService:
    """Service for calculating and managing career health scores."""

    async def calculate_profile_score(self, user: UserProfile) -> int:
        """Calculate a score (0-100) based on profile completeness."""
        score = 0
        fields = [
            (user.full_name, 10),
            (user.current_role, 15),
            (user.target_role, 15),
            (user.years_experience, 10),
            (user.skills, 15),
            (user.interests, 10),
            (user.education, 10),
            (user.resume_text, 15),
        ]
        for value, points in fields:
            if value:
                if isinstance(value, list):
                    if len(value) > 0:
                        score += points
                elif isinstance(value, dict):
                    if any(v for v in value.values()):
                        score += points
                else:
                    score += points
        return min(score, 100)

    async def calculate_interview_score(self, session: AsyncSession, user: UserProfile) -> int:
        """Calculate interview score based on interview practice sessions."""
        result = await session.execute(
            select(func.count(Message.id))
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(Conversation.session_id == user.session_id)
            .where(Conversation.mode == "interview")
            .where(Message.role == "assistant")
        )
        message_count = result.scalar() or 0
        return min(message_count * 10, 100)

    async def calculate_resume_score(self, session: AsyncSession, user: UserProfile) -> int:
        """Calculate resume score based on resume_analysis interactions and profile data."""
        base = 30 if user.resume_text else 0

        result = await session.execute(
            select(func.count(Message.id))
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(Conversation.session_id == user.session_id)
            .where(Conversation.mode == "resume_analysis")
            .where(Message.role == "assistant")
        )
        analysis_count = result.scalar() or 0

        return min(base + (analysis_count * 15), 100)

    async def calculate_skill_gap_score(self, session: AsyncSession, user: UserProfile) -> int:
        """Calculate skill gap score based on skill_gap interactions."""
        if not user.skills:
            return 0

        base = min(len(user.skills) * 10, 40)

        result = await session.execute(
            select(func.count(Message.id))
            .join(Conversation, Message.conversation_id == Conversation.id)
            .where(Conversation.session_id == user.session_id)
            .where(Conversation.mode == "skill_gap")
            .where(Message.role == "assistant")
        )
        analysis_count = result.scalar() or 0

        return min(base + (analysis_count * 15), 100)

    async def calculate_career_readiness(
        self,
        profile_score: int,
        resume_score: int,
        interview_score: int,
        skill_gap_score: int,
    ) -> int:
        """Calculate overall career readiness score."""
        weights = {
            "profile": 0.25,
            "resume": 0.30,
            "interview": 0.25,
            "skill_gap": 0.20,
        }
        overall = (
            profile_score * weights["profile"]
            + resume_score * weights["resume"]
            + interview_score * weights["interview"]
            + skill_gap_score * weights["skill_gap"]
        )
        return int(overall)

    async def update_scores(self, session: AsyncSession, user: UserProfile) -> CareerProfile:
        """Recalculate and persist all career health scores."""
        result = await session.execute(
            select(CareerProfile).where(CareerProfile.user_id == user.id)
        )
        career = result.scalar_one_or_none()

        if not career:
            career = CareerProfile(
                id=uuid.uuid4(),
                user_id=user.id,
            )
            session.add(career)

        profile_score = await self.calculate_profile_score(user)
        resume_score = await self.calculate_resume_score(session, user)
        interview_score = await self.calculate_interview_score(session, user)
        skill_gap_score = await self.calculate_skill_gap_score(session, user)
        overall = await self.calculate_career_readiness(
            profile_score, resume_score, interview_score, skill_gap_score
        )

        career.resume_score = resume_score
        career.interview_score = interview_score
        career.skill_gap_score = skill_gap_score
        career.career_readiness = overall
        career.overall_health = overall
        career.updated_at = datetime.now(timezone.utc)

        await session.flush()
        return career

    async def log_activity(
        self,
        session: AsyncSession,
        user: UserProfile,
        activity_type: str,
        title: str,
        description: Optional[str] = None,
        score: Optional[int] = None,
    ) -> Activity:
        """Log a user activity."""
        activity = Activity(
            id=uuid.uuid4(),
            user_id=user.id,
            type=activity_type,
            title=title,
            description=description,
            score=score,
            created_at=datetime.now(timezone.utc),
        )
        session.add(activity)
        await session.flush()
        return activity

    async def get_dashboard_data(
        self,
        session: AsyncSession,
        user: UserProfile,
    ) -> dict:
        """Get comprehensive dashboard data including scores and recent activity."""
        career = await self.update_scores(session, user)

        activities_result = await session.execute(
            select(Activity)
            .where(Activity.user_id == user.id)
            .order_by(Activity.created_at.desc())
            .limit(10)
        )
        activities = activities_result.scalars().all()

        return {
            "overall": career.overall_health or 0,
            "resume_score": career.resume_score or 0,
            "interview_score": career.interview_score or 0,
            "skill_gap_score": career.skill_gap_score or 0,
            "career_readiness": career.career_readiness or 0,
            "last_updated": career.updated_at.isoformat() if career.updated_at else None,
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
            ],
        }


scoring_service = ScoringService()
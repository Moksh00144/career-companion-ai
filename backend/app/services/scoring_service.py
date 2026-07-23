"""
Career Health Scoring Service for CareerForge AI.

Calculates and updates career health scores based on:
- User profile completeness
- Number and quality of interactions per mode
- AI-extracted scores from chat responses
"""
import re
import uuid
import logging
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserProfile, CareerProfile, Activity
from app.models.conversation import Conversation, Message
from app.models.memory import MemoryEntry

logger = logging.getLogger(__name__)


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

    def extract_scores_from_text(self, text: str) -> dict[str, int]:
        """Extract and clamp only the score labels present in streamed AI text."""
        scores: dict[str, int] = {}
        patterns = {
            "resume_score": r"(?:resume\s*score|resume\s*rating|ats\s*score)[:\s]*(\d{1,3})",
            "interview_score": r"(?:interview\s*score|interview\s*rating|mock\s*score)[:\s]*(\d{1,3})",
            "skill_gap_score": r"(?:skill\s*gap\s*score|skill\s*gap\s*rating|gap\s*score)[:\s]*(\d{1,3})",
            "career_readiness": r"(?:career\s*readiness|readiness\s*score|career\s*health)[:\s]*(\d{1,3})",
        }
        for field, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                scores[field] = max(0, min(100, int(match.group(1))))
        if scores:
            logger.info("Extracted scores from streamed response: %s", scores)
        else:
            logger.warning("No score labels found in streamed response; CareerProfile will not be changed")
        return scores

    async def update_scores(
        self,
        session: AsyncSession,
        user: UserProfile,
        ai_scores: Optional[dict[str, int]] = None,
    ) -> CareerProfile:
        """Update career health scores.

        If ai_scores is provided, those values are stored directly.
        Otherwise, heuristic scores are calculated from profile + activity.
        AI scores override heuristics but only for the keys provided.
        """
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

        # Log before state
        before = {
            "resume_score": career.resume_score,
            "interview_score": career.interview_score,
            "skill_gap_score": career.skill_gap_score,
            "career_readiness": career.career_readiness,
            "overall_health": career.overall_health,
        }

        if ai_scores is not None:
            # AI scores: only update keys that were found, clamp 0-100
            if "resume_score" in ai_scores:
                career.resume_score = max(0, min(100, ai_scores["resume_score"]))
            if "interview_score" in ai_scores:
                career.interview_score = max(0, min(100, ai_scores["interview_score"]))
            if "skill_gap_score" in ai_scores:
                career.skill_gap_score = max(0, min(100, ai_scores["skill_gap_score"]))
            if "career_readiness" in ai_scores:
                career.career_readiness = max(0, min(100, ai_scores["career_readiness"]))
                career.overall_health = career.career_readiness
        else:
            # Heuristic: calculate from profile + activity counts
            profile_score = await self.calculate_profile_score(user)
            career.resume_score = max(0, min(100, profile_score))
            career.interview_score = 0
            career.skill_gap_score = 0
            career.career_readiness = profile_score
            career.overall_health = profile_score

        career.updated_at = datetime.now(timezone.utc)
        await session.flush()

        # Log after state
        after = {
            "resume_score": career.resume_score,
            "interview_score": career.interview_score,
            "skill_gap_score": career.skill_gap_score,
            "career_readiness": career.career_readiness,
            "overall_health": career.overall_health,
        }
        logger.info(f"Score update for user {user.id}: before={before} after={after} ai_scores={ai_scores}")

        return career

    async def get_scores(
        self,
        session: AsyncSession,
        user: UserProfile,
    ) -> CareerProfile:
        """Read current scores from DB without recalculating."""
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
        """Get comprehensive dashboard data from DB (no recalculation)."""
        career = await self.get_scores(session, user)

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

    async def clear_user_data(
        self,
        session: AsyncSession,
        user: UserProfile,
    ) -> int:
        """Delete all user data. Returns count of deleted items."""
        # Delete in order: messages → conversations → memories → activities → career_profile → user_profile
        count = 0

        # Delete messages for all user conversations
        conv_result = await session.execute(
            select(Conversation).where(Conversation.session_id == user.session_id)
        )
        for conv in conv_result.scalars().all():
            await session.execute(
                delete(Message).where(Message.conversation_id == conv.id)
            )
            count += 1

        # Delete conversations
        result = await session.execute(
            delete(Conversation).where(Conversation.session_id == user.session_id)
        )
        count += result.rowcount

        # Delete memories
        result = await session.execute(
            delete(MemoryEntry).where(MemoryEntry.user_id == user.id)
        )
        count += result.rowcount

        # Delete activities
        result = await session.execute(
            delete(Activity).where(Activity.user_id == user.id)
        )
        count += result.rowcount

        # Delete career profile
        result = await session.execute(
            delete(CareerProfile).where(CareerProfile.user_id == user.id)
        )
        count += result.rowcount

        # Delete user profile
        result = await session.execute(
            delete(UserProfile).where(UserProfile.id == user.id)
        )
        count += result.rowcount

        await session.flush()
        logger.info(f"Cleared {count} items for user {user.id}")
        return count


scoring_service = ScoringService()

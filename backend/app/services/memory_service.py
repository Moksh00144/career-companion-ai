"""
Persistent AI Memory Service for CareerForge AI.

Stores, retrieves, and manages long-term user memories across sessions.
Memories are categorized, confidence-scored, and importance-ranked.
"""
import uuid
import re
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.memory import MemoryEntry
from app.models.user import UserProfile


MEMORY_CATEGORIES = {"skill", "preference", "goal", "fact", "experience", "achievement"}
MEMORY_SOURCES = {"manual", "user_input", "ai_extracted"}


class MemoryService:
    """Service for managing persistent AI memory."""

    async def add_memory(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        key: str,
        value: str,
        category: str = "fact",
        source: str = "manual",
        importance: int = 0,
    ) -> MemoryEntry:
        """Add a new memory entry or update existing one with same key."""
        key = key.strip().lower()
        key = re.sub(r"\s+", "_", key)

        result = await session.execute(
            select(MemoryEntry).where(
                MemoryEntry.user_id == user_id,
                MemoryEntry.key == key,
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.value = value
            existing.category = category or existing.category
            existing.source = source
            existing.confidence = min(1.0, existing.confidence + 0.1)
            existing.importance = max(existing.importance, importance)
            existing.updated_at = datetime.now(timezone.utc)
            await session.flush()
            return existing

        entry = MemoryEntry(
            id=uuid.uuid4(),
            user_id=user_id,
            key=key,
            value=value,
            category=category if category in MEMORY_CATEGORIES else "fact",
            source=source if source in MEMORY_SOURCES else "manual",
            confidence=1.0,
            importance=importance,
        )
        session.add(entry)
        await session.flush()
        return entry

    async def get_memories(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        category: Optional[str] = None,
        min_importance: int = 0,
        limit: int = 50,
    ) -> list[MemoryEntry]:
        """Retrieve memories with optional filtering."""
        query = (
            select(MemoryEntry)
            .where(MemoryEntry.user_id == user_id)
        )
        if category:
            query = query.where(MemoryEntry.category == category)
        if min_importance > 0:
            query = query.where(MemoryEntry.importance >= min_importance)

        query = query.order_by(
            MemoryEntry.importance.desc(),
            MemoryEntry.updated_at.desc(),
        ).limit(limit)

        result = await session.execute(query)
        return list(result.scalars().all())

    async def get_memory_by_key(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        key: str,
    ) -> Optional[MemoryEntry]:
        """Retrieve a specific memory by key."""
        result = await session.execute(
            select(MemoryEntry).where(
                MemoryEntry.user_id == user_id,
                MemoryEntry.key == key.strip().lower(),
            )
        )
        return result.scalar_one_or_none()

    async def delete_memory(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        memory_id: uuid.UUID,
    ) -> bool:
        """Delete a specific memory entry."""
        result = await session.execute(
            delete(MemoryEntry).where(
                MemoryEntry.id == memory_id,
                MemoryEntry.user_id == user_id,
            )
        )
        return result.rowcount > 0

    async def delete_memory_by_key(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        key: str,
    ) -> bool:
        """Delete memory by key name."""
        result = await session.execute(
            delete(MemoryEntry).where(
                MemoryEntry.user_id == user_id,
                MemoryEntry.key == key.strip().lower(),
            )
        )
        return result.rowcount > 0

    async def clear_memories(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
    ) -> int:
        """Delete all memories for a user. Returns count deleted."""
        result = await session.execute(
            delete(MemoryEntry).where(MemoryEntry.user_id == user_id)
        )
        return result.rowcount

    async def get_memory_count(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
    ) -> int:
        """Get total memory count for a user."""
        result = await session.execute(
            select(func.count(MemoryEntry.id))
            .where(MemoryEntry.user_id == user_id)
        )
        return result.scalar() or 0

    async def format_memory_context(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
    ) -> str:
        """Format memories as a context string for the LLM system prompt."""
        memories = await self.get_memories(session, user_id, min_importance=1)
        memories = [memory for memory in memories if memory.key != "ai_preferences"]

        if not memories:
            return ""

        sections: dict[str, list[str]] = {}
        for mem in memories:
            cat = mem.category.capitalize()
            if cat not in sections:
                sections[cat] = []
            sections[cat].append(f"- {mem.key}: {mem.value}")

        lines = ["## About You (Persistent Memory)"]
        for cat, items in sections.items():
            lines.append(f"\n### {cat}")
            lines.extend(items)

        return "\n".join(lines)

    async def extract_memories_from_text(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        text: str,
        source: str = "user_input",
    ) -> list[MemoryEntry]:
        """Extract structured memories from natural language text.

        Detects patterns like:
        - "I am a software engineer" → skill/role memory
        - "I want to become a manager" → goal memory
        - "I know Python" → skill memory
        - "I prefer remote work" → preference memory
        """
        created: list[MemoryEntry] = []
        patterns = {
            r"(?:i am|i'm|i work as)\s+a[n]?\s+([\w\s]+?)(?:\.|,|$|\s+and)": "fact",
            r"(?:i want to|i'd like to|my goal is to|i aspire to)\s+([\w\s]+?)(?:\.|,|$| and)": "goal",
            r"(?:i know|i have experience in|proficient in|skilled in|expertise in)\s+([\w\s+#]+?)(?:\.|,|$|\s+and)": "skill",
            r"(?:i (?:prefer|like|love|enjoy)\s+([\w\s]+?)(?:\.|,|$|\s+and))": "preference",
            r"(?:i have\s+(\d+)\s+years? of experience)": "experience",
            r"(?:my current role is|currently working as)\s+([\w\s]+?)(?:\.|,|$|\s+as)": "fact",
        }

        for pattern, category in patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                value = match.strip().rstrip(".,;!?")
                if len(value) > 3 and len(value) < 200:
                    key = value.lower().replace(" ", "_")[:255]
                    entry = await self.add_memory(
                        session=session,
                        user_id=user_id,
                        key=key,
                        value=value,
                        category=category,
                        source=source,
                        importance=2,
                    )
                    created.append(entry)

        return created

    async def get_full_context(
        self,
        session: AsyncSession,
        user: UserProfile,
    ) -> dict:
        """Build comprehensive user context combining profile and memories."""
        memory_text = await self.format_memory_context(session, user.id)
        preference = await self.get_memory_by_key(session, user.id, "ai_preferences")

        profile_context = {
            "target_role": user.target_role or "",
            "current_role": user.current_role or "",
            "years_experience": user.years_experience or 0,
            "skills": user.skills or [],
            "interests": user.interests or [],
        }

        return {
            **profile_context,
            "memory_text": memory_text,
            "ai_preference": preference.value.strip() if preference else "",
            "memory_count": await self.get_memory_count(session, user.id),
        }


memory_service = MemoryService()

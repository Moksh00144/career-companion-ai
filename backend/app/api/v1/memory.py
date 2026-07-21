"""API routes for persistent AI memory management."""
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserProfile
from app.schemas.memory import MemoryCreate, MemoryUpdate
from app.services.memory_service import memory_service
from app.api.deps import get_session_id, get_db_session
from app.api.v1.chat import get_or_create_user

router = APIRouter()


@router.get("/memory/count")
async def memory_count(
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Get total memory count. Must be before /memory/{memory_id}."""
    user = await get_or_create_user(db, session_id)
    count = await memory_service.get_memory_count(db, user.id)
    return {"count": count}


@router.get("/memory")
async def list_memories(
    category: str = Query(None),
    min_importance: int = Query(0, ge=0, le=5),
    limit: int = Query(50, ge=1, le=200),
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """List all memory entries for the current user."""
    user = await get_or_create_user(db, session_id)
    memories = await memory_service.get_memories(
        db, user.id, category=category, min_importance=min_importance, limit=limit
    )
    count = await memory_service.get_memory_count(db, user.id)
    return {"memories": [m.to_dict() for m in memories], "total": count}


@router.post("/memory")
async def create_memory(
    data: MemoryCreate,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Create a new memory entry manually."""
    user = await get_or_create_user(db, session_id)
    entry = await memory_service.add_memory(
        session=db,
        user_id=user.id,
        key=data.key,
        value=data.value,
        category=data.category,
        source=data.source,
        importance=data.importance,
    )
    return entry.to_dict()


@router.post("/memory/extract")
async def extract_memories(
    text: str = Query(..., min_length=10, max_length=4000),
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Extract memories from natural language text."""
    user = await get_or_create_user(db, session_id)
    entries = await memory_service.extract_memories_from_text(
        db, user.id, text, source="user_input"
    )
    return {"extracted": len(entries), "memories": [e.to_dict() for e in entries]}


@router.delete("/memory")
async def clear_memories(
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Clear all memories for the current user."""
    user = await get_or_create_user(db, session_id)
    count = await memory_service.clear_memories(db, user.id)
    return {"status": "cleared", "count": count}


@router.get("/memory/{memory_id}")
async def get_memory(
    memory_id: uuid.UUID,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Get a specific memory entry by ID."""
    user = await get_or_create_user(db, session_id)
    memories = await memory_service.get_memories(db, user.id, limit=200)
    for m in memories:
        if str(m.id) == str(memory_id):
            return m.to_dict()
    raise HTTPException(status_code=404, detail="Memory not found")


@router.put("/memory/{memory_id}")
async def update_memory(
    memory_id: uuid.UUID,
    data: MemoryUpdate,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Update a memory entry."""
    user = await get_or_create_user(db, session_id)
    memories = await memory_service.get_memories(db, user.id, limit=200)
    for m in memories:
        if str(m.id) == str(memory_id):
            if data.value is not None:
                m.value = data.value
            if data.category is not None:
                m.category = data.category
            if data.importance is not None:
                m.importance = data.importance
            await db.flush()
            return m.to_dict()
    raise HTTPException(status_code=404, detail="Memory not found")


@router.delete("/memory/{memory_id}")
async def delete_memory(
    memory_id: uuid.UUID,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Delete a memory entry."""
    user = await get_or_create_user(db, session_id)
    deleted = await memory_service.delete_memory(db, user.id, memory_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Memory not found")
    return {"status": "deleted"}
from fastapi import Header, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.config.database import get_db


async def get_session_id(
    x_session_id: str = Header(default=None, description="Guest session ID"),
) -> str:
    """Extract session ID from header."""
    if not x_session_id:
        raise HTTPException(status_code=401, detail="Session ID required")
    return x_session_id


async def get_db_session() -> AsyncSession:
    """Get database session."""
    async for session in get_db():
        yield session
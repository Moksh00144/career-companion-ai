import uuid
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.conversation import Conversation, Message
from app.models.user import UserProfile, CareerProfile, Activity
from app.schemas.chat import ConversationCreate
from app.services.llm_service import llm_service
from app.services.memory_service import memory_service
from app.services.scoring_service import scoring_service
from app.api.deps import get_session_id, get_db_session

router = APIRouter()


async def get_or_create_user(session: AsyncSession, session_id: str) -> UserProfile:
    """Get existing user profile or create a new one."""
    result = await session.execute(
        select(UserProfile).where(UserProfile.session_id == session_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        user = UserProfile(
            id=uuid.uuid4(),
            session_id=session_id,
        )
        session.add(user)

        career = CareerProfile(
            id=uuid.uuid4(),
            user_id=user.id,
        )
        session.add(career)

        # Flush once so both new objects are visible to subsequent SELECTs
        # in the same transaction (required by async SQLAlchemy sessions).
        await session.flush()

    return user


async def get_user_context(session: AsyncSession, user_id: uuid.UUID) -> dict:
    """Build comprehensive user context from profile AND persistent memory."""
    result = await session.execute(
        select(UserProfile).where(UserProfile.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        return {}

    context = await memory_service.get_full_context(session, user)
    context["resume_text"] = (user.resume_text or "")[:2000]
    return context


async def log_chat_activity(
    session: AsyncSession,
    user: UserProfile,
    mode: str,
    content: str,
    ai_response: str = "",
):
    """Log chat activity for dashboard tracking."""
    activity_map = {
        "interview": ("interview_practice", "Mock Interview Session", f"Practiced interview with AI"),
        "resume_analysis": ("resume_analyzed", "Resume Analysis", "Resume was analyzed by AI"),
        "skill_gap": ("skill_gap_analysis", "Skill Gap Analysis", f"Analyzed skills for target role"),
        "career_advice": ("career_strategy", "Career Strategy Session", "Received career guidance"),
    }
    act_type, title, desc = activity_map.get(
        mode, ("general_chat", "Chat Session", "Had a conversation with AI")
    )
    await scoring_service.log_activity(
        session, user, act_type, title,
        description=f"{desc}: {content[:80]}..." if len(content) > 80 else desc,
    )

    # Extract AI scores from the response and update career profile
    ai_scores = scoring_service.extract_scores_from_text(ai_response)
    await scoring_service.update_scores(session, user, ai_scores=ai_scores)


def _serialize_conv(conv: Conversation, msg_count: int = 0, last_message: str | None = None) -> dict:
    return {
        "id": str(conv.id),
        "title": conv.title,
        "mode": conv.mode,
        "is_archived": conv.is_archived,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
        "message_count": msg_count,
        "last_message": last_message,
    }


def _serialize_msg(msg: Message) -> dict:
    return {
        "id": str(msg.id),
        "conversation_id": str(msg.conversation_id),
        "role": msg.role,
        "content": msg.content,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


@router.get("/conversations")
async def list_conversations(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """List conversations for a session."""
    await get_or_create_user(db, session_id)

    count_result = await db.execute(
        select(func.count(Conversation.id))
        .where(Conversation.session_id == session_id)
        .where(Conversation.is_archived == False)
    )
    total = count_result.scalar()

    result = await db.execute(
        select(Conversation)
        .where(Conversation.session_id == session_id)
        .where(Conversation.is_archived == False)
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    conversations = result.scalars().all()

    enriched = []
    for conv in conversations:
        msg_result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg = msg_result.scalar_one_or_none()

        msg_count_result = await db.execute(
            select(func.count(Message.id))
            .where(Message.conversation_id == conv.id)
        )
        msg_count = msg_count_result.scalar()

        enriched.append(_serialize_conv(
            conv,
            msg_count=msg_count,
            last_message=last_msg.content[:100] if last_msg else None,
        ))

    return {"conversations": enriched, "total": total}


@router.post("/conversations")
async def create_conversation(
    data: ConversationCreate,
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Create a new conversation."""
    user = await get_or_create_user(db, session_id)

    conversation = Conversation(
        id=uuid.uuid4(),
        session_id=session_id,
        title=data.title or "New Conversation",
        mode=data.mode or "general",
    )
    db.add(conversation)
    await db.flush()

    return _serialize_conv(conversation)


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
):
    """Get a specific conversation."""
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return _serialize_conv(conversation)


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
):
    """Delete a conversation and its messages."""
    await db.execute(
        delete(Conversation).where(Conversation.id == conversation_id)
    )
    return {"status": "deleted"}


@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
):
    """Get all messages in a conversation."""
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    messages = result.scalars().all()

    return [_serialize_msg(msg) for msg in messages]


@router.get("/conversations/{conversation_id}/stream")
async def stream_chat(
    conversation_id: uuid.UUID,
    content: str = Query(..., min_length=1, max_length=4000),
    mode: str = Query(None),
    session_id: str = Depends(get_session_id),
    db: AsyncSession = Depends(get_db_session),
):
    """Stream AI response for a conversation using SSE."""
    user = await get_or_create_user(db, session_id)
    user_context = await get_user_context(db, user.id)

    # Extract memories from user message
    await memory_service.extract_memories_from_text(
        db, user.id, content, source="user_input"
    )

    conv_result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    conversation = conv_result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Save user message
    user_message = Message(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        role="user",
        content=content,
    )
    db.add(user_message)

    # Get message history
    history_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    )
    history_messages = history_result.scalars().all()

    messages_for_llm = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
    ]

    async def generate():
        full_response = ""
        try:
            async for token in llm_service.stream_response(
                messages=messages_for_llm,
                mode=mode or conversation.mode,
                user_context=user_context,
            ):
                full_response += token
                yield f"data: {json.dumps({'type': 'chunk', 'token': token})}\n\n"

            # Save assistant message
            if full_response:
                ai_message = Message(
                    id=uuid.uuid4(),
                    conversation_id=conversation_id,
                    role="assistant",
                    content=full_response,
                )
                db.add(ai_message)

                # Log activity and update scores (pass AI response for score extraction)
                await log_chat_activity(db, user, mode or conversation.mode, content, ai_response=full_response)

                await db.commit()

            conversation.updated_at = datetime.now(timezone.utc)
            await db.commit()

            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        finally:
            yield f"data: {json.dumps({'type': 'close'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
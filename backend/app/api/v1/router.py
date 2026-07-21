from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.chat import router as chat_router
from app.api.v1.career import router as career_router
from app.api.v1.memory import router as memory_router

router = APIRouter()
router.include_router(health_router)
router.include_router(chat_router)
router.include_router(career_router)
router.include_router(memory_router)
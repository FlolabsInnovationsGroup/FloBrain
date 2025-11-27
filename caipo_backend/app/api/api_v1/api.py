
from fastapi import APIRouter
from caipo_backend.app.api.api_v1.endpoints import audio, chat

api_router = APIRouter()

api_router.include_router(audio.router, prefix="/audio", tags=["audio"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

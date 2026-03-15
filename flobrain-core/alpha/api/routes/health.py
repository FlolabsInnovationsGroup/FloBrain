from __future__ import annotations

from fastapi import APIRouter

from api.schemas import HealthResponse
from config.settings import settings
from services.llm import llm_service

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Check the health of the FloBrain service and its dependencies."""
    llm_status = await llm_service.health_check()

    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        services={
            "llm": llm_status,
            "app": "ok",
        },
    )

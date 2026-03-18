from fastapi import APIRouter

from agents.nlu import nlu_service

router = APIRouter()


@router.get("/nlu/analyze")
async def analyze_text(text: str) -> dict:
    """Debug endpoint: analyze text for intent and entities."""
    result = await nlu_service.analyze(text)
    return result.to_dict()

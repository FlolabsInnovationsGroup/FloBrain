from __future__ import annotations

import logging
import os
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile

from api.schemas import TranscriptionResponse
from services.transcription import TranscriptionError, transcription_service

logger = logging.getLogger(__name__)
router = APIRouter()

_ALLOWED_CONTENT_TYPES = {
    "audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav",
    "audio/ogg", "audio/flac", "audio/webm",
    "video/webm",  # WebM audio from browsers
}


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)) -> TranscriptionResponse:
    """
    Transcribe an uploaded audio file using faster-whisper.

    Accepts: mp3, mp4, wav, ogg, flac, webm.
    """
    if not transcription_service.is_available:
        raise HTTPException(
            status_code=503,
            detail=(
                "Transcription service is not available. "
                "Install faster-whisper: pip install faster-whisper"
            ),
        )

    # Save to a temp file for whisper
    suffix = _get_suffix(file.filename or "audio.wav")
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        content = await file.read()
        tmp.write(content)

    try:
        result = await transcription_service.transcribe(tmp_path)
        return TranscriptionResponse(
            text=result["text"],
            language=result.get("language"),
            segments=result.get("segments", []),
        )
    except TranscriptionError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def _get_suffix(filename: str) -> str:
    _, ext = os.path.splitext(filename)
    return ext if ext else ".wav"

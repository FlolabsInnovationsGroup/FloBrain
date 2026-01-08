
from fastapi import APIRouter, UploadFile, File, HTTPException
from caipo_backend.app.services import transcription
from caipo_backend.app.models.schemas import TranscriptionResponse
import shutil
import os
import tempfile

router = APIRouter()

@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    # Save upload to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        result = transcription.transcribe_audio(tmp_path)
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        # Format response (OpenAI verbose_json structure)
        text = result.get("text", "")
        segments = [
            {"start": s["start"], "end": s["end"], "text": s["text"]}
            for s in result.get("segments", [])
        ]
        return {"text": text, "segments": segments}
    finally:
        os.remove(tmp_path)

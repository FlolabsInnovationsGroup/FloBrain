
from pydantic import BaseModel
from typing import List, Optional

class TranscriptionSegment(BaseModel):
    start: float
    end: float
    text: str

class TranscriptionResponse(BaseModel):
    text: str
    segments: List[TranscriptionSegment] = []

class ChatRequest(BaseModel):
    message: str
    voice_id: Optional[str] = "JBFqnCBsd6RMkjVDRZzb"

class ChatResponse(BaseModel):
    response_text: str
    audio_content: Optional[str] = None # Base64 encoded audio

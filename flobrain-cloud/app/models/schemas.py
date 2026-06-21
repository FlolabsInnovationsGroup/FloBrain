from pydantic import BaseModel
from typing import List, Optional


class TranscriptionSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscriptionResponse(BaseModel):
    text: str
    segments: List[TranscriptionSegment] = []


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: Optional[str] = None
    messages: Optional[List[ChatMessage]] = None
    model: Optional[str] = None
    voice_id: Optional[str] = None


class ChatResponse(BaseModel):
    response_text: str
    audio_content: Optional[str] = None  # Base64 encoded audio
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    model: str = "gpt-3.5-turbo"
    provider: str = "openai"
    estimated: bool = False

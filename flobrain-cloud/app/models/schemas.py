from pydantic import BaseModel


class TranscriptionSegment(BaseModel):
    start: float
    end: float
    text: str


class TranscriptionResponse(BaseModel):
    text: str
    segments: list[TranscriptionSegment] = []


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str | None = None
    messages: list[ChatMessage] | None = None
    model: str | None = None
    voice_id: str | None = None


class ChatResponse(BaseModel):
    response_text: str
    audio_content: str | None = None  # Base64 encoded audio
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    model: str = "gpt-3.5-turbo"
    provider: str = "openai"
    estimated: bool = False

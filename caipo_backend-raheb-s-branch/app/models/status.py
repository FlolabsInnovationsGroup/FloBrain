# File: app/models/status.py

from pydantic import BaseModel, Field
from typing import Optional, Any, List
from app.db.models import FileStatus
import uuid

# This model defines a single segment from the Whisper transcript
class TranscriptSegment(BaseModel):
    id: int
    start: float
    end: float
    text: str

class StatusResponse(BaseModel):
    """
    Response model for the status endpoint.
    """
    file_id: uuid.UUID
    status: FileStatus
    message: str
    transcript_text: Optional[str] = Field(None, description="The full transcribed text, if completed.")
    segments: Optional[List[TranscriptSegment]] = Field(None, description="Timestamped segments, if completed.")
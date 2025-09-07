# File: app/db/models.py

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlmodel import Field, SQLModel

class FileStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class MediaFile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    file_id: uuid.UUID = Field(default_factory=uuid.uuid4, index=True, unique=True, nullable=False)
    filename: str
    content_type: Optional[str] = None
    status: FileStatus = Field(default=FileStatus.UPLOADED, nullable=False)
    file_path: str = Field(nullable=False)
    transcript_path: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False) # We can add logic to auto-update this
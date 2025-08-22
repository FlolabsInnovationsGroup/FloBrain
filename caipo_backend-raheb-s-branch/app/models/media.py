# File: app/models/media.py

from pydantic import BaseModel, Field
import uuid

class UploadResponse(BaseModel):
    """
    Standard response model for successful file uploads.
    """
    status: str = "success"
    file_id: uuid.UUID = Field(..., description="The unique identifier for the uploaded file.")
    filename: str = Field(..., description="The original name of the uploaded file.")

    class Config:
        # Pydantic's configuration class
        # This allows the model to be created from arbitrary class instances
        from_attributes = True
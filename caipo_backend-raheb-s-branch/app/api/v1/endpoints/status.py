# File: app/api/v1/endpoints/status.py

import logging
import uuid
import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db.database import get_session
from app.db.models import MediaFile
from app.models.status import StatusResponse

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get(
    "/{file_id}",
    response_model=StatusResponse,
    summary="Get the status and result of a processing job"
)
def get_job_status(
    file_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    """
    Retrieves the processing status of a file.

    - If the job is `completed`, it will also read the transcript file
      and return its content.
    - If the job is `processing` or `uploaded`, it returns the current status.
    - If the job `failed`, it returns a failure status.
    - If the `file_id` is not found, it returns a 404 error.
    """
    statement = select(MediaFile).where(MediaFile.file_id == file_id)
    media_file = session.exec(statement).one_or_none()

    if not media_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with file_id {file_id} not found."
        )

    response_data = {"file_id": media_file.file_id, "status": media_file.status}

    if media_file.status == "completed":
        response_data["message"] = "Processing completed successfully."
        try:
            transcript_path = Path(media_file.transcript_path)
            with transcript_path.open("r", encoding="utf-8") as f:
                transcript_data = json.load(f)
            response_data["transcript_text"] = transcript_data.get("text")
            response_data["segments"] = transcript_data.get("segments")
        except Exception as e:
            logger.error(f"Could not read transcript file for completed job {file_id}: {e}")
            # The job is complete but the file is missing/corrupt.
            # Return a different message to indicate this.
            response_data["message"] = "Processing completed, but the transcript result is currently unavailable."

    elif media_file.status == "processing":
        response_data["message"] = "File is currently being processed."
    elif media_file.status == "failed":
        response_data["message"] = "Processing failed. Please check server logs for details."
    else: # 'uploaded'
        response_data["message"] = "File is uploaded and waiting to be processed."

    return StatusResponse(**response_data)
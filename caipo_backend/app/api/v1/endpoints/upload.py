# File: app/api/v1/endpoints/upload.py

import logging
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, status

from app.models.media import UploadResponse
from app.services.transcription import process_and_transcribe_audio

logger = logging.getLogger(__name__)
router = APIRouter()

# Define data storage paths
DATA_PATH = Path("data")
AUDIO_PATH = DATA_PATH / "audio"
VIDEO_PATH = DATA_PATH / "video"

# Create directories on startup if they don't exist
AUDIO_PATH.mkdir(parents=True, exist_ok=True)
VIDEO_PATH.mkdir(parents=True, exist_ok=True)

@router.post("/audio", response_model=UploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_audio(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Handles audio file uploads.

    - Validates content type.
    - Persists the file to the local filesystem with a unique ID.
    - Triggers a background task for transcription.
    - Returns a success response immediately.
    """
    if not file.content_type.startswith("audio/"):
        logger.warning(f"Invalid content type for audio upload: {file.content_type}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Please upload an audio file."
        )

    file_id = uuid.uuid4()
    # Use the suffix from the original filename for better context, or standardize to .wav/.mp3
    file_location = AUDIO_PATH / f"{file_id}{Path(file.filename).suffix}"
    
    logger.info(f"Receiving audio file '{file.filename}' with id '{file_id}'.")

    try:
        with file_location.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Successfully saved file to {file_location}")
    except Exception as e:
        logger.error(f"Failed to save file for id '{file_id}': {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="There was an error uploading the file."
        )
    finally:
        # Always close the file stream
        await file.close()

    # TODO: Create a database record for this file here (status: 'uploaded')

    # Add the heavy processing task to the background
    background_tasks.add_task(process_and_transcribe_audio, file_id=str(file_id), file_path=file_location)
    logger.info(f"Transcription task for '{file_id}' added to background.")

    return UploadResponse(file_id=file_id, filename=file.filename)


@router.post("/video", response_model=UploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_video(file: UploadFile = File(...)):
    """
    Handles video file uploads. Placeholder for now.
    Similar logic to audio upload, but can be extended for thumbnail generation etc.
    """
    if not file.content_type.startswith("video/"):
        logger.warning(f"Invalid content type for video upload: {file.content_type}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Please upload a video file."
        )
    
    # The logic is nearly identical to audio for this prototype
    file_id = uuid.uuid4()
    file_location = VIDEO_PATH / f"{file_id}{Path(file.filename).suffix}"
    
    logger.info(f"Receiving video file '{file.filename}' with id '{file_id}'.")
    try:
        with file_location.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Successfully saved video file to {file_location}")
    except Exception as e:
        logger.error(f"Failed to save video file for id '{file_id}': {e}")
        raise HTTPException(status_code=500, detail="Could not save video file.")
    finally:
        await file.close()

    # TODO: Create a DB record for the video
    # TODO: Add a background task to extract audio from video for transcription

    return UploadResponse(file_id=file_id, filename=file.filename)
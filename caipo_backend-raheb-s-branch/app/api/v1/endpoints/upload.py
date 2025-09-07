import logging
import uuid
import shutil
import mimetypes
from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    BackgroundTasks,
    status,
    Depends,
)
from sqlmodel import Session

from app.models.media import UploadResponse
from app.services.transcription import process_and_transcribe_audio
from app.db.database import get_session
from app.db.models import MediaFile, FileStatus
from app.services.video_processing import process_video_and_transcribe

# --- Module Setup ---
logger = logging.getLogger(__name__)
router = APIRouter()

# Define data storage paths using pathlib for OS compatibility
DATA_PATH = Path("data")
AUDIO_PATH = DATA_PATH / "audio"
VIDEO_PATH = DATA_PATH / "video"

# Create directories on application startup if they don't exist
AUDIO_PATH.mkdir(parents=True, exist_ok=True)
VIDEO_PATH.mkdir(parents=True, exist_ok=True)


def _validate_and_get_content_type(file: UploadFile, accepted_prefix: str) -> str:
    """
    Helper function to robustly validate the content type of an uploaded file.
    Falls back to guessing from the filename if the client sends a generic type.
    """
    content_type = file.content_type

    if content_type == "application/octet-stream":
        guessed_type, _ = mimetypes.guess_type(file.filename or "unknown")
        if guessed_type:
            logger.warning(
                f"Client sent generic '{content_type}', but we guessed '{guessed_type}' from filename '{file.filename}'."
            )
            content_type = guessed_type

    if not content_type or not content_type.startswith(accepted_prefix):
        logger.warning(f"Invalid content type for upload: {content_type}. Expected '{accepted_prefix}*'.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: '{content_type}'. Please upload a file with type '{accepted_prefix}*'.",
        )
    return content_type


@router.post(
    "/audio",
    response_model=UploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload an audio file for transcription",
)
async def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="The audio file to upload."),
    session: Session = Depends(get_session),
):
    """
    Handles audio file uploads with aggressive database logging.
    """
    validated_content_type = _validate_and_get_content_type(file, "audio/")
    file_id = uuid.uuid4()
    file_location = AUDIO_PATH / f"{file_id}{Path(file.filename).suffix}"
    logger.info(
        f"Receiving audio file '{file.filename}' -> Storing as '{file_id}'"
    )

    try:
        with file_location.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Successfully saved file to {file_location}")
    except Exception as e:
        logger.error(f"Failed to save file for id '{file_id}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="There was an error saving the file.",
        )
    finally:
        await file.close()

    # --- DATABASE INTERACTION: CREATE RECORD ---
    # This is the cleaned-up version of the code
    try:
        media_file_record = MediaFile(
            file_id=file_id,
            filename=file.filename,
            content_type=validated_content_type,
            file_path=str(file_location),
            status=FileStatus.UPLOADED,
        )
        session.add(media_file_record)
        session.commit()
        session.refresh(media_file_record)
        logger.info(f"Created database record with ID {media_file_record.id} for file_id '{file_id}'")
    except Exception as e:
        logger.error(f"Database operation failed for file_id {file_id}: {e}", exc_info=True)
        # Even if DB fails, don't crash the whole upload process for the prototype
        # A more robust system might raise an HTTPException here.

    background_tasks.add_task(
        process_and_transcribe_audio, file_id_str=str(file_id), file_path=file_location
    )
    logger.info(f"Transcription task for '{file_id}' added to background queue.")

    return UploadResponse(file_id=file_id, filename=file.filename)


@router.post(
    "/video",
    response_model=UploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload a video file",
)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="The video file to upload."),
    session: Session = Depends(get_session),
):
    """
    Handles video file uploads with aggressive database logging.
    """
    validated_content_type = _validate_and_get_content_type(file, "video/")
    file_id = uuid.uuid4()
    file_location = VIDEO_PATH / f"{file_id}{Path(file.filename).suffix}"
    logger.info(
        f"Receiving video file '{file.filename}' -> Storing as '{file_id}'"
    )

    try:
        with file_location.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Successfully saved video file to {file_location}")
    except Exception as e:
        logger.error(f"Failed to save video file for id '{file_id}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="There was an error saving the video file.",
        )
    finally:
        await file.close()

    # --- AGGRESSIVE DATABASE DEBUGGING ---
    try:
        logger.info("Attempting to create database record for video file...")
        media_file_record = MediaFile(
            file_id=file_id,
            filename=file.filename,
            content_type=validated_content_type,
            file_path=str(file_location),
            status=FileStatus.UPLOADED,
        )
        session.add(media_file_record)
        logger.info("Record added to session. Attempting to commit...")
        session.commit()
        logger.info("COMMIT SUCCEEDED. Attempting to refresh...")
        session.refresh(media_file_record)
        logger.info(f"Database record created and refreshed with ID {media_file_record.id}")
    except Exception as e:
        logger.error(f"!!!!!!!! DATABASE OPERATION FAILED !!!!!!!!", exc_info=True)
        # We will still return a success to the user for now, but log the critical error
    # --- END DATABASE DEBUGGING ---

    logger.info(f"Video file '{file_id}' stored. No processing task queued for v0.1.")
    background_tasks.add_task(
        process_video_and_transcribe, file_id_str=str(file_id), video_path=file_location
    )
    logger.info(f"Video processing and transcription task for '{file_id}' added to background queue.")
    return UploadResponse(file_id=file_id, filename=file.filename)
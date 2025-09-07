# File: app/services/video_processing.py

import logging
import ffmpeg
import uuid
from pathlib import Path

from app.services.transcription import process_and_transcribe_audio

logger = logging.getLogger(__name__)

# This is where we'll store temporary audio files extracted from videos
TEMP_AUDIO_PATH = Path("data/audio/temp")
TEMP_AUDIO_PATH.mkdir(parents=True, exist_ok=True)


def process_video_and_transcribe(file_id_str: str, video_path: Path):
    """
    The main background task for handling video processing.
    1. Extracts audio from the video file.
    2. Calls the existing audio transcription service on the extracted audio.
    3. Cleans up the temporary audio file.
    """
    logger.info(f"Starting video processing for file_id: {file_id_str}")
    
    # Define a path for the temporary extracted audio file
    temp_audio_file = TEMP_AUDIO_PATH / f"{file_id_str}.mp3"
    
    try:
        # Step 1: Extract Audio using ffmpeg
        logger.info(f"Extracting audio from {video_path} to {temp_audio_file}")
        
        # Use ffmpeg-python to create and run the command
        # It takes the input video, specifies the audio codec as mp3 (acodec),
        # and writes to the output file.
        ffmpeg.input(str(video_path)).output(str(temp_audio_file), acodec='mp3').run(
            capture_stdout=True, capture_stderr=True, overwrite_output=True
        )
        
        logger.info(f"Audio extraction successful for {file_id_str}")

        # Step 2: Call the existing audio transcription service
        # We are REUSING our existing logic, which is very efficient!
        process_and_transcribe_audio(file_id_str=file_id_str, file_path=temp_audio_file)

    except ffmpeg.Error as e:
        logger.error(f"FFmpeg error during audio extraction for {file_id_str}: {e.stderr.decode()}")
        # Here, you would ideally update the DB status to FAILED
        # from app.db.database import engine
        # from app.services.transcription import _update_status_in_db, FileStatus
        # _update_status_in_db(uuid.UUID(file_id_str), FileStatus.FAILED)
    
    except Exception as e:
        logger.error(f"An unexpected error occurred during video processing for {file_id_str}: {e}", exc_info=True)
        # Also update DB to FAILED here

    finally:
        # Step 3: Clean up the temporary file
        if temp_audio_file.exists():
            logger.info(f"Cleaning up temporary audio file: {temp_audio_file}")
            temp_audio_file.unlink()
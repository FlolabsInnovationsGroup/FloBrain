# File: app/services/transcription.py

import logging
import whisper
import json
from pathlib import Path

logger = logging.getLogger(__name__)

# --- Model Loading ---
# This is a critical part of a professional service.
# The model is loaded ONCE when the application starts.
# This avoids the massive overhead of loading it on every API call.
# We wrap it in a try-except block to handle errors gracefully if the model
# can't be loaded (e.g., file not found, memory issues).
MODEL_NAME = "base" # Use 'tiny' for faster testing, 'base' is a good balance
try:
    logger.info(f"Loading Whisper model '{MODEL_NAME}'...")
    model = whisper.load_model(MODEL_NAME)
    logger.info("Whisper model loaded successfully.")
except Exception as e:
    logger.error(f"FATAL: Could not load Whisper model '{MODEL_NAME}'. Error: {e}")
    # In a real production system, you might want the app to fail to start
    # if a critical component like this is missing. For now, we'll log it.
    model = None

# --- Paths for Transcripts ---
DATA_PATH = Path("data")
TRANSCRIPTS_PATH = DATA_PATH / "transcripts"
TRANSCRIPTS_PATH.mkdir(parents=True, exist_ok=True)


def process_and_transcribe_audio(file_id: str, file_path: Path):
    """
    The core transcription logic. This function is designed to be run
    in the background to avoid blocking the API response.
    """
    if not model:
        logger.error(f"Transcription skipped for {file_id}: Whisper model is not available.")
        # TODO: Update DB status to 'transcription_failed'
        return
    
    if not file_path.exists():
        logger.error(f"Transcription failed for {file_id}: File not found at {file_path}")
        # TODO: Update DB status to 'transcription_failed'
        return

    logger.info(f"Starting transcription for file_id: {file_id}")
    try:
        # Note: Whisper needs the file path as a string
        # fp16=False is important if you are not using a NVIDIA GPU with CUDA
        result = model.transcribe(str(file_path), fp16=False)

        # Save the full transcript JSON
        transcript_file_path = TRANSCRIPTS_PATH / f"{file_id}.json"
        with transcript_file_path.open("w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Transcription for {file_id} completed. Transcript saved to {transcript_file_path}")
        # TODO: Update the DB row for this file_id:
        # - status: 'completed'
        # - transcript_path: str(transcript_file_path)
        # - text: result['text']

    except Exception as e:
        logger.error(f"Transcription failed for {file_id}: {e}", exc_info=True)
        # TODO: Update DB status to 'transcription_failed' and log the error message
import logging
import whisper
import json
import uuid
from pathlib import Path
from sqlmodel import Session, select

from app.db.database import engine # <-- Import the engine
from app.db.models import MediaFile, FileStatus # <-- Import the models

logger = logging.getLogger(__name__)

MODEL_NAME = "base"
try:
    logger.info(f"Loading Whisper model '{MODEL_NAME}'...")
    model = whisper.load_model(MODEL_NAME)
    logger.info("Whisper model loaded successfully.")
except Exception as e:
    logger.error(f"FATAL: Could not load Whisper model '{MODEL_NAME}'. Error: {e}")
    model = None

DATA_PATH = Path("data")
TRANSCRIPTS_PATH = DATA_PATH / "transcripts"
TRANSCRIPTS_PATH.mkdir(parents=True, exist_ok=True)

def _update_status_in_db(file_id: uuid.UUID, new_status: FileStatus, transcript_path: str = None):
    """Helper function to update a record's status in the database."""
    with Session(engine) as session:
        statement = select(MediaFile).where(MediaFile.file_id == file_id)
        media_file = session.exec(statement).one_or_none()
        if media_file:
            media_file.status = new_status
            if transcript_path:
                media_file.transcript_path = transcript_path
            session.add(media_file)
            session.commit()
            logger.info(f"DB status for {file_id} updated to '{new_status}'.")
        else:
            logger.error(f"Could not update status for {file_id}: record not found.")

def process_and_transcribe_audio(file_id_str: str, file_path: Path):
    file_id = uuid.UUID(file_id_str)
    
    _update_status_in_db(file_id, FileStatus.PROCESSING)
    
    if not model:
        logger.error(f"Transcription skipped for {file_id}: Whisper model is not available.")
        _update_status_in_db(file_id, FileStatus.FAILED)
        return
    
    if not file_path.exists():
        logger.error(f"Transcription failed for {file_id}: File not found at {file_path}")
        _update_status_in_db(file_id, FileStatus.FAILED)
        return

    logger.info(f"Starting transcription for file_id: {file_id}")
    try:
        result = model.transcribe(str(file_path), fp16=False)
        transcript_file_path = TRANSCRIPTS_PATH / f"{file_id_str}.json"
        with transcript_file_path.open("w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        _update_status_in_db(file_id, FileStatus.COMPLETED, transcript_path=str(transcript_file_path))
        logger.info(f"Transcription for {file_id} completed and linked in DB.")

    except Exception as e:
        logger.error(f"Transcription failed for {file_id}: {e}", exc_info=True)
        _update_status_in_db(file_id, FileStatus.FAILED)
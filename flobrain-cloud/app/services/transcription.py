import logging

from openai import OpenAI, OpenAIError
from tenacity import (
    RetryError,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize client
client = None
if settings.OPENAI_API_KEY:
    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
    except OpenAIError as e:
        logger.error("Error initializing OpenAI client: %s", e)
else:
    logger.warning("OPENAI_API_KEY not set. Transcription service will not work.")

RETRYABLE_EXCEPTIONS = (OpenAIError,)


@retry(
    retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(3),
)
def _transcribe_file_internal(file_path: str) -> dict:
    if not client:
        raise ValueError("OpenAI client not initialized.")

    with open(file_path, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
            timestamp_granularities=["segment"],
        )

    return response.model_dump()


def transcribe_audio(file_path: str) -> dict:
    """
    Transcribe an audio file using OpenAI Whisper API.
    """
    try:
        return _transcribe_file_internal(file_path)
    except FileNotFoundError:
        logger.error("File not found: %s", file_path)
        return {"error": "File not found"}
    except RetryError as e:
        logger.error("Transcription failed after retries: %s", e)
        return {"error": "Transcription failed"}
    except Exception as e:  # noqa: BLE001
        logger.error("Unexpected error during transcription: %s", e)
        return {"error": str(e)}

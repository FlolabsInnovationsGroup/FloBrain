# services/whisper_service.py

import os
import openai
import logging
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type, RetryError
import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav
import tempfile

# ... (client and RETRYABLE_EXCEPTIONS remain the same) ...
try:
    client = openai.Client()
except openai.OpenAIError as e:
    logging.error(f"Error initializing OpenAI client: {e}")
    logging.error("Please ensure your OPENAI_API_KEY is set correctly in the .env file.")
    client = None

RETRYABLE_EXCEPTIONS = (
    openai.APITimeoutError,
    openai.RateLimitError,
    openai.APIConnectionError,
    openai.InternalServerError,
)


# This is our internal function with the retry logic
@retry(
    retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
    wait=wait_exponential(multiplier=1, min=2, max=10), # a little faster for tests
    stop=stop_after_attempt(3)
)
def _transcribe_batch_internal(file_path: str) -> list:
    """
    Internal transcription function. Raises exceptions to be handled by tenacity.
    """
    if not client:
        # This is a permanent failure, so we raise an error to stop retries.
        raise ValueError("OpenAI client not initialized.")

    logging.info(f"Attempting to transcribe file: {file_path}")
    with open(file_path, "rb") as audio_file:
        response = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            response_format="verbose_json",
            timestamp_granularities=["segment"]
        )
    
    normalized_segments = []
    if response.segments:
        for segment in response.segments:
            normalized_segments.append({
                "start": segment.start,
                "end": segment.end,
                "text": segment.text
            })
    
    logging.info(f"Successfully transcribed {file_path}.")
    return normalized_segments

# This is our new, public-facing function
def transcribe_batch(file_path: str) -> list:
    """
    Public-facing function that calls the internal retryable function
    and handles all final errors gracefully.
    """
    try:
        return _transcribe_batch_internal(file_path)
    except FileNotFoundError:
        logging.error(f"Error: The file was not found at {file_path}")
        return []
    except RetryError as e:
        # This catches the final error from tenacity after all retries have failed.
        logging.error(f"API call failed after multiple retries: {e}")
        return []
    except Exception as e:
        # This catches any other unexpected errors (e.g., client init, generic exceptions)
        logging.error(f"An unexpected, non-retryable error occurred: {e}", exc_info=True)
        return []

# --- Step 3: Refactor common I/O into a helper class ---
class TemporaryAudioFile:
    """A context manager for creating and cleaning up a temporary audio file."""
    def __init__(self, samplerate, recording):
        self.samplerate = samplerate
        self.recording = recording
        self.temp_file = None

    def __enter__(self):
        # Create a temporary file and write the recording to it
        self.temp_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        wav.write(self.temp_file.name, self.samplerate, self.recording)
        return self.temp_file.name

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Ensure the file is closed and deleted, even if errors occur
        if self.temp_file:
            try:
                os.remove(self.temp_file.name)
            except OSError as e:
                logging.warning(f"Error cleaning up temporary file {self.temp_file.name}: {e}")

def transcribe_stream(duration=5, samplerate=16000):
    """
    **Simulated Streaming Transcription using OpenAI Whisper**

    This function emulates a live transcription feed by recording audio from
    the microphone in fixed-duration chunks and sending each chunk to the
    OpenAI batch transcription endpoint.

    NOTE: This is a **simulation** and not a true, low-latency stream.
    The official OpenAI Whisper API (v1) does not offer a real-time
    streaming endpoint. This method will have inherent latency equal to at
    least the `duration` of each chunk plus the API processing time.

    Args:
        duration (int): The duration of each audio chunk in seconds.
        samplerate (int): The sample rate for the audio recording.
    """
    logging.info("--- Starting OpenAI SIMULATED Live Transcription ---")
    try:
        while True:
            logging.info(f"\n Recording {duration} seconds...")
            recording = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='int16')
            sd.wait()

            # Use the refactored context manager for clean file handling
            with TemporaryAudioFile(samplerate, recording) as temp_path:
                logging.info(f"Sending chunk ({temp_path}) to Whisper...")
                segments = transcribe_batch(temp_path)

            if segments:
                logging.info("Transcription Results:")
                for segment in segments:
                    logging.info(f"[{segment['start']:.2f}s - {segment['end']:.2f}s] {segment['text']}")
            else:
                logging.info("No transcription returned for the last chunk.")

    except KeyboardInterrupt:
        logging.info("\n Stopped live transcription.")
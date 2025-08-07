# services/whisper_service.py

import os
import openai
import logging
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav
import tempfile

# --- (Client Initialization and Retry Configuration remain the same) ---
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

@retry(
    retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    stop=stop_after_attempt(3)
)
def transcribe_batch(file_path: str) -> list:
    if not client:
        logging.error("OpenAI client not initialized. Cannot proceed.")
        return []

    logging.info(f"Attempting to transcribe file: {file_path}")
    try:
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
    except openai.APIError as e:
        logging.error(f"OpenAI API Error after retries: {e}")
        return []
    except FileNotFoundError:
        logging.error(f"Error: The file was not found at {file_path}")
        return []
    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}", exc_info=True)
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
    Simulates streaming transcription by recording and processing audio chunks.
    """
    logging.info("--- Starting Simulated Live Transcription ---")
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
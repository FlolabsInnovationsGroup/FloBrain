# services/whisper_service.py

import os
import openai
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav
import tempfile

# --- Configuration & Initialization ---
try:
    client = openai.Client()
except openai.OpenAIError as e:
    print(f"Error initializing OpenAI client: {e}")
    print("Please ensure your OPENAI_API_KEY is set correctly in the .env file.")
    client = None

# --- Error Handling: Define what errors to retry on ---
RETRYABLE_EXCEPTIONS = (
    openai.APITimeoutError,
    openai.RateLimitError,
    openai.APIConnectionError,
    openai.InternalServerError,
)

# --- Service Functions ---
@retry(
    retry=retry_if_exception_type(RETRYABLE_EXCEPTIONS),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    stop=stop_after_attempt(3)
)

def transcribe_batch(file_path: str) -> list:
    """
    Transcribes a full audio file using the OpenAI Whisper API in batch mode.
    Includes robust error handling with exponential backoff retries.
    """
    if not client:
        print("OpenAI client not initialized. Cannot proceed.")
        return []

    print(f"Attempting to transcribe file: {file_path}")
    try:
        with open(file_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
                timestamp_granularities=["segment"]
            )
        
        # --- Handle Responses & Normalize ---
        normalized_segments = []
        if response.segments:
            for segment in response.segments:
                # =========================================================
                # THE FIX IS HERE: Use .start, .end, and .text
                # =========================================================
                normalized_segments.append({
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text
                })
        
        print(f"Successfully transcribed {file_path}.")
        return normalized_segments

    except openai.APIError as e:
        print(f"OpenAI API Error after retries: {e}")
        return []
    except FileNotFoundError:
        print(f"Error: The file was not found at {file_path}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []

def transcribe_stream(duration=5, samplerate=16000):
    """
    Simulates streaming transcription by recording short audio chunks
    and sending them to OpenAI Whisper batch API one by one.
    """
    print("--- Starting Simulated Live Transcription ---")
    temp_path = None  # Initialize temp_path to ensure it exists for the finally block
    try:
        while True:
            print(f"\n Recording {duration} seconds...")
            recording = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='int16')
            sd.wait()

            # Save to a temp WAV file
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmpfile:
                wav.write(tmpfile.name, samplerate, recording)
                temp_path = tmpfile.name

            print(" Sending chunk to Whisper...")
            segments = transcribe_batch(temp_path)

            if segments:
                print(" Transcription Results:")
                for segment in segments:
                    print(f"[{segment['start']:.2f}s - {segment['end']:.2f}s] {segment['text']}")
            else:
                print(" No transcription returned.")

    except KeyboardInterrupt:
        print("\n Stopped live transcription.")
    # ===================================================================
    # THE FIX IS HERE: Use a 'finally' block for cleanup.
    # This code will run even if a KeyboardInterrupt happens.
    # ===================================================================
    finally:
        if temp_path and os.path.exists(temp_path):
            print(f" Cleaning up temporary file: {temp_path}")
            os.remove(temp_path)
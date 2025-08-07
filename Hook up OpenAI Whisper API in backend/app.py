import argparse
import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file BEFORE importing other modules.
load_dotenv()

# Import all our service functions
from services.whisper_service import transcribe_batch, transcribe_stream
from services.deepgram_service import transcribe_live

def main():
    # --- Set up a standard logger ---
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    # ------------------------------------

    parser = argparse.ArgumentParser(description="A backend service for OpenAI and Deepgram transcription.")
    # Add the new 'live' mode
    parser.add_argument(
        'mode', type=str, choices=['batch', 'stream', 'live'],
        help="The transcription mode to run. 'batch' (OpenAI), 'stream' (OpenAI simulated), 'live' (Deepgram real-time)."
    )
    parser.add_argument(
        '--file', type=str, default='sample_audio/audio.wav',
        help="Path to the audio file for batch mode."
    )
    args = parser.parse_args()

    # --- Mode Selection Logic ---
    if args.mode == 'batch':
        logging.info(f"--- Running OpenAI Batch Transcription for: {args.file} ---")
        segments = transcribe_batch(args.file)
        if segments:
            logging.info("\n--- Transcription Results ---")
            for segment in segments:
                start_time = f"{segment['start']:.2f}"
                end_time = f"{segment['end']:.2f}"
                logging.info(f"[{start_time}s - {end_time}s] {segment['text']}")
            logging.info("---------------------------\n")
        else:
            logging.warning("\n--- Transcription Failed ---\n")

    elif args.mode == 'stream':
        # This is the OpenAI SIMULATED stream
        transcribe_stream()

    elif args.mode == 'live':
        # This is the Deepgram REAL-TIME stream
        transcribe_live()

if __name__ == "__main__":
    main()
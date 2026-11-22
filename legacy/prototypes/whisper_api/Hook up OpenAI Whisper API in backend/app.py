# app.py (Final Version with All Modes Reserved)

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
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

    parser = argparse.ArgumentParser(description="A backend service for OpenAI and Deepgram transcription.")
    # ===================================================================
    # THE FIX IS HERE: We re-add all four modes as valid choices.
    # ===================================================================
    parser.add_argument(
        'mode', type=str, choices=['batch', 'stream', 'simulated-stream', 'live-stream'],
        help="The transcription mode to run."
    )
    parser.add_argument(
        '--provider', type=str, default=None, choices=['openai', 'deepgram'],
        help="For 'stream' mode, choose a provider. If omitted, you will be prompted."
    )
    parser.add_argument(
        '--file', type=str, default='sample_audio/audio.wav',
        help="Path to the audio file for 'batch' mode."
    )
    parser.add_argument(
        '--duration', type=int, default=5,
        help="For the OpenAI simulated-stream, the duration of each audio chunk."
    )
    args = parser.parse_args()

    # --- New, Final, and Flexible Mode Selection Logic ---
    if args.mode == 'batch':
        # (This logic is unchanged)
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
            logging.info("\n--- Transcription Successful ---")
            logging.info("No speech was detected in the audio file.\n")
    
    # --- This block now handles ALL streaming cases ---
    elif args.mode in ['stream', 'simulated-stream', 'live-stream']:
        provider = args.provider
        
        # Logic for the explicit shortcut commands
        if args.mode == 'simulated-stream':
            provider = 'openai'
        elif args.mode == 'live-stream':
            provider = 'deepgram'
        
        # Logic for the generic 'stream' command (interactive prompt)
        elif args.mode == 'stream' and provider is None:
            logging.info("Please choose a streaming provider:")
            logging.info("  1: OpenAI (Simulated Stream - Higher Latency)")
            logging.info("  2: Deepgram (Real-Time Stream - Low Latency)")
            
            while True:
                choice = input("Enter your choice (1 or 2): ")
                if choice == '1':
                    provider = 'openai'
                    break
                elif choice == '2':
                    provider = 'deepgram'
                    break
                else:
                    logging.warning("Invalid choice. Please enter 1 or 2.")

        # --- Execute the chosen streaming function ---
        if provider == 'openai':
            transcribe_stream(duration=args.duration)
        elif provider == 'deepgram':
            transcribe_live()
        else:
            # This case should only be hit if the user typed 'stream' but something went wrong
            logging.error("Could not determine a provider for streaming. Please try again.")

if __name__ == "__main__":
    main()
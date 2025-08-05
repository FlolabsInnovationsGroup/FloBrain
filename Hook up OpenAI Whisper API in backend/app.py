# app.py

import argparse
from dotenv import load_dotenv

# --- SOLUTION ---
# Load environment variables from .env file BEFORE importing other modules
# that might need them.
load_dotenv()
# ----------------

# Now, import the service module. By the time Python reads whisper_service.py,
# the environment variables will already be loaded.
from services.whisper_service import transcribe_batch, transcribe_stream

def main():
    parser = argparse.ArgumentParser(description="A backend service to interact with the OpenAI Whisper API.")
    # ... (the rest of the file remains the same) ...
    parser.add_argument(
    'mode', 
    type=str, 
    choices=['batch', 'stream'],  # added 'stream'
    help="The transcription mode to run. Choose 'batch' or 'stream'."
    )
    parser.add_argument(
        '--file', 
        type=str, 
        default='sample_audio/audio.wav',
        help="Path to the audio file for batch mode."
    )

    args = parser.parse_args()

    if args.mode == 'batch':
        print(f"--- Running Batch Transcription for: {args.file} ---")
        segments = transcribe_batch(args.file)
        
        if segments:
            print("\n--- Transcription Results ---")
            for segment in segments:
                start_time = f"{segment['start']:.2f}"
                end_time = f"{segment['end']:.2f}"
                print(f"[{start_time}s - {end_time}s] {segment['text']}")
            print("---------------------------\n")
        elif args.mode == 'stream':
            transcribe_stream()
        else:
            print("\n--- Transcription Failed ---")
            print("Please check the logs for errors.\n")

if __name__ == "__main__":
    main()
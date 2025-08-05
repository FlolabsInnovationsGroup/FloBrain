# High-Performance Transcription Services: Batch and Real-Time

This project provides two distinct, production-ready backend services to demonstrate and contrast high-accuracy batch transcription with low-latency, real-time streaming transcription.

1.  **Batch Processing (with OpenAI Whisper):** A robust service for transcribing complete, pre-recorded audio files with maximum accuracy.
2.  **Real-Time Streaming (with Deepgram):** A high-performance service for transcribing a live audio feed from a microphone with minimal latency, providing instant feedback.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Configuration](#configuration)
- [How to Use](#how-to-use)
- [Architectural Notes](#architectural-notes)

## Features

### OpenAI Batch Service
-   **Secure API Key Management**: Uses a `.env` file to store the `OPENAI_API_KEY`.
-   **High-Accuracy Batch Transcription**: A `transcribe_batch` function that uploads a full audio file to the `whisper-1` model.
-   **Robust Error Handling**: Automatically retries API calls on transient errors like rate limits or timeouts, using an exponential backoff strategy.
-   **Normalized Responses**: Parses the API response and returns a clean, easy-to-use list of segment objects, each containing `start`, `end`, and `text`.

### Deepgram Real-Time Streaming Service
-   **Secure API Key Management**: Uses the same `.env` file to store the `DEEPGRAM_API_KEY`.
-   **True Low-Latency Streaming**: Connects to Deepgram's WebSocket endpoint for real-time, bi-directional communication.
-   **Live Interim Results**: Displays a live, in-progress transcript as you speak.
-   **Clean Final Segments**: Uses `speech_final` events to produce clean, non-repetitive, timestamped segments of speech after you pause.
-   **Thread-Safe Microphone Handling**: Reads audio from the microphone on a separate thread to prevent blocking the main application.

## Project Structure
```
openai_whisper_backend/
│
├── .env                 # For storing both secret API keys
├── .gitignore
├── README.md
├── app.py               # Entry point for the BATCH (OpenAI) service
├── live_stream_final.py # Entry point for the LIVE (Deepgram) service
├── requirements.txt
│
├── sample_audio/
│   └── audio.wav
│
└── services/
│   ├── __init__.py
│   └── whisper_service.py  # Core module for the BATCH service
└── tests/
    ├── __init__.py
    └── test_whisper_service.py  
```

## Setup and Installation

### 1. Prerequisites
- Python 3.8+
- Git
- A working microphone (for the real-time streaming service)

### 2. Clone the Repository
```bash
git clone <your-repository-link>
cd openai_whisper_backend
```


### 3. Install Dependencies
Create a `requirements.txt` file with the following content:
# For OpenAI Batch Service
openai
tenacity

# For Deepgram Streaming Service
deepgram-sdk
pyaudio

# For loading environment variables
python-dotenv

Then, install everything with:
```bash
pip install -r requirements.txt
```

## Configuration

This project requires API keys from both OpenAI and Deepgram.

1.  **Create the `.env` file**: In the root of the project, create a single file named `.env`.
2.  **Add your keys**: Add the following lines to your `.env` file, replacing the placeholder values with your actual keys.

    ```
    # Key for the batch transcription service
    OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    # Key for the real-time streaming service
    DEEPGRAM_API_KEY="your_deepgram_api_key_here"
    ```

## How to Use

The project has two separate entry points for the two different services.

### Running the Batch Service (OpenAI)
This service is ideal for transcribing audio files you already have.
```bash
python app.py batch --file path/to/your/audio.mp3
```

### Running the Real-Time Streaming Service (Deepgram)
This service listens to your microphone for live transcription.
```bash
python live_stream.py
```
Speak into your microphone. When you are finished, press **Enter** in the terminal to stop the program cleanly.

## Architectural Notes

This project intentionally uses two different service providers to highlight the best tool for each job.

### Why OpenAI for Batch Transcription?
- **World-Class Accuracy**: The `whisper-1` model is renowned for its high accuracy across a wide range of audio qualities and accents, making it ideal for processing final recordings where quality is paramount.
- **Simplicity**: For non-real-time tasks, a simple RESTful API call is easy to implement and manage.

### Why Deepgram for Real-Time Streaming?
- **Designed for Speed**: Deepgram's platform is built from the ground up for low-latency streaming via WebSockets, which is a requirement for a true real-time experience.
- **Advanced Streaming Features**: The API provides essential real-time features like `interim_results` and `speech_final` events, which are critical for building a responsive user interface and preventing issues like transcript repetition.
- **Efficiency**: The WebSocket protocol maintains a persistent connection, which is far more efficient for sending a continuous stream of small audio chunks than making repeated HTTP requests.

This two-service architecture demonstrates a key principle in software engineering: choosing the right tool for the specific problem you are trying to solve.

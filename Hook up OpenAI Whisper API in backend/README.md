# High-Performance Transcription Services: Batch and Real-Time

This project provides three distinct, production-ready backend services to demonstrate and contrast different modes of audio transcription using industry-leading APIs.

1.  **Batch Processing (with OpenAI Whisper):** A robust service for transcribing complete audio files with maximum accuracy.
2.  **Simulated Streaming (with OpenAI Whisper):** A service that emulates a live feed by processing microphone audio in chunks with OpenAI's batch API.
3.  **Real-Time Streaming (with Deepgram):** A high-performance service for transcribing a live audio feed with true, low-latency WebSocket streaming.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Configuration](#configuration)
- [How to Use](#how-to-use)
- [Testing and Quality Assurance](#testing-and-quality-assurance)
- [Architectural Notes](#architectural-notes)

## Features

-   **Secure API Key Management**: Uses a single `.env` file to manage secret keys for both OpenAI and Deepgram.
-   **Modular Service Architecture**: Logic for each service (OpenAI, Deepgram) is cleanly separated into its own module in the `services/` directory.
-   **Three Distinct Transcription Modes**:
    -   High-accuracy batch processing (`batch`).
    -   Chunk-based simulated streaming (`stream`).
    -   True low-latency real-time streaming (`live`).
-   **Robust Error Handling**: Uses `tenacity` for retries on the batch service and graceful error handling on the live service.
-   **Professional Logging**: Replaces simple `print()` statements with Python's standard `logging` module for structured, informative output.
-   **Comprehensive Testing (>90% Coverage)**: The project is validated by a suite of integration tests using `pytest` and `pytest-mock`, ensuring all core logic is reliable and correct.

## Project Structure
```
Hook up OpenAI Whisper API in backend/
│
├── .env                 # For storing both secret API keys
├── .gitignore
├── README.md
├── app.py               # Master entry point for all 3 modes
├── requirements.txt
│
├── sample_audio/
│   └── audio.wav
│
├── services/
│   ├── __init__.py
│   ├── whisper_service.py  # Core module for OpenAI batch and simulated stream
│   └── deepgram_service.py # Core module for Deepgram live stream
│
└── tests/
    ├── __init__.py
    ├── test_whisper_service.py  # Tests for the OpenAI services
    ├── test_deepgram_service.py # Tests for the Deepgram service
    └── test_microphone.py       # Tests for the Microphone helper class
```

## Setup and Installation

### 1. Prerequisites
- Python 3.8+
- Git
- A working microphone (for streaming modes)

### 2. Clone the Repository
```bash
git clone <your-repository-link>
cd Hook-up-OpenAI-Whisper-API-in-backend
```

### 3. Create and Activate a Virtual Environment
```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
.\venv\Scripts\activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

## Configuration

This project requires API keys from both OpenAI and Deepgram.

1.  **Create the `.env` file**: In the root of the project, create a single file named `.env`.
2.  **Add your keys**: Add the following lines, replacing the placeholder values with your actual keys.
    ```
    # Key for OpenAI services ('batch' and 'stream' modes)
    OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    # Key for Deepgram service ('live' mode)
    DEEPGRAM_API_KEY="your_deepgram_api_key_here"
    ```

## How to Use

All services are run through the main `app.py` script.

### Mode 1: Batch Transcription (OpenAI)
For high-accuracy transcription of a pre-recorded audio file.
```bash
python app.py batch --file path/to/your/audio.mp3
```

### Mode 2: Simulated Streaming (OpenAI)
Emulates a live feed by recording and transcribing in chunks.
```bash
python app.py stream
```

### Mode 3: Real-Time Streaming (Deepgram)
For true, low-latency transcription from your microphone.
```bash
python app.py live
```
Speak into your microphone. When you are finished, press **Enter** in the terminal to stop the program cleanly.

## Testing and Quality Assurance

This project is built with a focus on quality, proven by a comprehensive test suite.

### Running Tests
To run all 14 integration and unit tests, execute the following command from the project's root directory:
```bash
pytest
```
The tests use mocking to run without needing API keys or an internet connection.

### How to Run the Coverage Report

The project uses the `pytest-cov` library to measure how much of the application code is executed during the test suite.

**1. To generate a summary in your terminal:**
Run the following command from the project's root directory.
```bash
pytest --cov=services
```

**2. To generate a detailed, line-by-line HTML report:**
This is the best way to see exactly which lines of code are covered and which are missed.
```bash
pytest --cov=services --cov-report=html
```
After running this command, a new directory named `htmlcov/` will be created. Open the **`index.html`** file inside it with a web browser to explore the detailed report.

#### **Latest Coverage Report:**
The project consistently meets the professional standard of >90% test coverage for its core logic.
```
=========================== tests coverage ===========================
Name                           Stmts   Miss  Cover
--------------------------------------------------
services/__init__.py               0      0   100%
services/deepgram_service.py      76      7    91%
services/whisper_service.py       71      4    94%
--------------------------------------------------
TOTAL                            147     11    93%
```

## Architectural Notes

This project intentionally uses two different service providers to highlight the best tool for each job.

- **OpenAI's `whisper-1`** was chosen for batch processing due to its renowned accuracy, making it ideal for final recordings.
- **Deepgram** was chosen for real-time streaming due to its superior, purpose-built WebSocket API, which provides the low latency and advanced features (`speech_final`) required for a responsive user experience.
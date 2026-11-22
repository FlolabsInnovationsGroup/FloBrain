# High-Performance Transcription Services: Batch and Real-Time

This project provides production-ready backend services to demonstrate and contrast different modes of audio transcription using industry-leading APIs. It offers three distinct transcription modes:

1.  **Batch Processing:** For high-accuracy transcription of complete, pre-recorded audio files using the **OpenAI Whisper** API.
2.  **Simulated Stream:** Emulates a live feed by processing microphone audio in chunks with the **OpenAI Whisper** batch API.
3.  **Live Stream:** For true, real-time, low-latency transcription from a microphone using the **Deepgram** WebSocket API.

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
-   **Unambiguous Command-Line Interface**: Provides three distinct, clear commands (`batch`, `simulated-stream`, `live-stream`) for each transcription mode.
-   **Robust Error Handling**: Uses `tenacity` for automatic, proven retries on the OpenAI batch service and graceful error handling on the live services.
-   **Professional Logging**: Replaces simple `print()` statements with Python's standard `logging` module for structured, informative output.
-   **Comprehensive Testing (>90% Coverage)**: The project is validated by a suite of 16+ integration tests, ensuring all core logic is reliable and correct.

## Project Structure
```
Hook up OpenAI Whisper API in backend/
│
├── .env                 # For storing both secret API keys
├── .gitignore
├── README.md
├── app.py               # Master entry point for all modes
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
git clone <repository-link>
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
Ensure your `requirements.txt` is complete and pinned, then run:
```bash
pip install -r requirements.txt
```

## Configuration

This project requires API keys from both OpenAI and Deepgram.

1.  **Create the `.env` file**: In the root of the project, create a single file named `.env`.
2.  **Add your keys**: Add the following lines, replacing the placeholder values with your actual keys.
    ```
    # Key for OpenAI services
    OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    # Key for Deepgram service
    DEEPGRAM_API_KEY="your_deepgram_api_key_here"
    ```

## How to Use

All services are run through the main `app.py` script.

### Mode 1: Batch Transcription (OpenAI)
For high-accuracy transcription of a pre-recorded audio file.
```bash
python app.py batch --file path/to/your/audio.mp3
```
You can this command to use file ` sample_audio/audio.wav` for intial file
```bash
python app.py batch 
```

### Mode 2: Streaming Transcription
This mode transcribes live from your microphone. It is highly flexible and can be run in several ways.

#### **Option A: The Interactive Way (Recommended for new users)**
Simply run the `stream` command, and the application will prompt you to choose a provider.
```bash
python app.py stream
```
You will then see a menu to guide your choice.

#### **Option B: The Direct Flag-Based Way**
You can bypass the interactive prompt by specifying the provider directly with the `--provider` flag.

**- To run the *simulated* stream with OpenAI:**
```bash
python app.py stream --provider openai 
```
Or you can change chunck duration `--duration` for simulated recording by using 
```bash
python app.py stream --provider openai --duration 3
```

**- To run the *true, real-time* stream with Deepgram:**
```bash
python app.py stream --provider deepgram
```

#### **Option C: The Shortcut Commands (Recommended for power users)**
For convenience, you can use these direct, unambiguous commands.

**- To run the *simulated* stream with OpenAI:**
```bash
python app.py simulated-stream 
```
Or you can change chunck duration `--duration` for simulated recording by using 
```bash
python app.py simulated-stream --duration 3
```

**- To run the *true, real-time* stream with Deepgram:**
```bash
python app.py live-stream
```
For all streaming methods, press **Enter** in the terminal to stop the program cleanly.

## Testing and Quality Assurance

This project is built with a focus on quality, proven by a comprehensive test suite.

### Running Tests
To run all integration and unit tests:
```bash
pytest
```
### Measuring Test Coverage
To generate a detailed, line-by-line HTML report of test coverage:
```bash
pytest --cov=services --cov-report=html
```
After running, open the **`index.html`** file in the newly created `htmlcov/` directory.

#### **Latest Coverage Report:**
The project meets the professional standard of >90% test coverage for its core logic, with the latest run showing **94% total coverage**.
```
=========================== tests coverage ===========================
Name                           Stmts   Miss  Cover
--------------------------------------------------
services/__init__.py               0      0   100%
services/deepgram_service.py      76      7    91%
services/whisper_service.py       72      2    97%
--------------------------------------------------
TOTAL                            148      9    94%
```

## Architectural Notes

This project intentionally uses two different service providers to highlight the best tool for each job.

- **OpenAI's `whisper-1`** was chosen for batch processing due to its renowned accuracy. Its API is not designed for real-time streaming, which is why the `simulated-stream` mode is a workaround with inherent latency.
- **Deepgram** was chosen for the `live-stream` mode due to its superior, purpose-built WebSocket API, which provides the low latency and advanced features required for a responsive, true real-time user experience.
# CAIPO Backend - v0.1 Prototype

[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Framework](https://img.shields.io/badge/FastAPI-0.104.0-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This repository contains the backend server for the CAIPO (Capture and AI Processed Output) prototype. It's designed to be a lightweight, robust, and scalable service for handling media uploads, processing them with AI models, and serving the results.

> **Sprint Goal:** End-to-end: ESP32 (or sim) → audio/video → backend → batch Whisper transcript → embeddings search → tiny viewer. Quickstart ≤15 min.

## ✨ Key Features

*   **FastAPI Core:** Built on a modern, high-performance Python web framework.
*   **Automatic Docs:** Interactive API documentation (Swagger UI & ReDoc) available out-of-the-box.
*   **Media Uploads:** Endpoints for uploading audio and video files.
*   **Background Processing:** Heavy tasks like AI transcription are run as background jobs to ensure fast API response times.
*   **AI Integration:** A service-oriented architecture for integrating a Whisper transcription model.
*   **Configuration-driven:** Uses environment variables for easy configuration in different environments.

## 🛠️ Technology Stack

*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
*   **Server:** [Uvicorn](https://www.uvicorn.org/)
*   **Data Validation:** [Pydantic](https://docs.pydantic.dev/)
*   **AI Model:** [OpenAI Whisper](https://github.com/openai/whisper)
*   **Database (Planned):** [SQLAlchemy](https://www.sqlalchemy.org/) / [SQLModel](https://sqlmodel.tiangolo.com/)

## 📂 Project Structure

The project follows a professional structure that emphasizes separation of concerns.

```text
caipo_backend/
├── app/                      # All our main application code lives here
│   ├── api/                  # API-specific code (endpoints/routers)
│   │   └── v1/               # Good practice to version your API
│   │       ├── endpoints/
│   │       │   ├── health.py # For the /healthz endpoint
│   │       │   └── upload.py # For /upload/audio and /upload/video
│   │       ├── __init__.py
│   │       └── api.py        # Gathers all v1 routers
│   ├── core/                 # Core logic, config, logging
│   │   ├── config.py         # Manages environment variables
│   │   └── __init__.py
│   ├── db/                   # Database interaction logic
│   │   ├── database.py       # DB Session and engine setup
│   │   └── models.py         # SQLAlchemy/SQLModel database table models
│   ├── models/               # Pydantic models for request/response validation
│   │   ├── media.py          # Schemas for media files
│   │   └── __init__.py
│   ├── services/             # Business logic layer
│   │   ├── transcription.py  # Logic for calling Whisper
│   │   └── __init__.py
│   ├── __init__.py
│   └── main.py               # Main application entrypoint
├── data/                     # Where your uploaded files will be stored
│   ├── audio/
│   ├── transcripts/
│   └── video/
├── tests/                    # future tests will go here
│   └── ...
├── .env                      # environment variables (NEVER commit this)
├── .gitignore                # To ignore files like .env, data/, __pycache__/
├── LICENSE                
├── README.md
└── requirements.txt          # List of project dependencies
```

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### 1. Prerequisites

*   Python 3.9+
*   `git`

### 2. Clone the Repository

```bash
git clone <repo-url>
cd caipo_backend
```

### 3. Set Up a Virtual Environment

It's highly recommended to use a virtual environment to manage dependencies.

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```
This will install FastAPI, Uvicorn, Whisper, and other necessary packages.

### 5. Configure Environment Variables

Create a `.env` file in the project root by copying the example file.

```bash
cp .env.example .env
```

The `.env` file is where you'll store secret keys and environment-specific settings. For now, the defaults in `.env.example` are sufficient to run the application.

`.env.example`:
```
# Application Settings
APP_NAME="CAIPO Backend API"
API_V1_STR="/api/v1"
```

### 6. Run the Application

Now, start the development server.

```bash
uvicorn app.main:app --reload
```
*   `uvicorn`: The ASGI server that runs your application.
*   `app.main:app`: Tells Uvicorn where to find the FastAPI instance (the `app` object in the `app/main.py` file).
*   `--reload`: Automatically restarts the server whenever you make changes to the code.

The server will be running at `http://127.0.0.1:8000`.

## 📝 Using the API

Once the server is running, you can interact with the API.

### Interactive API Docs (Recommended)

The easiest way to explore and test the endpoints is by using the automatically generated Swagger UI.

Navigate to **`http://127.0.0.1:8000/docs`** in your browser.

You will see a full, interactive API documentation page where you can test endpoints, see models, and view responses directly.

### `curl` Examples

You can also use a command-line tool like `curl` to interact with the API.

#### Health Check

Verify that the service is running.

```bash
curl -X GET http://127.0.0.1:8000/api/v1/healthz
```

**Expected Response:**
```json
{
  "status": "ok"
}
```

#### Upload an Audio File

Send a `POST` request with a multipart form to the `/upload/audio` endpoint.

```bash
curl -X POST -F "file=@/path/to/your/audio.mp3" http://127.0.0.1:8000/api/v1/upload/audio
```
*Replace `/path/to/your/audio.mp3` with the actual path to an audio file on your machine.*

**Expected Response:**
The API will respond immediately with a file ID, and the transcription will start in the background.
```json
{
  "status": "success",
  "file_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "filename": "audio.mp3"
}
```

After the request, you can check your local file system:
*   The uploaded audio will be in `data/audio/<file_id>.<ext>`.
*   Once transcription is complete, the transcript will be saved in `data/transcripts/<file_id>.json`.
# CAIPO Backend - v0.1 Prototype

[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Framework](https://img.shields.io/badge/FastAPI-0.115.6-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This repository contains the backend server for the CAIPO (Capture and AI Processed Output) prototype. It's a robust and scalable service for handling media uploads, processing them asynchronously, and serving the results.

> **Sprint Goal:** End-to-end: ESP32 (or sim) → audio/video → backend → batch Whisper transcript → embeddings search → tiny viewer. Quickstart ≤15 min.

## ✨ Key Features

*   **Asynchronous Processing:** Heavy tasks like AI transcription are run as background jobs, ensuring fast API response times (≤100ms) and preventing HTTP timeouts.
*   **Audio & Video Ingestion:** Endpoints to upload both audio and video files. Video files automatically have their audio extracted for processing.
*   **Job Status Tracking:** A dedicated `/status` endpoint allows clients to poll for the status of a processing job (`processing`, `completed`, `failed`).
*   **AI Integration:** A service-oriented architecture integrates OpenAI's Whisper for high-quality transcription.
*   **Observability:** Built-in middleware logs every request with a unique ID and processing latency for easy debugging.
*   **Automatic Docs:** Interactive API documentation (Swagger UI) is available out-of-the-box for easy testing and exploration.

## 🛠️ Technology Stack

*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
*   **Server:** [Uvicorn](https://www.uvicorn.org/)
*   **Database:** [SQLModel](https://sqlmodel.tiangolo.com/) on [SQLite](https://www.sqlite.org/index.html)
*   **AI Model:** [OpenAI Whisper](https://github.com/openai/whisper)
*   **Media Processing:** [FFmpeg](https://ffmpeg.org/) (via `ffmpeg-python`)

## 📂 Project Structure

The project follows a professional structure that emphasizes separation of concerns.

```text
caipo_backend/
├── app/                      # All our main application code lives here
│   ├── api/                  # API-specific code (endpoints/routers)
│   │   └── v1/               # Good practice to version your API
│   │       ├── endpoints/
│   │       │   ├── health.py # For the /healthz endpoint
│   │       │   ├── status.py   # Handles polling for job status and results
│   │       │   └── upload.py # For /upload/audio and /upload/video
│   │       ├── __init__.py
│   │       └── api.py        # Gathers all v1 routers
│   ├── core/                 # Core logic, config, logging
│   │   ├── config.py         # Manages environment variables
│   │   └── __init__.py
│   ├── db/                   # Database interaction logic
│   │   ├── database.py       # DB Session and engine setup
│   │   └── models.py         # SQLModel database table models
│   ├── models/               # Pydantic models for request/response validation
│   │   ├── media.py          # Schemas for media file uploads
│   │   ├── status.py         # Pydantic schemas for the status response
│   │   └── __init__.py
│   ├── services/             # Business logic layer
│   │   ├── transcription.py  # Logic for calling Whisper
│   │   ├── video_processing.py # Logic for extracting audio from video
│   │   └── __init__.py
│   ├── __init__.py
│   └── main.py               # Main application entrypoint
├── data/                     # Where your uploaded files will be stored
│   ├── audio/
│   ├── transcripts/
│   └── video/
├── tests/                    # Future tests will go here
│   └── ...
├── .env                      # Environment variables 
├── .gitignore                # To ignore files like .env, data/, __pycache__/
├── LICENSE                
├── README.md
├── caipo_prototype.db        # The SQLite database file
└── requirements.txt          # List of project dependencies
```

## 🚀 Getting Started

Follow these instructions to get the project running on your local machine.

### 1. Prerequisites

*   Python 3.9+
*   `git`
*   **FFmpeg:** This is a system-level dependency required for video processing. You must install it and ensure it's available in your system's PATH. Download it from [ffmpeg.org](https://ffmpeg.org/download.html).

### 2. Clone the Repository

```bash
git clone <repo-url>
cd caipo_backend
```

### 3. Set Up a Virtual Environment

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


### 5. Run the Application

Start the development server. The server will create the `caipo_prototype.db` file on its first run.

```bash
uvicorn app.main:app --reload
```
The server will be running at `http://127.0.0.1:8000`.

## 📝 API Usage and Workflow

The API uses an asynchronous workflow for all media processing.

**Workflow:**
1.  **`POST`** a media file to an `/upload` endpoint. The server responds immediately with a `file_id`.
2.  **`GET`** the `/status/{file_id}` endpoint to check the progress of the job.
3.  Once the status is `completed`, the response will contain the full transcript.

### Interactive API Docs (Recommended)

The easiest way to test is using the auto-generated Swagger UI. Navigate to **`http://127.0.0.1:8000/docs`** in your browser.

### `curl` Examples

#### 1. Upload a Media File

This example uploads an audio file. The process for video is identical, just use the `/upload/video` endpoint.

```bash
curl -X POST -F "file=@/path/to/your/audio.mp3" http://127.0.0.1:8000/api/v1/upload/audio
```

**Expected Immediate Response:**
```json
{
  "status": "success",
  "file_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "filename": "audio.mp3"
}
```
**Save the `file_id` from the response.**

#### 2. Check Job Status

Use the `file_id` you received to poll the status endpoint.

```bash
curl http://127.0.0.1:8000/api/v1/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response while processing:**
```json
{
  "file_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "processing",
  "message": "File is currently being processed.",
  "transcript_text": null,
  "segments": null
}
```

**Response when completed:**
```json
{
  "file_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "message": "Processing completed successfully.",
  "transcript_text": "The quick brown fox jumps over the lazy dog.",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 4.1,
      "text": " The quick brown fox jumps over the lazy dog."
    }
  ]
}
```

#### 3. Health Check

Verify that the service is running.

```bash
curl -X GET http://127.0.0.1:8000/api/v1/healthz
```
**Expected Response:** `{"status": "ok"}`

## ✅ Verifying Database Operations

Since the API uses background processing, the database is the "single source of truth" for the status of any job. Here’s how you can directly inspect the SQLite database to verify that data is being saved and updated correctly. This is the definitive way to confirm the acceptance criteria: `file exists on disk + DB row`.

**Prerequisite:** The `sqlite3` command-line tool. This is typically included with standard Python installations.

### Step-by-Step Guide

1.  **Navigate to the Project Root**

    Make sure your terminal is in the `caipo_backend/` directory, where the `caipo_prototype.db` file is located.

2.  **Open the Database File**

    Run the following command to start the SQLite interactive shell and open the database file:
    ```bash
    sqlite3 caipo_prototype.db
    ```
    Your command prompt will change to `sqlite>`.

3.  **Format the Output (Recommended)**

    To make the query results readable, run these two commands inside the SQLite shell:
    ```sqlite
    .headers on
    .mode column
    ```

4.  **Query the Data**

    Now, you can run SQL queries. To see the most important fields for all the files you've uploaded, run:
    ```sqlite
    SELECT id, file_id, filename, status, transcript_path FROM mediafile;
    ```
    or to show all columns of table,
    run:
    ```sqlite
    SELECT * FROM mediafile;
    ```    
5.  **Analyze the Results**

    **Immediately after uploading a new file**, the output will show the record in its initial `uploaded` or `processing` state:
    ```
    id  file_id                               filename   status      transcript_path
    --  ------------------------------------  ---------  ----------  ---------------
    1   a1b2c3d4-e5f6-7890-abcd-ef1234567890  audio.wav  processing
    ```

    **After the background job is complete**, run the same `SELECT` command again. You will see the record has been updated. Notice the `status` is now `completed` and the `transcript_path` is filled in:
    ```
    id  file_id                               filename   status     transcript_path
    --  ------------------------------------  ---------  ---------  -------------------------------------------
    1   a1b2c3d4-e5f6-7890-abcd-ef1234567890  audio.wav  completed  data/transcripts/a1b2c3d4-....json
    ```

6.  **Exit the SQLite Shell**

    When you are finished, you can exit the tool by typing:
    ```sqlite
    .exit
    ```

This direct inspection is the fastest way to confirm your acceptance criteria and debug any issues with data persistence or background job updates.
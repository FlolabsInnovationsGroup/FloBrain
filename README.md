<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
# CAIPO
CAIPO is a transcription device thought to be ergonomic and easy to use. It records audio and video of its surroundings to provide an accurate transcription of any dialogue happening in its vicinity and provide detailed information about the recorded scene.

## Bill of materials
| Component | Reference | Internal resources | Store links |
|-----------|-----------|--------------------|-------------|
| Microcontroller board | Seeed Studio Xiao ESP32-S3 Sense | [Introductory software](https://github.com/FlomadLabsRD/Seeed-Studio-Xiao-ESP32-S3-Sense) | [Amazon](https://www.amazon.com/Seeed-Studio-XIAO-ESP32-Sense/dp/B0C69FFVHH/ref=sr_1_22_sspa?crid=RPA3F6MZ3AM6&dib=eyJ2IjoiMSJ9.Bbi0rItDlZp4p_vjHEq7eIEcKgl7-atHllt6tRHkHq216HDOucLBV-dAVq4pqtKFGpQH1IHx9HF3oFqXo4ILhjqrVpqxn3SZlL4bp1KTMqo19yNanTtErzT0_9JJMHciog8P15sLbmLtee0nEIeZys2OqB2EViAbmdEdc1Gg9b6UC9ba87QnePvVNyCTK9L6.pgxWLi-5dZkPG_k_jMakC0cvl1NaDyPSoZoDQGG7Cwk&dib_tag=se&keywords=esp32%2Bpower%2Bsupply&qid=1718676384&sprefix=esp32%2Bpower%2Bsupply%2Caps%2C155&sr=8-22-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&th=1) |
| Power Supply Distribution Board (PSDB) | Keenso0x6zgrh12c | *Not required* | [Amazon](https://www.amazon.com/Keenso-Supply-Distribution-Connection-Connectors/dp/B0BQFBM7DP/ref=sr_1_22?sr=8-22) |
| Haptic Motor Controller | DRV2605L | *Not yet implemented* | [Amazon](https://www.amazon.com/Quality-Controller-General-DRV2605L-Generate/dp/B0B6CK4XLF/ref=sr_1_1_sspa?sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1) |
| Class D Amplifier Breakout Interface | MAX98357 | *Not required* | [Amazon](https://www.amazon.com/Rakstore-MAX98357-MAX98357A-Amplifier-Interface/dp/B09L6VL43Q/ref=sr_1_15?sr=8-15) |
| Thin Plastic Speaker | Adafruit 1891 | *Not required* | [Amazon](https://www.amazon.com/Speakers-Transducers-Plastic-Speaker-Wires/dp/B00N4YW7G4/ref=sr_1_1?dib=eyJ2IjoiMSJ9.iV-2gPgcTqRJ-VW6POceWkS15KXiy8dYNtHbAhtFkgmQjfxldJuIeyuhsbUccOu3Biokh6w0aCqr-LbmMSX_Ol3j9HSU_TyUK9z8Ns_tyHL1k2SB21Wit0ySpF43LdxKy856yQkQHrXNJBsp_IjI8BZNgNy-hnbnvDmomaC1BacajAp2X8lko1nFWj-CwlyVWZk_a8CrEvZNx-LZjlL_gLOOelbRSzQ1v1kpIqRLlYE.zzs3MDdakk9z4JXR-V543JXn12xn16SlgfJk_ZvYDg0&dib_tag=se&keywords=adafruit+speaker&qid=1730595791&sr=8-1) |
| Individually Addressable Smart RGB LED | WS2812BLEDW-W100pcs | *Not required* | [Amazon](https://www.amazon.com/BTF-LIGHTING-WS2812B-Heatsink-10mm3mm-WS2811/dp/B01DC0J0WS/ref=sr_1_5?crid=27WXRQOMND7NF&dib=eyJ2IjoiMSJ9.1IpMYYKy-PwaqBnVhgqgaiT_CTifLDDTHnOBE1CAT0Jk91YvC48m9HzK-NmXNjqX7NEIxqGTutSMJhMdP1MiWPWzQa_aPB9i6JGbyveG0TzKSxdtqceDa8dX0ZJsFvTStXM_l2-NRUaymIQWBylUavU_m4_u6DJbWctBbBMEsG2PA4NLu5szrOAQ_tdO4lbEfYVzX6N9fPFqHXoXTFBjJqsDsmERVXIaO92ToH6g6Zso_PvX1mCBlwL7-jwccGMp9wECiWdoDEWdDMxJrwn5bcmxRQe0OZEk30l7nv3raZQ.2jtj14DYyMwAj5_93vXd4X8-kk4lox_pQQaY6anoN0Y&dib_tag=se&keywords=WS2812B%2BNeoPixel&qid=1730594248&sprefix=ws2812b%2Bneopixel%2Caps%2C117&sr=8-5&th=1) |
| Mini Vibration Motors | B07Q1ZV4MJ | *Not yet implemented* | [Amazon](https://www.amazon.com/tatoko-Vibration-Button-Type-Vibrating-Appliances/dp/B07Q1ZV4MJ?content-id=amzn1.sym.4311067e-a9df-4e8a-a5ce-d6836ea1723b) |
| Thin Film Pressure Sensor | MD30-60 | *Not required* | [Amazon](https://www.amazon.com/Pressure-Sensitivity-Sensitive-Automotive-Electronics/dp/B0BSLN4NFR?content-id=amzn1.sym.4311067e-a9df-4e8a-a5ce-d6836ea1723b) |
=======
# AI Pipeline Integration Service

This project implements a robust backend service for orchestrating AI processing on media files (audio, video, and images). It manages a sequential pipeline of jobs—such as transcription, summarization, and embedding—by communicating with an external AI service over HTTP.

The service is designed to be resilient, featuring automatic retries with backoff, configurable timeouts, and detailed audit logging for each AI job.
>>>>>>> origin/feature/ai-pipeline
=======
# CAIPO Backend - v0.1 Prototype

[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Framework](https://img.shields.io/badge/FastAPI-0.104.0-green.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
>>>>>>> origin/15-backend-api-critical-path--caipo-sprint

This repository contains the backend server for the CAIPO (Capture and AI Processed Output) prototype. It's designed to be a lightweight, robust, and scalable service for handling media uploads, processing them with AI models, and serving the results.

<<<<<<< HEAD
<<<<<<< HEAD
## Hardware Simulation
### Online Simulation
You may sometimes need to run the source code without the hardware at hand. For those situations, we have a Wokwi simulation you can customise to your needs. All files are inside the [Simulation](https://github.com/FlomadLabsInternational/Caipo-flomad-labs/tree/main/Simulation) folder.
=======
> **Sprint Goal:** End-to-end: ESP32 (or sim) → audio/video → backend → batch Whisper transcript → embeddings search → tiny viewer. Quickstart ≤15 min.
>>>>>>> origin/15-backend-api-critical-path--caipo-sprint

## ✨ Key Features

<<<<<<< HEAD
### Local Simulation
To Simulate on your machine, you can use Wokwi with the VS code extension.
To get started with the VS Code extension, you can check the official guide: https://docs.wokwi.com/vscode/getting-started
=======
nano README.md
# CAIPO Backend

CAIPO Backend provides secure media ingestion APIs, request validation, and AI orchestration (transcription, detection, segmentation). It stores metadata in PostgreSQL and integrates with AI services.

## Tech stack
- Node.js (Express)
- PostgreSQL
- Zod (validation)
- Jest (tests)
- Swagger/OpenAPI + Postman
=======
-   **Asynchronous Job Orchestration**: Kicks off a multi-step AI pipeline for a media item without blocking the client.
-   **Fixed Job Pipeline**: Executes jobs in a predefined order: `transcription` -> `summary` -> `tags` -> `embedding`.
-   **Conditional Logic**: Intelligently skips jobs based on media type (e.g., skips transcription for images).
-   **Resilient & Robust**: Implements a configurable retry mechanism with backoff for transient failures.
-   **Detailed Auditing**: Records the outcome, latency, and metadata for every job attempt in an `ai_results` table.
-   **State Management**: Tracks the status of each media item (`pending_processing`, `processing`, `processed`, `error`).
-   **Secure Endpoints**: Protects endpoints to ensure users can only process and view results for media they own.

## Getting Started

Follow these instructions to get the project set up and running on your local machine for development and testing.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   A running instance of the external "AI Service" that this application calls.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Install Dependencies

Install all the required npm packages.
>>>>>>> origin/feature/ai-pipeline

## Quick start
```bash
npm install
cp .env.example .env
createdb flolabs_dev || true
createdb flolabs_test || true
npm run migrate
npm run seed
npm run dev

<<<<<<< HEAD
npm run seed
npm run dev
>>>>>>> main

=======
### 3. Configure Environment Variables

This project uses a `.env` file to manage environment-specific configurations.

1.  Create a new file named `.env` in the root of the project.
2.  Copy the contents of the template below and paste it into your new `.env` file.

**`.env` file contents:**

```env
# --- Server Configuration ---
PORT=3000

# --- AI Pipeline Configuration ---
# The base URL for the external AI service
AI_SERVICE_BASE_URL=http://localhost:4010

# A comma-separated list of AI tasks to run.
AI_TASKS_ALLOWED=transcription,summary,tags,embedding

# The hard timeout in milliseconds for each individual AI job request.
AI_JOB_TIMEOUT_MS=60000

# The number of times to retry a failed job (e.g., 2 means 1 initial attempt + 2 retries = 3 total).
AI_MAX_RETRIES=2

# The fixed backoff time in milliseconds to wait between retry attempts.
AI_RETRY_BACKOFF_MS=1500
```

### 4. Running the Application

To run the server in development mode with automatic reloading on file changes, use the `start` script.

```bash
npm start
```

The server should now be running and accessible at `http://localhost:3000`.

## Usage & Testing with cURL

Once the server is running, you can use a tool like `cURL` to test the API endpoints. The current implementation uses mock database data, so you can use the predefined media IDs (`owned_audio_1`, `owned_image_1`) for testing.

### Test 1: Start Processing for an Audio File

This simulates the "happy path" request. The server accepts the request and starts the background processing.

```bash
curl -v -X POST http://localhost:3000/api/v1/ai/process/owned_audio_1
```
**Expected Outcome**: An immediate `HTTP/1.1 202 Accepted` response. The server logs will show the job pipeline executing (and failing on `transcription` as per our current test setup).

### Test 2: Start Processing for an Image File

This tests the conditional logic. The job plan in the response should **not** include `transcription` or `summary`.

```bash
curl -v -X POST http://localhost:3000/api/v1/ai/process/owned_image_1
```
**Expected Outcome**: A `202 Accepted` response. The `plan` array in the JSON response body will be `["tags", "embedding"]`.

### Test 3: Attempt to Process Non-Existent Media

This tests the ownership and existence guard.

```bash
curl -v -X POST http://localhost:3000/api/v1/ai/process/non_existent_media_123
```
**Expected Outcome**: An `HTTP/1.1 404 Not Found` response.

### Test 4: Attempt to Process an Already-Processing Media Item

This tests the idempotency guard. For this test, you would need to modify the database mock in `src/features/ai-pipeline/ai.service.ts` to return a media item with the status `processing`.

```bash
# Assuming a 'processing_media_1' exists in the mock DB with 'processing' status
curl -v -X POST http://localhost:3000/api/v1/ai/process/processing_media_1
```
**Expected Outcome**: An `HTTP/1.1 409 Conflict` response with the message "Media is already being processed."

### Test 5: Retrieve AI Results for a Media Item

This tests the results endpoint.

```bash
curl -v http://localhost:3000/api/v1/ai/results/owned_audio_1
```
**Expected Outcome**: An `HTTP/1.1 200 OK` response with a JSON array of the AI results recorded for that media ID.

## API Reference

All endpoints are prefixed with `/api/v1`. Authentication is required.

### Start AI Processing

-   **URL**: `/ai/process/:mediaId`
-   **Method**: `POST`
-   **Success Response** (`202 Accepted`):
    ```json
    {
      "success": true,
      "data": {
        "media_id": "owned_audio_1",
        "started": true,
        "plan": ["transcription", "summary", "tags", "embedding"]
      }
    }
    ```

### View AI Results

-   **URL**: `/ai/results/:mediaId`
-   **Method**: `GET`
-   **Success Response** (`200 OK`):
    ```json
    {
      "success": true,
      "data": [
        {
          "job_type": "tags",
          "model_name": "tag-model-v2",
          "latency_ms": 350,
          "status": "done",
          "error_message": null,
          "created_at": "2025-11-16T10:29:50.000Z"
        }
      ]
    }
    ```

## Project Structure

The project follows a feature-based architecture to promote modularity and separation of concerns.

```plaintext
.
├── src/
│    ├── features/
│    │   └── ai-pipeline/
│    │       ├── ai.controller.ts   # Handles incoming HTTP requests and responses.
│    │       ├── ai.service.ts      # Contains the core orchestration logic.
│    │       ├── ai.routes.ts       # Defines the API endpoints.
│    │       └── ai.types.ts        # Holds TypeScript interfaces.
│    ├── services/
│    │   └── aiServiceAdapter.ts    # Client for the external AI service.
│    ├── config/
│    │   └── ai.config.ts         # Loads and validates environment variables.
│    ├── utils/
│    │   └── logger.ts            # Utility for structured logging.
│    └──  app.ts                     # Main application file.
├── .env
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```
>>>>>>> origin/feature/ai-pipeline
=======
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
>>>>>>> origin/15-backend-api-critical-path--caipo-sprint

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

## Getting started with the firmware
The firmware was thought to be run using Arduino IDE, the best tool for the Microcontroller we're using in this version of the device.

<<<<<<< HEAD
## Hardware Simulation
### Online Simulation
You may sometimes need to run the source code without the hardware at hand. For those situations, we have a Wokwi simulation you can customise to your needs. All files are inside the [Simulation](https://github.com/FlomadLabsInternational/Caipo-flomad-labs/tree/main/Simulation) folder.

To run the simulation, you can go directly to the [Simulation on wokwi.com](https://wokwi.com/projects/411276781876475905) or create your own by creating a XIAO-ESP32-S3 project and including the files in the folder.

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

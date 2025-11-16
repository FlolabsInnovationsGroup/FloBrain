# AI Pipeline Integration Service

This project implements a robust backend service for orchestrating AI processing on media files (audio, video, and images). It manages a sequential pipeline of jobs—such as transcription, summarization, and embedding—by communicating with an external AI service over HTTP.

The service is designed to be resilient, featuring automatic retries with backoff, configurable timeouts, and detailed audit logging for each AI job.

## Features

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

```bash
npm install
```

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
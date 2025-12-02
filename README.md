# CAIPO AI Backend Service

[![Node.js Version](https://img.shields.io/badge/node-20.x-blue.svg)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Express.js-5.x-green.svg)](https://expressjs.com/)
[![Language](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This repository contains the Node.js/Express backend service for the CAIPO project. It provides a robust, secure, and scalable API for managing media, fetching user profiles, and orchestrating complex AI processing pipelines.

## ✨ Key Features

-   **Secure API Endpoints**: Production-ready middleware including CORS, Helmet for secure headers, and rate limiting to prevent abuse.
-   **Paginated Media & Filtering**: A powerful `/api/v1/media` endpoint to list user media with professional pagination and filtering by type or status.
-   **User Profile Management**: A dedicated `/api/v1/users/me` endpoint for fetching authenticated user profiles.
-   **Centralized JSON Error Handling**: A robust global error handler that ensures all API errors are returned in a consistent, predictable JSON format.
-   **Structured, Asynchronous Logging**: High-performance logging with Pino, configured for human-readable output in development and efficient JSON output in production.
-   **Scalable Feature-Based Architecture**: Code is organized by feature (users, media, ai-pipeline) for maintainability and clean separation of concerns.

## 🛠️ Technology Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Language**: TypeScript
-   **Logging**: Pino
-   **Security**: Helmet, Express Rate Limit, CORS
-   **Development**: ts-node-dev, dotenv

## 📂 Project Structure

The project follows a clean, feature-based architecture that is easy to navigate and scale.

```plaintext
.
├── src/
│   ├── features/
│   │   ├── ai-pipeline/    # Logic for orchestrating AI jobs
│   │   ├── media/          # Endpoints for listing and managing media
│   │   └── user/           # Endpoints for user profile management
│   ├── middleware/
│   │   ├── errorHandler.ts # Global JSON error handler
│   │   └── isAuthenticated.ts # Mock authentication middleware
│   ├── services/
│   │   └── aiServiceAdapter.ts # Client for external AI services
│   ├── utils/
│   │   ├── AppError.ts     # Custom error class for HTTP status codes
│   │   ├── catchAsync.ts   # Wrapper for async controller functions
│   │   └── logger.ts       # Pino logger configuration
│   └── app.ts              # Main Express application setup
├── .env.example            # Environment variable template
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or later recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 3. Install Dependencies

Install all the required npm packages.

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root by copying the example file. This file stores all your configuration and secrets.

```bash
cp .env.example .env
```

Now, open the `.env` file and ensure the variables are set correctly for your local environment.

```env
# --- Server Configuration ---
PORT=3000

# --- Logging Configuration ---
# Log level (e.g., 'debug', 'info', 'warn', 'error')
LOG_LEVEL=info

# --- AI Pipeline Configuration ---
# The base URL for the external AI service (mock or real)
AI_SERVICE_BASE_URL=http://localhost:4010

# A comma-separated list of AI tasks to run
AI_TASKS_ALLOWED=transcription,summary,tags,embedding

# The timeout in milliseconds for each AI job request
AI_JOB_TIMEOUT_MS=60000

# Number of times to retry a failed job (e.g., 2 = 1 initial attempt + 2 retries)
AI_MAX_RETRIES=2

# The backoff time in milliseconds to wait between retries
AI_RETRY_BACKOFF_MS=1500
```

### 5. Run the Application

Start the server in development mode. It will automatically restart when you save changes to a file.

```bash
npm start
```

The server is now running and accessible at `http://localhost:3000`. Your terminal will show:
`[INFO] Server is running on port 3000`

## ✅ API Testing Guide

The best way to test the API is with a client like [Postman](https://www.postman.com/) or Insomnia. All endpoints are prefixed with `/api/v1`.

---

### **1. Security and Error Handling**

#### **Test 404 Not Found**

-   **Request:** `GET http://localhost:3000/api/v1/invalid-route`
-   **Expected Status:** `404 Not Found`
-   **Expected Response Body:**
    ```json
    {
        "status": "fail",
        "error": "Error",
        "message": "Can't find /api/v1/invalid-route on this server!"
    }
    ```

---

### **2. User Endpoint**

#### **Get Current User Profile**

-   **Request:** `GET http://localhost:3000/api/v1/users/me`
-   **Expected Status:** `200 OK`
-   **Expected Response Body:**
    ```json
    {
        "status": "success",
        "data": {
            "user": {
                "id": "mock_user_id_123",
                "email": "test.user@example.com",
                "name": "Test User",
                "createdAt": "2024-01-15T10:00:00.000Z"
            }
        }
    }
    ```

---

### **3. Media Endpoints**

#### **Get Media (Default First Page)**

-   **Request:** `GET http://localhost:3000/api/v1/media`
-   **Expected Status:** `200 OK`
-   **Expected Response:** A paginated response with the first 10 media items.

#### **Get Media with Pagination**

-   **Request:** `GET http://localhost:3000/api/v1/media?page=2&limit=3`
-   **Expected Status:** `200 OK`
-   **Expected Response:** The second page of results, containing 3 items.

#### **Get Media with Filtering**

-   **Request:** `GET http://localhost:3000/api/v1/media?media_type=audio&processing_status=error`
-   **Expected Status:** `200 OK`
-   **Expected Response:** A list containing only audio files that have an "error" status.

---

### **4. AI Pipeline Endpoints**

#### **Start AI Processing (Success Case)**

-   **Request:** `POST http://localhost:3000/api/v1/ai/process/owned_audio_1`
-   **Expected Status:** `202 Accepted`
-   **Expected Response Body:**
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

#### **Attempt to Process Non-Existent Media**

-   **Request:** `POST http://localhost:3000/api/v1/ai/process/does-not-exist`
-   **Expected Status:** `404 Not Found`
-   **Expected Response Body:**
    ```json
    {
        "status": "fail",
        "error": "Error",
        "message": "Media not found or you do not have permission to access it."
    }
    ```

#### **Attempt to Process Already-Processing Media**

-   **Request:** `POST http://localhost:3000/api/v1/ai/process/processing_media_1`
-   **Expected Status:** `409 Conflict`
-   **Expected Response Body:**
    ```json
    {
        "status": "fail",
        "error": "Error",
        "message": "Media is already being processed."
    }
    ```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
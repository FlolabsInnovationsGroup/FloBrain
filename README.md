# Robust Error Handling & Logging in Node.js

This project is a comprehensive showcase of a production-grade error handling, observability, security, and reliability system for an Express.js application. It is designed to be a robust foundation for building scalable and maintainable web services, ensuring that all errors are handled gracefully, all events are logged structurually, and the service is resilient against common threats.

## Core Features

This project implements a wide range of best practices for modern web services:

#### Observability & Error Handling
-   **Structured JSON Logging:** All log output is in single-line JSON format using `pino` for high performance and easy parsing by log aggregators (like Datadog, Splunk, or the ELK stack).
-   **Request Correlation:** Every request is assigned a unique `request_id`, included in all log lines and API responses for seamless end-to-end tracing.
-   **Centralized Error Handling:** A single, global error handling middleware catches all exceptions, guaranteeing consistent and safe error responses.
-   **Standardized JSON Error Responses:** All API errors return a predictable JSON object, preventing stack traces or sensitive information from being leaked to the client.
-   **Custom Error Taxonomy:** A clear set of custom error classes (`NotFoundError`, `ValidationError`, etc.) maps directly to HTTP status codes, making the codebase declarative and easy to reason about.
-   **Async Context for Logging:** Uses Node.js's `AsyncLocalStorage` to provide request-specific context (like the logger) to deep service layers without prop-drilling.

#### Reliability & Performance
-   **Graceful Shutdown:** The server correctly handles termination signals (`SIGINT`, `SIGTERM`) to finish in-progress requests and close database connections before exiting.
-   **Database Performance Monitoring:** Includes a wrapper for database queries that automatically logs any query exceeding a configurable threshold (e.g., 200ms).
-   **Efficient Database Pooling:** Manages PostgreSQL connections efficiently using a connection pool.

#### Security & Validation
-   **Schema-Driven Input Validation:** Utilizes `Zod` to enforce strict validation schemas on all incoming request bodies, preventing invalid data before it hits business logic.
-   **Configurable Rate Limiting:** Protects against DoS and brute-force attacks using `express-rate-limit`, with separate configurable limits for general API use and sensitive endpoints.
-   **Automatic PII Redaction in Logs:** The logger is configured to automatically find and censor sensitive fields (`password`, `email`, `authorization`, etc.) in any object it logs, preventing accidental PII leaks.
-   **Secure Password Hashing:** Uses `bcrypt` to securely hash and store user passwords, never storing them in plaintext.
-   **Security Headers:** Leverages `helmet` to apply essential security headers (like CSP, HSTS) to all responses, mitigating common web vulnerabilities.

## Project Structure

The project follows a feature-oriented structure designed for scalability and separation of concerns.

```
.
├── .env
├── .gitignore
├── README.md
├── package.json
├── src/
│   ├── app.js                    # Main application entry point & middleware wiring
│   ├── config/
│   │   └── index.js              # Loads and exports configuration from .env
│   ├── controllers/
│   │   ├── media.controller.js
│   │   └── user.controller.js      # Handles business logic for API routes
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   ├── notFoundHandler.js
│   │   ├── requestCorrelator.js
│   │   ├── requestLogger.js
│   │   └── validate.js             # Reusable Zod validation middleware
│   ├── routes/
│   │   ├── index.js
│   │   ├── media.routes.js
│   │   └── user.routes.js          # Route definitions
│   ├── services/
│   │   ├── db.js
│   │   ├── logger.js
│   │   ├── real-db-connection.js
│   │   └── request-context.js      # AsyncLocalStorage setup
│   ├── utils/
│   │   └── customErrors.js         # Custom error class definitions
│   └── validators/
│       ├── media.validator.js
│       └── user.validator.js       # Zod schema definitions
└── logs/
    └── .gitkeep
```

## Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version, e.g., 18.x or later)
-   [npm](https://www.npmjs.com/)
-   A running **PostgreSQL** instance.
-   A database management tool like [DBeaver](https://dbeaver.io/) to set up the initial schema.

## Setup & Installation

**1. Clone the repository:**
```bash
git clone <your-repo-url>
cd <your-repo-name>
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure Environment Variables:**
Create a `.env` file in the project root. Copy the contents below and replace the `DATABASE_URL` with your actual PostgreSQL connection string.

```env
# Logging Configuration
# If LOG_DEST=stdout, logs appear in the console.
# If LOG_DEST=file, logs are written to ./logs/app.log.
LOG_LEVEL=info
LOG_DEST=stdout
LOG_SAMPLING_DEBUG=0

# General Rate Limiting (for all API routes)
API_RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
MAX_REQUESTS_PER_WINDOW=200

# Stricter Upload Rate Limiting
UPLOAD_RATE_LIMIT_WINDOW_MS=3600000 # 1 hour
MAX_UPLOADS_PER_WINDOW=20

# Request/Response Configuration
REQUEST_ID_HEADER=X-Request-ID
ERROR_RESPONSE_INCLUDE_TRACE=false

# Database Connection
DATABASE_URL="postgresql://postgres:1234@localhost:5432/postgres"
```

**4. Set Up the Database Schema:**
Open your database tool (e.g., DBeaver) and run the following script to create the required `users` table with the correct schema.

```sql
-- Drop the table if it exists to ensure a clean setup
DROP TABLE IF EXISTS users;

-- Recreate the table with the new 'password' column
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  quota INT DEFAULT 100,
  -- Password column stores the bcrypt hash, which is longer than a normal password
  password VARCHAR(255) NOT NULL
);

-- Insert a sample user for the media upload endpoint to interact with
INSERT INTO users (id, email, password, quota) VALUES (1, 'testuser@example.com', 'placeholder_hash', 100);
```

## Running the Application

To start the server, run the following command. The application will be available at `http://localhost:3000`.

```bash
npm start
```

---

## API Endpoints & Comprehensive Testing

This section provides `curl` commands to test all major features.

### User Management (`/api/v1/users`)

#### Test 1.1: Successful User Creation
**Action:** Create a new user with valid data.
```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com", "password":"MySecurePassword123"}' \
  http://localhost:3000/api/v1/users
```
**Expected Result:**
-   **Status:** `201 Created`
-   **Response Body:** A success message with the user's ID and email.
-   **Server Log:** A log line showing the request body with `email` and `password` fields `[REDACTED]`.
-   **Database:** The `users` table contains the new user with a hashed password.

#### Test 1.2: Validation Failure (Short Password)
**Action:** Attempt to create a user with a password that is too short.
```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"bob@example.com", "password":"short"}' \
  http://localhost:3000/api/v1/users
```
**Expected Result:**
-   **Status:** `400 Bad Request`
-   **Response Body:** An error object with `code: "VALIDATION_FAILED"` and a message like "Password must be at least 8 characters long".

#### Test 1.3: Conflict Failure (Duplicate Email)
**Action:** Attempt to create a user with an email that already exists.
```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com", "password":"AnotherPassword123"}' \
  http://localhost:3000/api/v1/users
```
**Expected Result:**
-   **Status:** `409 Conflict`
-   **Response Body:** An error object with `code: "USER_CONFLICT"` and a message "A user with this email already exists."

---

### Media Management (`/api/v1/media`)

#### Test 2.1: Successful Media Upload
**Action:** Simulate a successful file upload by an authenticated user.
```bash
curl -i -X POST \
  -H "Authorization: Bearer fake-token" \
  -H "Content-Type: application/json" \
  -d '{"filename":"my-vacation-photo.jpg"}' \
  http://localhost:3000/api/v1/media/upload
```
**Expected Result:**
-   **Status:** `202 Accepted`
-   **Database:** The `quota` for the user with `id = 1` will be decremented.

#### Test 2.2: Rate Limiting Failure
**Action:** Set `MAX_UPLOADS_PER_WINDOW=2` in your `.env` and restart the server. Run the successful upload command 3 times in a row.
```bash
# Run this command 3 times
curl -i -X POST \
  -H "Authorization: Bearer fake-token" \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.jpg"}' \
  http://localhost:3000/api/v1/media/upload
```
**Expected Result:**
-   The first two requests will return `202 Accepted`.
-   The third request will return **`429 Too Many Requests`** with `code: "TOO_MANY_REQUESTS"`.

---

### Server Operations

#### Test 3.1: Graceful Shutdown
**Action:** In the terminal where the server is running, press `Ctrl+C`.
**Expected Result:**
-   The server does not exit instantly. Instead, it logs a clean shutdown sequence:
    ```
    {"level":"info",...,"msg":"Shutdown signal received. Starting graceful shutdown."}
    {"level":"info",...,"msg":"HTTP server closed. No longer accepting new connections."}
    {"level":"info",...,"msg":"Closing database connection pool."}
    {"level":"info",...,"msg":"Database pool closed. Exiting process."}
    ```
## API Response Guide

The API adheres to a standardized response format for all requests. This ensures that clients can handle responses in a consistent and predictable manner.

### Success Responses

All successful responses will have a root-level `success` key set to `true` and a `status` code in the `2xx` range. The body will vary by endpoint but will typically include a `message` or a `data` object.

**Example: `202 Accepted` from `POST /api/v1/media/upload`**

```json
{
  "success": true,
  "message": "Media accepted for processing and user quota updated.",
  "request_id": "2fd2c193-1492-4c2b-8452-d213ed84a143"
}
```

### Error Responses

All error responses will have a root-level `success` key set to `false` and a `status` code in the `4xx` or `5xx` range. The body will always contain a nested `error` object with a machine-readable `code`.

**Standard Error Structure:**

```json
{
  "success": false,
  "error": {
    "code": "<ERROR_CODE>",
    "message": "<A clean, user-friendly message>",
    "request_id": "<The request correlation ID>"
  }
}
```

### Common Error Codes

The following table details the most common error codes returned by the API.

| Error Code | HTTP Status | Default Message | Cause |
| :--- | :--- | :--- | :--- |
| `VALIDATION_FAILED` | 400 | Validation failed | A required field is missing or a value is in an invalid format. |
| `VALIDATION_BODY` | 400 | Malformed JSON in request body | The request body is not valid JSON. |
| `AUTH_MISSING` | 401 | Missing or invalid credentials | The `Authorization` header is missing, invalid, or expired. |
| `FORBIDDEN` | 403 | You do not have permission to perform this action | The user is authenticated but is not authorized for the specific resource. |
| `NOT_FOUND` | 404 | The requested resource was not found | A specific entity (e.g., a user or media file) does not exist. |
| `ROUTE_NOT_FOUND` | 404 | The requested route does not exist | The requested API endpoint (e.g., `/api/v1/nonexistent`) does not exist. |
| `CONFLICT` | 409 | A conflict occurred with the current state of the resource | The request could not be completed due to a conflict (e.g., creating a resource that already exists). |
| `MEDIA_TOO_LARGE`| 413 | The request payload is larger than the server is willing to process | The request body or uploaded file exceeds the configured size limit. |
| `INTERNAL_SERVER_ERROR`| 500 | An unexpected internal error occurred | A generic server error. The cause has been logged, but details are not exposed to the client. |
| `AI_TIMEOUT` | 503 | The service is temporarily unavailable | A downstream dependency, like an AI service, failed to respond in time. |

## Logging

-   If `LOG_DEST=stdout`, all logs will appear in the console where you ran `npm start`.
-   If `LOG_DEST=file`, logs will be written to `./logs/app.log`, with automatic rotation.
-   **Key Fields:** Pay attention to `request_id` to trace a single request's journey and `error_code` in error logs to quickly identify issues.
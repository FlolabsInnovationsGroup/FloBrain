<<<<<<< HEAD
# Core API Layer Project

This repository serves as the foundational layer for a modern, scalable Node.js REST API. It establishes a professional project structure, standardized response contracts, and integrated API documentation out-of-the-box, providing a robust starting point for any new service.

## Features

-   **Structured & Scalable:** Logical separation of concerns for API logic, middleware, and configuration.
-   **Versioned API:** All core endpoints are nested under `/api/v1` to allow for future versions without breaking changes.
-   **Standardized Responses:** A consistent JSON contract for all success and error responses.
-   **Integrated Documentation:** Live, interactive API documentation powered by OpenAPI and Swagger UI.
-   **Centralized Error Handling:** Graceful error handling that prevents stack traces from leaking.

---

## Getting Started

Follow these instructions to get the project set up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version is recommended)
-   [npm](https://www.npmjs.com/) (comes installed with Node.js)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd core-api-project
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a file named `.env` in the root of the project and add the following content. This file is ignored by Git and should not contain sensitive secrets in a public repository.
    ```env
    PORT=3000
    NODE_ENV=development
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```
    *(Note: You may need to add `"start": "node src/server.js"` to the `scripts` section of your `package.json` file).*

    You should see a confirmation message in your terminal: `API listening on http://localhost:3000`

---

## Project Structure

The project follows a feature-oriented structure designed for maintainability and clear separation of concerns.

```
/
├── docs/
│   └── OpenAPI.yaml        # API specification file
├── src/
│   ├── api/                # All API versions and route logic
│   │   └── v1/             # Version 1 of the API
│   │       ├── index.js              # V1 main router
│   │       ├── ping.routes.js        # Routes for the /ping resource
│   │       └── system.routes.js      # Routes for healthcheck & status
│   ├── middleware/         # Custom Express middleware
│   │   ├── error-handler.js    # Global error handler
│   │   └── response-shape.js   # Middleware to standardize responses
│   ├── app.js              # Express app configuration and assembly
│   └── server.js           # The application entry point (starts the server)
├── .env                    # Environment variables (local only)
├── .gitignore              # Files to be ignored by Git
├── package.json            # Project dependencies and scripts
└── README.md               # You are here!
=======
# Express File Upload API

This project is a robust prototype of an Express.js server designed to handle **audio and video file uploads**.
It features a professional and scalable project structure, validation for file types and size limits, and seamless integration with a **PostgreSQL** database to store file metadata.
Files are saved locally in the `/uploads` folder.

---

## Features

- **RESTful Endpoints**: Dedicated endpoints for audio (`POST /upload/audio`) and video (`POST /upload/video`).
- **Multipart/Form-Data Handling**: Efficiently processes file uploads using `multer`.
- **Input Validation**: Strict validation for content types (e.g., `audio/mpeg`, `video/mp4`) and configurable size limits.
- **Database Integration**: Uses **Sequelize ORM** to connect with a **PostgreSQL** database, storing metadata for every uploaded file.
- **File Storage**: Saves files to the local `/uploads` directory and records details in the database.
- **Professional Structure**: Organized into controllers, services, models, and routes for maintainability and scalability.
- **Environment-Based Configuration**: Manages all sensitive data and configurations securely through a `.env` file.

---
## 📁 Project Structure

The project follows a clean, modular structure to separate concerns, making it easy to navigate and extend.

```bash
.
├── src
│   ├── api
│   │   ├── controllers
│   │   │   └── upload.controller.js         # Handles audio/video upload logic
│   │   ├── middlewares
│   │   │   ├── errorHandler.js              # Global error handler
│   │   │   └── validation.js                # File type and size validation
│   │   ├── models
│   │   │   ├── file.model.js                # Sequelize model for uploaded files
│   │   │   └── index.js                     # Sequelize DB initialization
│   │   ├── routes
│   │   │   └── upload.routes.js             # Defines /upload/audio & /upload/video endpoints
│   │   └── services
│   │       └── upload.service.js            # Handles file saving and DB logic
│   ├── config
│   │   ├── database.js                      # DB connection config (Sequelize)
│   │   ├── index.js                         # Loads config files
│   │   └── multer.js                        # Multer setup for uploads
│   ├── app.js                               # Sets up Express app, routes, middleware
│   └── server.js                            # Starts server and connects to DB
├── tests
│   ├── audio                                # Sample test audio files
│   └── video                                # Sample test video files
├── uploads                                  # Stores uploaded media files
├── .env                                     # Environment variables
├── .gitignore                               # Ignored files/folders in Git
├── package.json                             # Project metadata and dependencies
├── package-lock.json                        # Dependency lock file
├── project.tree                             # (Optional) File/folder listing snapshot
└── README.md                                # Project documentation (this file)
>>>>>>> origin/upload_API_videos_audios
```

---

<<<<<<< HEAD
## API Documentation

This API is documented using the **OpenAPI 3.0** standard. We use **Swagger UI** to provide live, interactive documentation where you can explore and test every endpoint directly from your browser.

### How to Access the Docs

1.  Ensure the server is running (`npm start`).
2.  Open your web browser and navigate to:
    **[`http://localhost:3000/api/docs`](http://localhost:3000/api/docs)**

From this interface, you can see all available endpoints, their required parameters, and their response shapes. You can also execute requests against your live local server using the "Try it out" feature.

---

## API Response Contract

All API responses, whether success or error, follow a standardized JSON structure to ensure consistency and predictability.

### Success Response

Successful requests will return a JSON object with a `success` flag set to `true` and a `data` payload.

-   **Shape**: `{ "success": true, "data": {…} }`
-   **HTTP Status**: `200 OK`

**Example:**
```json
{
  "success": true,
  "data": {
    "version": "v1",
    "ok": true
  }
}
```

### Error Response

Failed requests will return a JSON object with a `success` flag set to `false` and an `error` object containing details.

-   **Shape**: `{ "success": false, "error": { "message": "...", "code": "..." } }`
-   **HTTP Status**: `4xx` or `5xx` error codes.

**Example (404 Not Found):**
```json
{
    "success": false,
    "error": {
        "message": "API route not found.",
        "code": "NOT_FOUND"
    }
}
```
=======
## Requirements

To run this project, you will need the following installed on your machine:

- [Node.js](https://nodejs.org/en/) (v18.x or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/download/)
- A database management tool like [DBeaver](https://dbeaver.io/) or PgAdmin to set up and inspect the database.

---

## Installation and Setup

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/FlomadLabsRD/Caipo-flomad-labs-updated
cd Caipo-flomad-labs-updated
git checkout upload_API_videos_audios
```

### 2. Install Dependencies
Install all required npm packages listed in `package.json`.

```bash
npm install
```

### 3. Set Up the PostgreSQL Database
Open DBeaver (or your preferred SQL client) and connect to your PostgreSQL instance.

Create a new database, for example `file_uploads`.

The application will automatically create the required `Files` table when it starts for the first time.

### 4. Configure Environment Variables
Create a `.env` file in the root directory and replace placeholders with your PostgreSQL credentials.

```env
# Server Configuration
PORT=3000

# Database Configuration
# Replace user, password, host, port, and db_name with your credentials
DATABASE_URL="postgresql://user:password@host:port/db_name"

# File Upload Limits
MAX_AUDIO_SIZE=5242880 # 5MB
MAX_VIDEO_SIZE=10485760 # 10MB

# AWS S3 Stub Configuration (Optional)
AWS_ACCESS_KEY_ID=access_key
AWS_SECRET_ACCESS_KEY=secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=bucket-name
```

### 5. Running the Application
Once setup is complete, start the server:

```bash
npm start
```

Expected output:
```text
PostgreSQL connection has been established successfully.
All models were synchronized successfully.
Server is running on port 3000
```

### 6. Testing File Uploads
Use Postman or `curl` to test the endpoints.

**Upload Audio**
```bash
curl -X POST http://localhost:3000/upload/audio -F "file=@tests/audio/less 5M.mp3"
```

**Upload Video**
```bash
curl -X POST http://localhost:3000/upload/video -F "video=@tests/video/less 10M.mp4"
```
Uploaded files will appear in `/uploads`, and metadata will be stored in your PostgreSQL `Files` table.
>>>>>>> origin/upload_API_videos_audios

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
```

---

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
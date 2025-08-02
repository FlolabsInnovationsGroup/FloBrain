# Media Upload & Embedding Search API

This repo contains the OpenAPI (Swagger) spec for a backend service that supports:

- Uploading audio and video files
- Searching for similar items using embedding vectors

The spec defines the overall API structure, including endpoints, request/response formats, and any parameters used.

---

## Endpoints

| Method | Path                | Description                              |
|--------|---------------------|------------------------------------------|
| POST   | /upload/audio     | Upload an audio file                     |
| POST   | /upload/video     | Upload a video file                      |
| POST   | /query/embeddings | Search for similar items by embedding    |

All endpoints are documented in [openapi.yaml](./openapi.yaml), including the expected input/output formats and validation rules.

---

## /query/embeddings Parameters

This endpoint accepts a JSON payload with the following fields:

- q_vector (required): A base64-encoded embedding vector  
- top_k (required): Integer — how many top results to return  
- filters (optional):  
  - device_id: Filter results by device ID  
  - time_range: An array with two dates (YYYY-MM-DD) for start and end filtering

---

## OpenAPI Spec

You can find the full spec in [openapi.yaml](./openapi.yaml).  
It’s based on [OpenAPI 3.0.3](https://swagger.io/specification/) and can be viewed with tools like:

- [Swagger Editor](https://editor.swagger.io/)  
- [SwaggerHub](https://swagger.io/tools/swaggerhub/)  
- Self-hosted Swagger UI

---

## Planned Validation (Middleware)

We’re not implementing the backend just yet, but this spec is built to work with middleware that can automatically validate requests.

Examples:

- **Express (Node.js):** [express-openapi-validator](https://github.com/cdimascio/express-openapi-validator)  
- **FastAPI (Python):** Uses Pydantic for request validation out of the box  
- **Flask:** Can use [Connexion](https://connexion.readthedocs.io/en/latest/)

**Example (Express):**

js
const { OpenApiValidator } = require(express-openapi-validator);

app.use(
  OpenApiValidator.middleware({
    apiSpec: ./openapi.yaml,
    validateRequests: true,
    validateResponses: true,
  })
);


Backend Plan (What’s Next)
We’ll build the backend later, but here’s the rough plan so far:
Framework: Likely Node.js with Express (can change if needed)
Routing: Match the three endpoints from the spec
File uploads: Use multer for handling audio/video files via multipart/form-data
Embedding queries: Accept a JSON payload with the vector and optional filters
Validation: Hook up express-openapi-validator to auto-check requests against the spec
Responses: Stick to the JSON formats defined in openapi.yaml
Errors: Centralized error handler to return clear, consistent messages if validation fails or something breaks
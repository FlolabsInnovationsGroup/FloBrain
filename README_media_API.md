# Media API Documentation

This document outlines the functionality of the v1 Media API. The API is designed to handle the uploading, management, and retrieval of user-generated media files with a focus on security, data integrity, and performance.

The controller logic has been refactored to be more modular and maintainable, featuring a dedicated `ApiError` class for consistent error handling across all endpoints.

## Configuration

To run the API locally, create a `.env` file in the project root and configure the following variables:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | The full connection string for your PostgreSQL database. | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | A long, secret string for signing authentication tokens. | `a-very-long-and-secure-random-string` |
| `UPLOAD_DIR` | The local directory where uploaded files will be stored. | `./uploads` |
| `MAX_UPLOAD_MB` | The maximum allowed size for a single file upload, in megabytes. | `200` |
| `ALLOWED_AUDIO`| A comma-separated list of allowed audio MIME types. | `audio/mpeg,audio/wav` |
| `ALLOWED_VIDEO`| A comma-separated list of allowed video MIME types. | `video/mp4,video/webm` |
| `ALLOWED_IMAGE`| A comma-separated list of allowed image MIME types. | `image/jpeg,image/png` |

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### 1. Upload Media

Uploads a new media file. This endpoint processes `multipart/form-data` requests.

- **Endpoint:** `POST /media/upload`
- **Authentication:** Required.

**Request Body (`form-data`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | File | **Yes** | The binary media file to upload. |
| `media_type` | String | **Yes** | The type of media. Must be one of `audio`, `video`, or `image`. |
| `tags` | String | No | A comma-separated list of tags (e.g., `"meeting,notes"`). |
| `device_id`| String | No | The ID of the device associated with the recording. |
| `timestamp`| ISO 8601 | No | The UTC timestamp of the recording. Defaults to the current time. |

**Success Response (`201 Created`):**

The response body is a standardized Data Transfer Object (DTO) containing the created media record.

```json
{
  "success": true,
  "data": {
    "id": "m_a1b2c3d4",
    "user_id": "user_1",
    "device_id": null,
    "timestamp": "2025-11-02T23:00:00.000Z",
    "media_type": "image",
    "file_path": "/uploads/user_1/2025/11/02/uuid.png",
    "file_size": 123456,
    "format": "png",
    "tags": ["test", "demo", "postman"],
    "processing_status": "pending_processing"
  }
}
2. List Media

Retrieves a paginated list of the authenticated user's media recordings, sorted by timestamp descending.
Endpoint: GET /media
Authentication: Required.
Query Parameters:
limit (number, optional, default 20, max 100): The number of items to return.
before (ISO 8601, optional): Returns items with a timestamp before this date.
after (ISO 8601, optional): Returns items with a timestamp after this date.
device_id (string, optional): Filters by a specific device ID.
tags (string, optional): A comma-separated list; returns media containing any of the specified tags.

3. Get Single Media Record

Retrieves a single media recording by its ID.
Endpoint: GET /media/:id
Authentication: Required. The user must be the owner of the media record.

4. Update Media Record

Updates metadata for a specific media recording.
Endpoint: PATCH /media/:id
Authentication: Required. The user must be the owner of the media record.
Request Body (application/json):
Field	Type	Description
tags	Array of strings	Replaces the entire list of tags for the record.
processing_status	String	Updates the processing status. Only valid transitions are allowed.
summary	String	Sets or updates the AI-generated summary.
transcription	String	Sets or updates the AI-generated transcription.

5. Delete Media Record

Permanently deletes a media recording. This is a hard delete operation.
Endpoint: DELETE /media/:id
Authentication: Required. The user must be the owner of the media record.
Action: Deletes both the database record and the associated physical file from storage. This action is irreversible.
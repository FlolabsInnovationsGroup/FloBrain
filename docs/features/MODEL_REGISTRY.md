# Model Registry

The Model Registry stores metadata for AI models available to the FloBrain model pool. It is exposed by the Django API in `flobrain-core/backend`. This feature includes the backend API and Django admin integration only; the website interface is deferred to a separate change.

## Ownership

The repository handbook still describes `flobrain-cloud` as the active FastAPI backend, but current repository history and the website API integration use the Django service for persistent application data. The registry therefore lives in the Django service. Other runtimes should consume this API instead of maintaining a second registry.

## Stored fields

| Field                   | Type         | Rules                                                             |
| ----------------------- | ------------ | ----------------------------------------------------------------- |
| `name`                  | string       | Required; maximum 200 characters                                  |
| `provider_name`         | string       | Required; maximum 200 characters                                  |
| `provider_type`         | enum         | `private` or `open-source`                                        |
| `supported_input_types` | string array | Non-empty subset of `text`, `image`, `audio`, `video`, `document` |
| `capabilities`          | string array | Non-empty; each label is at most 100 characters                   |
| `created_at`            | timestamp    | Server managed                                                    |
| `updated_at`            | timestamp    | Server managed                                                    |

The combination of provider name and model name is unique. API validation also prevents case-only duplicates. Repeated input types or capability labels in a request are stored once.

`multimodal` is derived rather than stored as an input type. Select every concrete input a model accepts; for example, a model registered with both `text` and `video` inputs is multimodal.

## API

Every endpoint requires the existing `Authorization: Bearer <access-token>` header.

| Method   | Endpoint                    | Purpose                   |
| -------- | --------------------------- | ------------------------- |
| `GET`    | `/api/model-registry/`      | List models               |
| `GET`    | `/api/model-registry/names/` | List model names only     |
| `POST`   | `/api/model-registry/`      | Register a model          |
| `GET`    | `/api/model-registry/{id}/` | Read one model            |
| `PATCH`  | `/api/model-registry/{id}/` | Update one or more fields |
| `DELETE` | `/api/model-registry/{id}/` | Remove a model            |

### Model names for frontend consumers

`GET /api/model-registry/names/` returns a JSON array of strings, with one entry per registered model, sorted by name. It reads the current registry on each request, so additions, renames, and deletions appear in subsequent responses. An empty registry returns `200 OK` with `[]`.

```bash
curl -H "Authorization: Bearer <access-token>" \
  http://localhost:8000/api/model-registry/names/
```

Example `200 OK` response:

```json
["GPT-4o", "Llama 3.1 70B", "Whisper"]
```

This endpoint accepts no request body and returns names only. Models with the same name under different providers produce repeated names; use the full registry endpoint when model IDs or provider details are needed. Missing or invalid bearer tokens return `401` using the existing authentication error envelope. Write methods return `405 Method Not Allowed`.

No additional migration is required beyond the existing registry migration. This adds an API for frontend use; it does not add website UI.

### Registering a model

Example create request:

```json
{
  "name": "Llama 3.1 70B",
  "provider_name": "Meta",
  "provider_type": "open-source",
  "supported_input_types": ["text"],
  "capabilities": ["chat", "coding", "classification"]
}
```

Validation errors use the existing API envelope:

```json
{
  "error": "Validation failed",
  "details": {
    "supported_input_types": ["This list may not be empty."]
  }
}
```

## Database deployment

Apply the migration from `flobrain-core/backend` using the project container workflow:

```bash
docker compose exec web python manage.py migrate
```

This creates the `ai_model_registry` table. The registry is also available through Django admin.

## Verification

Backend coverage is in `model_registry/tests.py`. Run the registry and existing profile/authentication regression tests from `flobrain-core/backend`:

```bash
docker compose exec web python manage.py test model_registry users
docker compose exec web python manage.py check
docker compose exec web python manage.py makemigrations --check --dry-run
```

The current authorization model has no administrator role. Consequently, all authenticated users can read and mutate registry records, matching existing API conventions. Restrict mutation endpoints when a role/permission policy is introduced.

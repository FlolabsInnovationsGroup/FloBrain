nano README.md
# CAIPO Backend

CAIPO Backend provides secure media ingestion APIs, request validation, and AI orchestration (transcription, detection, segmentation). It stores metadata in PostgreSQL and integrates with AI services.

## Tech stack
- Node.js (Express)
- PostgreSQL
- Zod (validation)
- Jest (tests)
- Swagger/OpenAPI + Postman

## Quick start
```bash
npm install
cp .env.example .env
createdb flolabs_dev || true
createdb flolabs_test || true
npm run migrate
npm run seed
npm run dev

npm run seed
npm run dev


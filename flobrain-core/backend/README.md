# FloBrain Memory Subsystem

Production-grade three-tier memory system for AI applications: Tier 1 (RAM/rANS), Tier 2 (vector DB + BM25 + Hebbian), Tier 3 (S3 + AES-256-GCM).

## Quick Start

### Prerequisites
- Docker Desktop 4.30+
- WSL2 (Windows) or native Docker (Linux/Mac)
- 8 GB RAM minimum

### Setup

```bash
# 1. Copy env template
cp .env.example .env

# 2. Build and start
docker compose up -d --build

# 3. Apply migrations (automatic on web container start)
docker compose exec web python manage.py migrate

# 4. Run tests
docker compose exec web python manage.py test memory.tests_integration
docker compose exec web python manage.py test memory.tests
```

## SuperMemory Integration

### Stub Mode (default — no SuperMemory required)

When `SUPERMEMORY_BASE_URL` is empty (default in `.env.example`), the system runs in stub mode:
- All SuperMemory connector methods return stub responses
- Semantic layer (chunker, entity extractor) uses local fallback
- Memory stored in FloBrain's own Tier 1/2/3 storage

This mode is **fully functional** — you can `memorize`, `recall`, and `forget` memories without SuperMemory.

### Remote Mode (when SuperMemory is ready)

When another developer sends you the SuperMemory URL:

```bash
# 1. Edit .env
SUPERMEMORY_BASE_URL=http://supermemory-server:8787
SUPERMEMORY_API_KEY=optional_token
SUPERMEMORY_TIMEOUT=2

# 2. Restart
docker compose restart web celery-worker

# 3. Validate connection
docker compose exec web python scripts/validate_supermemory_connection.py
```

All 5+ checks should pass. If any fail — coordinate with the SuperMemory developer.

### Validation Script

```bash
# Run in stub mode (default)
docker compose exec web python scripts/validate_supermemory_connection.py

# Run in remote mode (after setting SUPERMEMORY_BASE_URL)
docker compose exec web python scripts/validate_supermemory_connection.py
```

Expected output (stub mode):
```
=== SuperMemory connection check (mode=stub) ===
  [OK]   health()                                  0ms
  [OK]   create_document(validation_...)           0ms
  [OK]   search(validation)                        0ms
  [OK]   get_document(validation_...)              0ms
  [OK]   get_profile(validation)                   0ms
  [OK]   list_connections()                        0ms
  [OK]   delete_document(validation_...)           0ms
=== Done ===
  RESULT: ALL CHECKS PASSED ✅
```

## Vector Backend (ChromaDB → Qdrant)

The system supports two vector backends, switchable via `VECTOR_BACKEND` env var:

| Backend | Setting | Use case |
|---|---|---|
| ChromaDB (default) | `VECTOR_BACKEND=chromadb` | Dev, embedded, no extra service |
| Qdrant | `VECTOR_BACKEND=qdrant` | Production, scalable, filtered search |

### Switch to Qdrant

```bash
# 1. Set in .env
VECTOR_BACKEND=qdrant
QDRANT_URL=http://qdrant:6333

# 2. Run migration script (idempotent)
docker compose exec web python scripts/migrate_chromadb_to_qdrant.py --dry-run
docker compose exec web python scripts/migrate_chromadb_to_qdrant.py

# 3. Restart web
docker compose restart web
```

## API Endpoints

### SuperMemory-compatible (semantic layer)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/memory/sm/memorize` | Store a memory (auto-chunked, entity extraction) |
| POST | `/api/memory/sm/recall?scope=personal\|team\|all` | Retrieve relevant memories |
| DELETE | `/api/memory/sm/memories/{id}` | Forget a memory |
| GET | `/api/memory/sm/entities` | List known entities for user |
| GET | `/api/memory/sm/entities/search?text=X` | Find memories mentioning entity X |
| GET | `/api/memory/sm/health` | Adapter + connector status |

### Team Memory

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/teams/` | Create team |
| GET | `/api/teams/` | List user's teams |
| GET | `/api/teams/{id}` | Team detail with members |
| POST | `/api/teams/{id}/members` | Add member (admin only) |
| DELETE | `/api/teams/{id}/members/{user_id}` | Remove member (admin only) |
| GET | `/api/teams/{id}/memories` | List team memories |
| POST | `/api/teams/{id}/memories` | Create team memory (admin only) |

### Phase 3 — Graph + Health

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/memory/graph/query` | Execute Cypher query (Neo4j) |
| POST | `/api/health/measurements` | Store health measurement (wearable) |
| GET | `/api/health/measurements?type=heart_rate` | List user's measurements |

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  AI Agents / Frontend / Wearables                   │
└──────────────────┬──────────────────────────────────┘
                   │ REST API
                   ▼
┌─────────────────────────────────────────────────────┐
│  SuperMemory Adapter (STUB ↔ REMOTE auto-switch)    │
│  - semantic_chunker.py (sentence-based, overlap)    │
│  - entity_extractor.py (regex NER + known-orgs)     │
│  - supermemory_connector.py (HTTP client, 2s timeout)│
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  FloBrain Storage Backend                           │
│  - Tier 1: Redis + rANS compression + LRU eviction  │
│  - Tier 2: ChromaDB|Qdrant + BM25 + Hebbian decay   │
│  - Tier 3: S3 + AES-256-GCM + Zstd                  │
│  - PII Redaction at ingress                         │
│  - Audit log (MongoDB)                              │
└─────────────────────────────────────────────────────┘
```

## Testing

```bash
# Integration tests (16 tests, ~15s)
docker compose exec web python manage.py test memory.tests_integration

# Connector mock tests (12 tests, <1s)
docker compose exec web python manage.py test memory.tests.test_supermemory_connector

# Team memory ACL tests (6 tests, <1s)
docker compose exec web python manage.py test memory.tests.test_team_memory
```

## Troubleshooting

### Q: `ModuleNotFoundError: No module named 'qdrant_client'`
A: `pip install qdrant-client` or set `VECTOR_BACKEND=chromadb` (default).

### Q: `redis.exceptions.ConnectionError`
A: `docker compose up -d redis` then `docker compose restart web`.

### Q: SuperMemory health check fails with `unreachable`
A: Verify `SUPERMEMORY_BASE_URL` is reachable from web container. Test:
```bash
docker compose exec web curl -s http://supermemory-server:8787/health
```

### Q: Tests skip with "Redis not available"
A: Run `docker compose up -d redis` and `docker compose restart web`. Tests check Redis availability at runtime.

## Documentation

- [ADR 0001 — SuperMemory Integration](docs/adr/0001-supermemory-integration.md)
- [ADR 0002 — Vector Backend: Qdrant](docs/adr/0002-vector-backend-qdrant.md)
- [ADR 0003 — Neo4j for Knowledge Graph](docs/adr/0003-neo4j-for-graph.md)

## Phase Status

- ✅ **Phase 1 W1**: Celery worker/beat + Qdrant + .env.example
- ✅ **Phase 1 W2**: Connector (get_profile, list_connections, upload_file) + Assembler patch
- ✅ **Phase 1 W3**: Team Memory + ACL + scope param
- ✅ **Phase 1 W4**: Prometheus metrics + README
- ✅ **Phase 3 (MVP)**: Neo4j graph_sync + Redis Streams events + Health Buddy API + Oura importer
- ⛔ **Phase 2**: BLOCKED — requires live SuperMemory server

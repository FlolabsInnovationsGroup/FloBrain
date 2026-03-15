# FloBrain Alpha — Architectural Reasoning

This document explains the architectural decisions made during the FloBrain alpha build.

---

## Why FastAPI over Django?

The existing `flobrain-core/backend/` uses Django (synchronous, ORM-heavy, monolithic). For the alpha we chose FastAPI because:

- **Async-first**: The agent system is inherently async — LLM calls, Notion API requests, and vector store queries all involve I/O wait. FastAPI's async support via `asyncio` means we can serve many concurrent requests without blocking threads.
- **Speed of iteration**: FastAPI auto-generates OpenAPI docs, has minimal boilerplate, and Pydantic v2 provides fast schema validation. The Django ORM and migration overhead adds friction during early prototyping.
- **Modern Python**: Python 3.10+ type hints, `async/await` throughout, dataclasses, `__future__` annotations — FastAPI encourages this style natively.
- **Coexistence**: Both can live in the monorepo. Django backend serves the existing production endpoints; FastAPI alpha is the experimental AI layer. They share nothing at runtime.

---

## Why Ollama + Open-Source Models?

The previous `flobrain-cloud/` prototype used OpenAI APIs exclusively. Key problems:

- **Cost**: OpenAI's per-token pricing scales poorly with always-on wearable usage.
- **Privacy**: Sending voice transcriptions and personal Notion data to third-party APIs is a data governance concern.
- **Latency and availability**: Dependency on external APIs adds network round-trips and failure modes.

With **Ollama**:
- Models run locally or on a company server — data stays in-house.
- `llama3.2`, `mistral`, `phi3` and other open models offer strong general-purpose performance.
- Ollama exposes an OpenAI-compatible `/api/chat` endpoint, so the LLMService can fall back to any OpenAI-compatible API (e.g., vLLM, LM Studio) by just setting env vars.
- Easy model switching: change `OLLAMA_MODEL` in `.env` without touching code.

---

## Why ChromaDB for Vectors?

Alternatives considered:

| Option | Reason rejected |
|--------|----------------|
| FAISS (previous) | No persistence without custom code; tight coupling to OpenAI embeddings |
| Pinecone / Weaviate | Managed cloud services — same privacy/cost concerns as OpenAI |
| pgvector | Requires PostgreSQL — adds DB complexity for alpha; SQLite is simpler |
| Qdrant | Good choice but heavier; ChromaDB is simpler to embed |

**ChromaDB** wins for the alpha because:
- Embedded mode — no separate server needed, just a local directory.
- Native Python, `pip install chromadb`.
- Good enough performance for alpha scale (thousands to low millions of documents).
- Familiar collection-based API that maps cleanly to our `MemoryStore` abstraction.
- Graceful fallback: if ChromaDB isn't installed, we fall back to an in-memory dict store with hash embeddings.

---

## Agent System Mapping to the Architecture Diagrams

The original diagrams (14-page draw.io) define:

```
AI Core: Control Agent → Judge Agent → Execution Agents
```

Alpha mapping:

| Diagram concept | Alpha implementation |
|-----------------|---------------------|
| Control Agent | `agents/control.py` — routes to execution agents |
| Judge Agent | **Deferred**: not in alpha scope. In production, a Judge reviews the Execution Agent's output for quality/safety before returning to user |
| Execution Agents | `agents/general.py` (general), `agents/notion_agent.py` (Notion) |
| Workflow Orchestration | `agents/workflows/engine.py` — YAML-defined pipeline |
| Data Ingestion Layer | **Deferred**: webhooks from ReadAI, Discord, Website. Notion is implemented via polling/query. |
| NLU Layer | Handled by the Control Agent's LLM call (intent classification via prompting) |
| Universal Memory System | Simplified: `ConversationMemory` (SQL) + `KnowledgeMemory` (ChromaDB) |
| Vector Store | ChromaDB (embedded) |

The Judge Agent is a significant production concern — it prevents the system from returning hallucinated or low-quality responses. It's intentionally out of scope for alpha to keep the implementation lean.

---

## What Was Scoped In vs. Out

### In (Alpha)
- FastAPI application with full async stack
- Chat API with sessions, streaming (SSE)
- JWT authentication (register/login)
- Control → Execute agent pipeline
- General agent (conversation)
- Notion agent (tasks, projects, page reading)
- Tool system (notion_search, notion_read_page, notion_query_tasks, notion_query_projects)
- YAML workflow definitions
- ChromaDB vector store with sentence-transformers (or hash fallback)
- Conversation memory (SQLite) + Knowledge memory (ChromaDB)
- faster-whisper transcription (optional)
- Notion OAuth scaffold (connect + callback routes)
- Graceful degradation when Ollama/ChromaDB/whisper are not available

### Out (Post-Alpha)
- Judge Agent (response quality/safety review)
- ReadAI, Discord, Website webhook ingestion
- Real-time wearable audio pipeline (WebSocket)
- Full event-sourced Universal Memory (MemoryObjects, MemoryArtifacts, MemoryEvents)
- Multi-user Notion OAuth with per-user token storage
- Billing and rate limiting
- Production PostgreSQL migration (currently SQLite)
- Fine-tuned/LoRA models for CAIPO-specific tasks
- Voice synthesis (TTS)

---

## Trade-offs Made

### SQLite over PostgreSQL
**Alpha**: SQLite (`aiosqlite` for async) — zero infrastructure, single file, trivially inspectable.
**Production**: Migrate to PostgreSQL with connection pooling. The SQLAlchemy models are DB-agnostic; only the `SQLITE_URL` env var changes.

### Hash Embeddings as Fallback
When `sentence-transformers` is not installed, we fall back to SHA-256 hash embeddings. These are **not semantically meaningful** — they will not produce useful similarity results. The fallback exists only to allow the server to start cleanly and return non-crashing responses. For any real usage, install `sentence-transformers`.

### Prompt-Based Tool Calling
The NotionAgent uses a prompt injection approach for tool calling (inject tool descriptions, parse JSON responses) rather than native function-calling APIs (OpenAI `tools` parameter). This is intentional:
- Ollama's function-calling support varies by model.
- Prompt-based tool calling works with any chat model.
- For production, integrate with Ollama's native tool-calling when the model supports it.

### No Rate Limiting
The alpha has no rate limiting on endpoints. This must be added before any public deployment (use `slowapi` or nginx/Caddy upstream rate limiting).

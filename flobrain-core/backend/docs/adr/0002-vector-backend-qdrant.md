# ADR 0002 — Vector Backend: Qdrant

## Status
Accepted — 2026-07-15

## Context

FloBrain Tier 2 uses a vector database for semantic search. Original implementation used ChromaDB PersistentClient (embedded, file-based). ChromaDB is great for dev but has limitations at production scale:
- No native filtered search (must post-filter results)
- Single-process architecture — no horizontal scaling
- No built-in replication
- Memory consumption grows with collection size

## Decision

**Migrate from ChromaDB to Qdrant as production vector backend, keep ChromaDB as default for dev.**

Switch is controlled by `VECTOR_BACKEND` env var:
- `VECTOR_BACKEND=chromadb` (default) — embedded, zero-config, dev
- `VECTOR_BACKEND=qdrant` — separate service, production-ready

### Implementation

1. **memory/qdrant_client.py** — QdrantCollection wrapper with ChromaDB-compatible API (`add`, `query`, `delete`, `count`, `get`)
2. **memory/tier_2.py** — conditional import based on `VECTOR_BACKEND`
3. **scripts/migrate_chromadb_to_qdrant.py** — idempotent migration script with `--dry-run` and `--limit` options

### Why Qdrant

| Vector DB | Performance | Filtered Search | Scaling | License | Verdict |
|---|---|---|---|---|---|
| ChromaDB | Good for <1M | Post-filter only | Single-process | Apache 2.0 | Dev only |
| **Qdrant** | Excellent (Rust) | Native payload filters | Horizontal | Apache 2.0 | **Chosen** |
| Weaviate | Good | Native | Horizontal | BSD-3 | Complex setup |
| Milvus | Excellent | Native | Horizontal | Apache 2.0 | Heavy infra (etcd + MinIO) |
| pgvector | OK | SQL WHERE | Vertical | PostgreSQL | Limited scaling |
| Pinecone | Excellent | Native | Managed | SaaS | Vendor lock-in |

### Decision Rationale

- **Performance**: Qdrant is written in Rust, consistently outperforms in ANN benchmarks
- **Filtered search**: native payload filters (ChromaDB needs post-filter)
- **Self-hosted**: no vendor lock-in (unlike Pinecone)
- **Lightweight**: single binary, no external deps (unlike Milvus)
- **API**: clean Python SDK, easy to wrap with ChromaDB-compatible interface
- **License**: Apache 2.0 (business-friendly)

## Consequences

### Positive
- Production-ready filtered vector search (e.g. "search memories where owner_id=X AND type=chunk")
- Horizontal scaling via Qdrant cluster
- Lower latency for large collections (>1M vectors)
- Migration path is reversible ( ChromaDB remains as fallback)

### Negative
- Additional docker service in production (qdrant container)
- Migration overhead for existing data
- Dev/prod divergence (chromadb in dev, qdrant in prod)

### Mitigation
- Migration script is idempotent — safe to re-run
- Dev can use qdrant too (just set VECTOR_BACKEND=qdrant)
- CI tests both backends

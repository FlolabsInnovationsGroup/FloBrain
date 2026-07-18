# ADR 0001 — SuperMemory Integration

## Status
Accepted — 2026-07-15

## Context

FloBrain needs a semantic memory layer for AI agents: chunking, entity extraction, knowledge graph. Building this from scratch would take 3+ months. SuperMemory (https://github.com/supermemoryai/supermemory) provides exactly this, open-source, with self-hosted option.

However, SuperMemory is being deployed by **another developer** in parallel — not by us. We cannot block FloBrain development on SuperMemory availability.

## Decision

**Adopt stub-first integration pattern**: write code that works without SuperMemory today, and switches to remote mode via a single env var when SuperMemory becomes available.

### Implementation

1. **supermemory_connector.py** — HTTP client with 5+ methods (health, create_document, search, get_document, delete_document, get_profile, list_connections, upload_file). When `SUPERMEMORY_BASE_URL` is empty, returns stub responses.

2. **supermemory_adapter.py** — Dual-mode adapter:
   - STUB mode: uses local `semantic_chunker.py` + `entity_extractor.py` + FloBrain storage
   - REMOTE mode: delegates to SuperMemory server, keeps entity graph locally for Hebbian reranking

3. **Auto-fallback**: if REMOTE mode fails (timeout, 5xx), adapter transparently falls back to STUB mode and logs warning.

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Build semantic layer from scratch | Full control | 3+ months effort, reinvents wheel | Rejected |
| Use SuperMemory hosted API | Zero infra | Vendor lock-in, monthly cost, data egress | Rejected |
| Self-host SuperMemory ourselves | Full control | Not our zone — another dev handles infra | Rejected |
| **Stub-first integration** | Works today, switches later, no vendor lock-in | Slight code duplication (local chunker vs SM chunker) | **Accepted** |

### Alternatives to SuperMemory (researched, not chosen)

- **Mem0** (mem0.ai) — similar offering, less mature Python SDK, weaker entity extraction
- **Zep** (getzep.com) — focused on conversation history, not general memory
- **LangChain Memory** — too primitive, no persistence layer

## Consequences

### Positive
- FloBrain is functional today in stub mode — no blocking on external team
- When SuperMemory arrives, switch is one env var + restart
- Local chunker/entity extractor serve as permanent fallback if SuperMemory down
- Code is testable with mocks — no integration test environment needed

### Negative
- Local chunker is simpler than SuperMemory's (no ML-based entity resolution)
- Some code duplication between STUB and REMOTE paths
- Need to maintain two code paths until SuperMemory stabilizes

### Mitigation
- Local entity extractor has known-orgs list for common cases (Microsoft, Google, etc.)
- Integration tests cover both modes (STUB + REMOTE with mock)
- `scripts/validate_supermemory_connection.py` validates end-to-end when SM is ready

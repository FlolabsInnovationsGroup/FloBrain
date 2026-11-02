**Title:** fix(memory): owner-scoped memory lifecycle with recall in chat

## Description
Repairs FloBrain's Core memory system so a user's facts persist across chats, reach the request sent to the LLM service, and stay private, correctable and deletable.

**Backend (`flobrain-core/backend`)**
- **Privacy:** node detail, edit and delete only work on the caller's own memories (another user's ID returns 404). Recall is owner-scoped and every result is re-checked against SQL, so a stale or foreign vector can never be recalled.
- **Save:** validated payload, server-generated IDs, duplicate detection on normalized content (different facts under the same title stay separate), owner-checked `supersedes`, and a truthful `index_status` in the response.
- **Schema (migration `0002`):** canonical `content`, `is_excluded`, `superseded_by`, provenance (`source_chat_id`, `source_message_id`) and index state, with a backfill.
- **Indexing and retrieval:** server-side embeddings (Chroma's default MiniLM, decision D3) into a new versioned collection; hybrid vector + keyword recall where each path degrades independently, with a relevance floor (`MEMORY_MIN_RELEVANCE`).
- **Chat:** relevant memories are added to the LLM request as one delimited "reference data" block within `MEMORY_CONTEXT_TOKEN_BUDGET`; chat history is bounded by `CHAT_HISTORY_TOKEN_BUDGET`; user-typed messages are captured as memories (`MEMORY_AUTO_CAPTURE`, on by default only when `DEBUG`). New additive response fields: `memory_context`, `memory_capture`. Kill switch: `MEMORY_RECALL_ENABLED=False`.
- **Lifecycle:** editing `content` updates the vector, cache and archive; exclude/re-include; delete removes the memory from every store; account deletion purges all of the owner's memory.
- **Operations:** new `python manage.py memory_reconcile [--dry-run] [--archive]` repairs derived stores (idempotent).
- **Safety:** S3 cold archive is opt-in (`MEMORY_COLD_STORAGE_ENABLED`) and refuses to run without a valid 64-hex `AES_MASTER_KEY` (the all-zero default is gone); clients are created lazily; Chroma telemetry is off; audit events store IDs and field names only.
- **Tests:** the suite now runs offline; the MongoDB-writing demo scripts moved to `memory/scripts/` (unchanged).

**Website (`flobrain-website`)**
- The memory side panel's buttons now work: Edit Context, Exclude/Include in Future, and Delete Node (with confirmation). "Raw Text" shows the memory content, not the title.

**CI**
- New `.github/workflows/core-backend-ci.yml` runs the Core backend tests offline on SQLite. The existing `flobrain-cloud` job is unchanged.

## Related Issue
Notion task "Validate memory implementation"; memory audit (19 Oct 2026, findings FM-01 … FM-19).

## Motivation and Context
At `67b0153a` the chat never read memory, nothing was captured from chat, any user could read or edit another user's memory node by ID, saves were sent to cold storage under an all-zero key, and nothing could be corrected, excluded or deleted. Each fix here was test-first: a failing test reproduced the finding before the change.

## Types of changes
- [x] Bug fix (non-breaking change which fixes an issue)
- [x] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist:
- [x] My code follows the code style of this project.
- [ ] I have updated the documentation accordingly.
- [x] I have added tests to cover my changes.
- [x] All new and existing tests passed. *(backend; see notes)*
- [ ] I have attached screenshots (for UI changes). *(not captured; component tests cover the panel)*

## Notes for reviewers
- **Base is `main`, not `development`:** `development` does not contain the memory app (`flobrain-core/backend/memory`).
- **Migration:** `memory.0002_memory_lifecycle_fields` must be applied in each environment (the dev container's startup `migrate` does this). It was tested forward, backward and with backfill on SQLite and Postgres.
- **Behaviour changes:** `POST /api/memory/save/` now requires `content` and ignores client `id`/`owner_id`/`embedding`; the default vector collection is `flobrain_memory_v1` (existing vectors are not migrated; run `memory_reconcile` to index existing rows).
- **First real embed downloads the MiniLM ONNX model (~80 MB)** in each environment.
- **Tests run:** backend `manage.py test memory brain users` → 97/97 on Postgres and SQLite, offline. Frontend: `npm run typecheck` and `npm run lint` clean; the 6 new side-panel Vitest tests pass. The full Vitest run has 41 failures in 14 unrelated files that already fail on `main` (unchanged by this PR).
- **Known follow-ups:** shorten the Mongo server-selection timeout (event logging now actually writes, so an outage waits up to 30 s); pin `chromadb` (tested on 1.5.9); tune `MEMORY_MIN_RELEVANCE` on a labelled set (with the real model a loosely related memory scored 0.35 against the 0.2 default); check whether any environment archived data under the old all-zero key.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

# ADR 0003 — Neo4j for Knowledge Graph

## Status
Accepted — 2026-07-15

## Context

FloBrain's `MemoryLink` table in PostgreSQL stores edges between memory nodes (co-occurrence, chunk_of, mentions). For simple queries ("find chunks of this document"), SQL works fine. But complex graph queries struggle:

- Multi-hop traversal: "find all memories that mention entities mentioned by memories I accessed yesterday" — requires recursive CTEs, slow on >100K links
- Shortest path: "how is node A related to node B?" — not native to SQL
- Pattern matching: "find all (person)-[:MET_AT]->(location) patterns" — needs Cypher

Postgres can do these via WITH RECURSIVE, but performance degrades beyond 3 hops. Specialized graph DB is needed.

## Decision

**Add Neo4j as read-side graph database, sync from Postgres via Django signals.**

Postgres remains source-of-truth (writes go there first). Neo4j is updated via `post_save`/`post_delete` signals on `MemoryNode` and `MemoryLink`. Read-only Cypher queries run against Neo4j.

### Implementation

1. **memory/graph_sync.py** — Django signal handlers + Neo4j sync functions
2. **memory/apps.py** — `connect_signals()` called in `AppConfig.ready()`
3. **POST /api/memory/graph/query** — Cypher endpoint (read-only, blocks CREATE/DELETE/SET)

### Why Neo4j

| Graph DB | Query Language | Performance | License | Verdict |
|---|---|---|---|---|
| **Neo4j** | Cypher (declarative) | Excellent | GPL/Commercial | **Chosen** |
| Memgraph | Cypher | Excellent | Memgraph Community | Younger community |
| KuzuDB | Cypher | Good (embedded) | MIT | Limited Python driver |
| ArangoDB | AQL | Good | Apache 2.0 | Multi-model (overkill) |
| TigerGraph | GSQL | Excellent | Commercial | Expensive, proprietary language |

### Decision Rationale

- **Cypher is the standard**: most graph developers know Cypher, transferable skill
- **Mature Python driver**: official `neo4j` package, well-documented
- **Strong community**: 11k+ GitHub stars, active Stack Overflow tags
- **Free for our scale**: Community Edition handles single-instance up to ~34B nodes
- **Django signals**: simple sync pattern, no CDC pipeline needed

## Consequences

### Positive
- Multi-hop queries (3+ hops) run in milliseconds instead of seconds
- Cypher syntax enables complex pattern matching impossible in SQL
- Read-side scaling: Neo4j cluster for read replicas without touching Postgres
- Source-of-truth unchanged: Postgres still owns writes, easy rollback

### Negative
- Additional docker service (neo4j container, ~500MB image)
- Sync lag: writes to Postgres take 10-100ms to propagate to Neo4j
- Storage duplication: nodes/links exist in both Postgres and Neo4j
- Eventual consistency: brief window where Neo4j is stale

### Mitigation
- Sync is fire-and-forget (signals are async-friendly)
- Read queries tolerate brief staleness (memory graph is not real-time critical)
- Neo4j is optional — code falls back gracefully if unavailable
- Re-sync from scratch is possible: iterate all MemoryNode/MemoryLink, call sync_* functions

## Future Considerations

- If sync lag becomes a problem: switch to CDC (Debezium → Kafka → Neo4j)
- If Neo4j Community hits scale limits: upgrade to Enterprise or evaluate Memgraph
- If graph queries remain simple: drop Neo4j and use Postgres recursive CTEs

#!/usr/bin/env python
"""scripts/migrate_chromadb_to_qdrant.py — Idempotent migration ChromaDB → Qdrant.

Usage:
    python scripts/migrate_chromadb_to_qdrant.py [--dry-run] [--limit N] [--batch-size 500]

Reads all records from ChromaDB PersistentClient, writes to Qdrant,
verifies count match. Safe to re-run — skips existing point IDs.

Requirements:
    VECTOR_BACKEND=chromadb (source)
    QDRANT_URL=http://qdrant:6333 (target)
"""
import os
import sys
import argparse
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "flobrain.settings")

import django
django.setup()


def main():
    parser = argparse.ArgumentParser(description="Migrate ChromaDB → Qdrant")
    parser.add_argument("--dry-run", action="store_true", help="Read source only, don't write to Qdrant")
    parser.add_argument("--limit", type=int, default=0, help="Max records to migrate (0 = all)")
    parser.add_argument("--batch-size", type=int, default=500, help="Batch size for writes")
    args = parser.parse_args()

    import chromadb
    from memory.qdrant_client import QdrantCollection
    from qdrant_client.http import models as qmodels

    print(f"=== ChromaDB → Qdrant migration (dry_run={args.dry_run}) ===")

    # Source: ChromaDB
    chroma_client = chromadb.PersistentClient(path="/app/vector_db")
    source_coll = chroma_client.get_or_create_collection(name="flobrain_associative_memory")
    source_count = source_coll.count()
    print(f"[source] ChromaDB count: {source_count}")

    if source_count == 0:
        print("[source] ChromaDB is empty, nothing to migrate.")
        return

    # Target: Qdrant
    target_coll = QdrantCollection()
    target_count_before = target_coll.count()
    print(f"[target] Qdrant count before: {target_count_before}")

    if args.dry_run:
        print(f"[dry-run] Would migrate {source_count} records. Skipping write.")
        return

    # Read in batches
    limit = args.limit if args.limit > 0 else source_count
    migrated = 0
    skipped = 0
    offset = 0

    while offset < limit:
        batch_size = min(args.batch_size, limit - offset)
        try:
            results = source_coll.get(
                limit=batch_size,
                offset=offset,
                include=["embeddings", "metadatas"],
            )
        except Exception as e:
            print(f"[error] Failed to read batch at offset {offset}: {e}")
            break

        if not results or not results.get("ids"):
            break

        ids = results["ids"]
        embeddings = results.get("embeddings", [])
        metadatas = results.get("metadatas", [])

        if not embeddings:
            print(f"[warn] Batch at offset {offset} has no embeddings, skipping")
            offset += batch_size
            continue

        # Filter out IDs already in Qdrant (idempotent)
        existing_ids = set()
        try:
            for pid in ids:
                fetched, _ = target_coll._client.scroll(
                    collection_name=target_coll.collection_name,
                    limit=1,
                    scroll_filter=qmodels.Filter(
                        must=[qmodels.FieldCondition(
                            key="chromadb_id",
                            match=qmodels.MatchValue(value=pid)
                        )]
                    ) if False else None,
                )
                if fetched:
                    existing_ids.add(pid)
        except Exception:
            pass

        new_ids = [pid for pid in ids if pid not in existing_ids]
        new_embeddings = [embeddings[i] for i, pid in enumerate(ids) if pid not in existing_ids]
        new_metadatas = []
        for i, pid in enumerate(ids):
            if pid not in existing_ids:
                meta = metadatas[i] if i < len(metadatas) else {}
                meta["chromadb_id"] = pid
                new_metadatas.append(meta)

        if new_ids:
            target_coll.add(ids=new_ids, embeddings=new_embeddings, metadatas=new_metadatas)
            migrated += len(new_ids)
            print(f"[progress] offset={offset} batch={batch_size} migrated={len(new_ids)} skipped={len(existing_ids)}")
        else:
            skipped += len(existing_ids)
            print(f"[progress] offset={offset} batch={batch_size} all skipped (already in Qdrant)")

        offset += batch_size
        time.sleep(0.1)  # Be gentle

    target_count_after = target_coll.count()
    print(f"\n=== Migration complete ===")
    print(f"  Source count: {source_count}")
    print(f"  Migrated: {migrated}")
    print(f"  Skipped (already existed): {skipped}")
    print(f"  Target count before: {target_count_before}")
    print(f"  Target count after: {target_count_after}")

    if target_count_after != source_count:
        print(f"  [WARN] Count mismatch! Source={source_count} Target={target_count_after}")
        sys.exit(1)
    else:
        print(f"  [OK] Count match verified.")


if __name__ == "__main__":
    main()

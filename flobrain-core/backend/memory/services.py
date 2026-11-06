import logging
from typing import Any, Callable, Dict, Optional

from django.conf import settings

from memory.mongo_client import db as mongo_db

from .models import MemoryNode
from .sorter import distribute_to_tiers
from .tier_1 import evict_from_active_buffer, save_to_active_buffer
from .tier_2 import delete_vectors, get_collection, index_node
from .tier_3 import delete_from_cold_storage, list_archived_uris, migrate_to_cold_storage

RECONCILE_BATCH_SIZE = 500

logger = logging.getLogger(__name__)


def save_memory(
    owner_id: str,
    data: Dict[str, Any],
    source_chat_id: Optional[int] = None,
    source_message_id: Optional[int] = None,
) -> MemoryNode:
    """Create (or reuse, by content) the owner's memory and update its derived stores.

    `data` is MemorySaveSerializer.validated_data; owner and provenance come only from
    the caller. Any `supersedes` ID must already be checked as the owner's node. The
    returned node carries `deduplicated` and its `index_status` after this call.
    """
    payload = {
        **data,
        "owner_id": owner_id,
        "source_chat_id": source_chat_id,
        "source_message_id": source_message_id,
    }
    node = distribute_to_tiers(payload)

    supersedes = data.get("supersedes")
    if supersedes and supersedes != node.id:
        MemoryNode.objects.filter(id=supersedes, owner_id=owner_id).update(superseded_by=node)

    if not node.deduplicated:
        # Cold archive is opt-in and only for nodes routed to tier 3; anything not
        # archived (including tier 3 with archival off or failing) stays indexed.
        archived = False
        if node.tier_level == 3 and settings.MEMORY_COLD_STORAGE_ENABLED:
            archived = migrate_to_cold_storage(node)
            if not archived:
                # Not in the cold vault, so do not claim tier 3; it is served from the index
                node.tier_level = 2
                node.save(update_fields=["tier_level"])

        # The sorter's transaction has committed, so the row exists for indexing
        if not archived:
            index_node(node)

        if node.tier_level == 1:
            save_to_active_buffer(node)
    elif node.index_status != MemoryNode.INDEX_INDEXED and not node.metadata.get("vault_uri"):
        index_node(node)

    return node


def purge_owner_memories(owner_id: str) -> Callable[[], None]:
    """Delete every SQL memory row of `owner_id` and return the derived-store cleanup.

    Call inside the transaction that deletes the account and run the returned function
    after commit (D2: account deletion removes all of the owner's memories). Derived
    cleanup never raises; anything it misses is an orphan that recall cannot return,
    because no SQL row remains (I2), and that reconciliation removes.
    """
    rows = list(MemoryNode.objects.filter(owner_id=owner_id).values_list("id", "metadata"))
    node_ids = [node_id for node_id, _metadata in rows]
    vault_uris = [(metadata or {}).get("vault_uri") for _node_id, metadata in rows]
    MemoryNode.objects.filter(owner_id=owner_id).delete()

    def cleanup() -> None:
        delete_vectors(ids=node_ids, owner_id=owner_id)
        for node_id in node_ids:
            evict_from_active_buffer(node_id)
        for vault_uri in filter(None, vault_uris):
            delete_from_cold_storage(vault_uri)
        try:
            mongo_db.workflow_events.delete_many(
                {"user_id": owner_id, "event_type": {"$regex": "^memory_"}}
            )
        except Exception as e:
            logger.warning("Memory events for %s not deleted: %s", owner_id, e)

    return cleanup


def reconcile_memory(dry_run: bool = False, archive: bool = False) -> Dict[str, Any]:
    """Bring the derived stores back in line with SQL (I1). Idempotent; safe to re-run.

    - re-index rows whose index_status is pending/failed (archived rows stay unindexed)
    - re-index vectors whose owner/type metadata no longer matches SQL
    - delete vectors with no SQL row
    - with `archive`, delete archive objects that no row's vault_uri points to
    With `dry_run`, only counts what would change.
    """
    counts: Dict[str, Any] = {
        "dry_run": dry_run,
        "archive": "skipped",
        "reindexed": 0,
        "reindex_failed": 0,
        "resynced": 0,
        "orphan_vectors_deleted": 0,
        "orphan_archive_objects_deleted": 0,
    }

    for node in MemoryNode.objects.filter(
        index_status__in=[MemoryNode.INDEX_PENDING, MemoryNode.INDEX_FAILED]
    ).iterator():
        if (node.metadata or {}).get("vault_uri"):
            continue
        if dry_run or index_node(node):
            counts["reindexed"] += 1
        else:
            counts["reindex_failed"] += 1

    collection = get_collection()
    offset = 0
    while True:
        batch = collection.get(include=["metadatas"], limit=RECONCILE_BATCH_SIZE, offset=offset)
        ids, metadatas = batch["ids"], batch["metadatas"]
        if not ids:
            break
        rows = {n.id: n for n in MemoryNode.objects.filter(id__in=ids)}
        orphans = [vid for vid in ids if vid not in rows]
        stale = [
            rows[vid] for vid, meta in zip(ids, metadatas)
            if vid in rows and (meta or {}) != {"o_id": rows[vid].owner_id, "memory_type": rows[vid].memory_type}
        ]
        counts["orphan_vectors_deleted"] += len(orphans)
        counts["resynced"] += len(stale)
        if not dry_run:
            if orphans:
                delete_vectors(ids=orphans)
            for node in stale:
                index_node(node)
        # Deleted orphans shift later vectors down, so only advance past what remains
        offset += len(ids) - (0 if dry_run else len(orphans))

    if archive:
        uris = list_archived_uris()
        if uris is None:
            counts["archive"] = "unavailable"
        else:
            counts["archive"] = "checked"
            referenced = {
                (metadata or {}).get("vault_uri")
                for metadata in MemoryNode.objects.filter(metadata__has_key="vault_uri").values_list("metadata", flat=True)
            }
            for uri in uris:
                if uri in referenced:
                    continue
                if dry_run or delete_from_cold_storage(uri):
                    counts["orphan_archive_objects_deleted"] += 1

    return counts

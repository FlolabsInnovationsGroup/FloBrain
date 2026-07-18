"""
supermemory_adapter.py — Cognitive API layer with SuperMemory delegation.

Two modes (auto-selected at runtime):
  - STUB: SUPERMEMORY_BASE_URL unset → uses local chunker/extractor + FloBrainCore storage
  - REMOTE: SUPERMEMORY_BASE_URL set → delegates memorize/recall/forget to SuperMemory server,
            keeps entities + Hebbian graph in FloBrainCore for reranking

This dual mode lets the code run today (stub) and connect to the real
SuperMemory server later via a single env var — no code changes required.
"""
import logging
import uuid
from typing import List, Dict, Any, Optional

from django.db import transaction
from django.utils import timezone

from .models import MemoryNode, MemoryLink
from .sorter import distribute_to_tiers
from .tier_2 import save_to_associative_layer, hybrid_search
from .embeddings import embedding_service
from .semantic_chunker import SemanticChunker, default_chunker
from .entity_extractor import EntityExtractor, default_extractor
from . import supermemory_connector as smc

logger = logging.getLogger(__name__)

REL_CHUNK_OF = "chunk_of"
REL_MENTIONS_ENTITY = "mentions"


class SuperMemoryAdapter:
    """Cognitive API surface. Delegates to SuperMemory when configured."""

    def __init__(
        self,
        chunker: Optional[SemanticChunker] = None,
        extractor: Optional[EntityExtractor] = None,
    ):
        self.chunker = chunker or default_chunker
        self.extractor = extractor or default_extractor

    # ===============================================================
    # MEMORIZE
    # ===============================================================

    def memorize(
        self,
        content: str,
        owner_id: str,
        metadata: Optional[Dict[str, Any]] = None,
        importance: float = 0.5,
        is_global: bool = False,
        source: str = "unknown",
        doc_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        if not content or not content.strip():
            return {"status": "empty", "doc_id": None, "chunks": [], "entities": []}

        # REMOTE mode: delegate to SuperMemory, then mirror metadata locally
        if smc.is_configured():
            return self._memorize_remote(content, owner_id, metadata or {}, importance, doc_id)

        # STUB mode: local chunker + entity extractor + FloBrainCore storage
        return self._memorize_local(content, owner_id, metadata or {}, importance, is_global, source, doc_id)

    def _memorize_remote(
        self,
        content: str,
        owner_id: str,
        metadata: Dict[str, Any],
        importance: float,
        doc_id: Optional[str],
    ) -> Dict[str, Any]:
        """Delegates storage to SuperMemory server, mirrors metadata locally for Hebbian."""
        try:
            sm_doc = smc.create_document(
                content=content,
                metadata={**metadata, "owner_id": owner_id, "importance": importance},
                doc_id=doc_id,
            )
            remote_id = sm_doc.get("id") or doc_id or f"sm_{uuid.uuid4().hex[:16]}"

            # Mirror as a single MemoryNode so Hebbian/graph still works
            self._create_memory_node(
                node_id=remote_id,
                owner_id=owner_id,
                name=metadata.get("title", content[:80]),
                raw_text=content,
                importance=importance,
                is_global=False,
                tier_level=2,
                metadata={
                    **metadata,
                    "type": "document",
                    "source": "supermemory",
                    "remote_id": remote_id,
                    "memorized_at": timezone.now().isoformat(),
                },
            )

            # Local entities for the graph (best-effort)
            entities = self._extract_and_link_entities(remote_id, owner_id, content, metadata)

            return {
                "status": "memorized",
                "mode": "remote",
                "doc_id": remote_id,
                "chunks": [remote_id],
                "entities": entities,
            }
        except Exception as e:
            logger.error(f"[Adapter] Remote memorize failed, falling back to local: {e}")
            return self._memorize_local(content, owner_id, metadata, importance, False, "supermemory_fallback", doc_id)

    def _memorize_local(
        self,
        content: str,
        owner_id: str,
        metadata: Dict[str, Any],
        importance: float,
        is_global: bool,
        source: str,
        doc_id: Optional[str],
    ) -> Dict[str, Any]:
        """Local stub: chunker + entity extractor + FloBrainCore storage."""
        parent_doc_id = doc_id or f"doc_{uuid.uuid4().hex[:16]}"
        metadata = dict(metadata)
        metadata.update({
            "owner_id": owner_id,
            "source": source,
            "parent_doc_id": parent_doc_id,
            "memorized_at": timezone.now().isoformat(),
        })

        chunks = self.chunker.chunk(content, metadata=metadata)
        if not chunks:
            return {"status": "empty", "doc_id": parent_doc_id, "chunks": [], "entities": []}

        # Parent document node — use actual returned ID (dedup may return existing)
        parent_node = self._create_memory_node(
            node_id=parent_doc_id,
            owner_id=owner_id,
            name=metadata.get("title", content[:80]),
            raw_text=content,
            importance=importance,
            is_global=is_global,
            tier_level=2,
            metadata={**metadata, "type": "document", "chunk_count": len(chunks)},
        )
        actual_parent_id = parent_node.id

        chunk_ids: List[str] = []
        all_entities: List[Dict[str, Any]] = []

        with transaction.atomic():
            for chunk in chunks:
                chunk_id = f"{parent_doc_id}_chunk_{chunk['position']}"
                chunk_node = self._create_memory_node(
                    node_id=chunk_id,
                    owner_id=owner_id,
                    name=chunk["content"][:120],
                    raw_text=chunk["content"],
                    importance=importance,
                    is_global=is_global,
                    tier_level=2,
                    metadata={
                        **chunk["metadata"],
                        "type": "chunk",
                        "parent_doc_id": actual_parent_id,
                        "position": chunk["position"],
                    },
                )
                actual_chunk_id = chunk_node.id
                chunk_ids.append(actual_chunk_id)
                self._link_nodes(actual_chunk_id, actual_parent_id, REL_CHUNK_OF, weight=1.0)

                embedding = embedding_service.embed(chunk["content"])
                save_to_associative_layer(chunk_node, embedding)

                ents = self._extract_and_link_entities(actual_chunk_id, owner_id, chunk["content"], chunk["metadata"])
                all_entities.extend(ents)

        # Dedupe entities by id
        unique_entities = list({e["id"]: e for e in all_entities}.values())
        logger.info(f"[Adapter] Local memorize {actual_parent_id}: {len(chunks)} chunks, {len(unique_entities)} entities")

        return {
            "status": "memorized",
            "mode": "local",
            "doc_id": actual_parent_id,
            "chunks": chunk_ids,
            "entities": unique_entities,
        }

    def _extract_and_link_entities(
        self, node_id: str, owner_id: str, content: str, metadata: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Extracts entities from content and links them to the node."""
        entities = self.extractor.extract(content)
        result = []
        for ent in entities:
            entity_node_id = self._ensure_entity_node(owner_id, ent["normalized"], ent["type"])
            self._link_nodes(node_id, entity_node_id, REL_MENTIONS_ENTITY, weight=1.0)
            result.append({
                "id": entity_node_id,
                "text": ent["text"],
                "type": ent["type"],
                "normalized": ent["normalized"],
            })
        return result

    # ===============================================================
    # RECALL
    # ===============================================================

    def recall(
        self,
        query: str,
        owner_id: str,
        top_n: int = 10,
        include_context: bool = True,
    ) -> List[Dict[str, Any]]:
        if not query or not query.strip():
            return []

        # REMOTE: SuperMemory does semantic search; we enrich with local graph
        if smc.is_configured():
            try:
                sm_results = smc.search(query=query, top_n=top_n, filters={"owner_id": owner_id})
                return [self._enrich_remote_result(r, owner_id) for r in sm_results[:top_n]]
            except Exception as e:
                logger.warning(f"[Adapter] Remote recall failed, falling back to local: {e}")

        # STUB / fallback: local hybrid_search
        return self._recall_local(query, owner_id, top_n, include_context)

    def _recall_local(self, query, owner_id, top_n, include_context) -> List[Dict[str, Any]]:
        node_ids = hybrid_search(
            query_text=query,
            query_embedding=None,
            owner_id=owner_id,
            top_n=top_n,
        )
        if not node_ids:
            return []

        nodes = MemoryNode.objects.filter(id__in=node_ids, owner_id=owner_id)
        node_map = {n.id: n for n in nodes}

        results = []
        for rank, nid in enumerate(node_ids):
            node = node_map.get(nid)
            if not node:
                continue
            meta = node.metadata if isinstance(node.metadata, dict) else {}
            entry = {
                "id": node.id,
                "content": meta.get("raw_text", "") or node.name,
                "score": 1.0 - (rank * 0.05),
                "type": meta.get("type", "chunk"),
                "metadata": meta,
                "mode": "local",
            }
            if include_context:
                entry.update(self._fetch_context(node, meta))
            results.append(entry)
        return results

    def _enrich_remote_result(self, sm_result: Dict[str, Any], owner_id: str) -> Dict[str, Any]:
        """Adds local entity/graph context to a SuperMemory search result."""
        remote_id = sm_result.get("id") or sm_result.get("document_id")
        entry = {
            "id": remote_id,
            "content": sm_result.get("content", "") or sm_result.get("text", ""),
            "score": sm_result.get("score", 0.5),
            "type": sm_result.get("type", "document"),
            "metadata": sm_result.get("metadata", {}),
            "mode": "remote",
        }
        # If we have a local mirror node, enrich with entities
        local_node = MemoryNode.objects.filter(id=remote_id, owner_id=owner_id).first()
        if local_node:
            meta = local_node.metadata if isinstance(local_node.metadata, dict) else {}
            entry.update(self._fetch_context(local_node, meta))
        return entry

    def _fetch_context(self, node: MemoryNode, meta: Dict[str, Any]) -> Dict[str, Any]:
        """Fetches parent doc + entities for a node."""
        ctx = {"parent_doc": None, "entities": []}
        parent_id = meta.get("parent_doc_id")
        if parent_id:
            parent = MemoryNode.objects.filter(id=parent_id).first()
            if parent:
                pmeta = parent.metadata if isinstance(parent.metadata, dict) else {}
                ctx["parent_doc"] = {
                    "id": parent.id,
                    "name": parent.name,
                    "preview": (pmeta.get("raw_text", "") or "")[:200],
                }
        entity_links = MemoryLink.objects.filter(
            source_id=node.id, relation=REL_MENTIONS_ENTITY
        ).values_list("target_id", flat=True)
        if entity_links:
            entity_nodes = MemoryNode.objects.filter(id__in=list(entity_links))
            ctx["entities"] = [
                {"id": e.id, "text": e.name, "type": (e.metadata or {}).get("entity_type", "misc")}
                for e in entity_nodes
            ]
        return ctx

    # ===============================================================
    # FORGET
    # ===============================================================

    def forget(self, memory_id: str, owner_id: str, cascade: bool = True) -> Dict[str, Any]:
        # REMOTE: delete from SuperMemory first
        remote_status = None
        if smc.is_configured():
            try:
                smc.delete_document(memory_id)
                remote_status = "deleted_remote"
            except Exception as e:
                logger.warning(f"[Adapter] Remote forget failed: {e}")
                remote_status = "remote_failed"

        # Local cleanup
        try:
            node = MemoryNode.objects.get(id=memory_id, owner_id=owner_id)
        except MemoryNode.DoesNotExist:
            return {"status": "not_found", "memory_id": memory_id}

        deleted_chunks: List[str] = []
        with transaction.atomic():
            if cascade:
                chunk_links = MemoryLink.objects.filter(
                    target_id=memory_id, relation=REL_CHUNK_OF
                ).values_list("source_id", flat=True)
                for chunk_id in list(chunk_links):
                    MemoryLink.objects.filter(source_id=chunk_id, relation=REL_MENTIONS_ENTITY).delete()
                    MemoryNode.objects.filter(id=chunk_id).delete()
                    deleted_chunks.append(chunk_id)
            MemoryLink.objects.filter(source_id=memory_id).delete()
            MemoryLink.objects.filter(target_id=memory_id).delete()
            node.delete()

        return {
            "status": "forgotten",
            "memory_id": memory_id,
            "deleted_chunks": deleted_chunks,
            "remote_status": remote_status,
        }

    # ===============================================================
    # ENTITY OPERATIONS (always local)
    # ===============================================================

    def search_entities(
        self, entity_text: str, owner_id: str, entity_type: Optional[str] = None, top_n: int = 20
    ) -> List[Dict[str, Any]]:
        qs = MemoryNode.objects.filter(owner_id=owner_id, name__iexact=entity_text, metadata__entity_type__isnull=False)
        if entity_type:
            qs = qs.filter(metadata__entity_type=entity_type)
        entity_nodes = list(qs[:10])
        if not entity_nodes:
            return []

        chunk_ids = set()
        for ent in entity_nodes:
            mentions = MemoryLink.objects.filter(
                target_id=ent.id, relation=REL_MENTIONS_ENTITY
            ).values_list("source_id", flat=True)
            chunk_ids.update(mentions)
        if not chunk_ids:
            return []

        chunks = MemoryNode.objects.filter(id__in=list(chunk_ids)[:top_n], owner_id=owner_id)
        return [
            {
                "id": c.id,
                "content": (c.metadata or {}).get("raw_text", "") or c.name,
                "parent_doc_id": (c.metadata or {}).get("parent_doc_id"),
                "position": (c.metadata or {}).get("position", 0),
                "matched_entity": entity_text,
            }
            for c in chunks
        ]

    def list_entities(self, owner_id: str, entity_type: Optional[str] = None, top_n: int = 100) -> List[Dict[str, Any]]:
        qs = MemoryNode.objects.filter(owner_id=owner_id, metadata__entity_type__isnull=False).order_by("-updated_at")
        if entity_type:
            qs = qs.filter(metadata__entity_type=entity_type)
        return [
            {
                "id": n.id,
                "text": n.name,
                "type": (n.metadata or {}).get("entity_type", "misc"),
                "mention_count": (n.metadata or {}).get("mention_count", 1),
                "last_mentioned_at": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in qs[:top_n]
        ]

    # ===============================================================
    # HELPERS
    # ===============================================================

    def _create_memory_node(
        self, node_id, owner_id, name, raw_text, importance, is_global, tier_level, metadata
    ) -> MemoryNode:
        payload = {
            "id": node_id,
            "owner_id": owner_id,
            "name": name,
            "importance": importance,
            "is_global": is_global,
            "metadata": {**metadata, "raw_text": raw_text},
            "tokens": [],
        }
        return distribute_to_tiers(payload)

    def _link_nodes(self, source_id, target_id, relation, weight=0.5) -> None:
        link, created = MemoryLink.objects.get_or_create(
            source_id=source_id, target_id=target_id, relation=relation,
            defaults={"weight": weight},
        )
        if not created and relation == REL_MENTIONS_ENTITY:
            link.weight = min(1.0, float(link.weight) + 0.1)
            link.save(update_fields=["weight"])

    def _ensure_entity_node(self, owner_id: str, entity_text: str, entity_type: str) -> str:
        entity_id = f"entity_{entity_type}_{hash(entity_text.lower()) & 0xFFFFFFFF:08x}"
        node, created = MemoryNode.objects.get_or_create(
            id=entity_id,
            defaults={
                "owner_id": owner_id,
                "name": entity_text,
                "tier_level": 2,
                "relevance": 0.5,
                "metadata": {
                    "type": "entity",
                    "entity_type": entity_type,
                    "normalized": entity_text,
                    "mention_count": 1,
                },
            },
        )
        if not created:
            meta = node.metadata if isinstance(node.metadata, dict) else {}
            meta["mention_count"] = meta.get("mention_count", 1) + 1
            meta["last_mentioned_at"] = timezone.now().isoformat()
            node.metadata = meta
            node.save(update_fields=["metadata", "updated_at"])
        return entity_id


supermemory_adapter = SuperMemoryAdapter()

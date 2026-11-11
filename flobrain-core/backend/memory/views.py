import logging

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)

from memory.mongo_client import db as mongo_db
from users.views import get_user_from_request

from .models import MemoryLink, MemoryNode
from .serializers import MAX_CONTENT_CHARS, MemorySaveSerializer
from .sorter import content_hash_for
from .tier_1 import evict_from_active_buffer
from .tier_2 import delete_vectors, index_node
from .tier_3 import delete_from_cold_storage, migrate_to_cold_storage

def _parse_date_range(date_range: str):
    """Return (start, end) datetime or (None, None) for 'All Time'."""
    now = timezone.now()
    if date_range == "Last Week":
        from datetime import timedelta
        start = now - timedelta(days=7)
        return start, now
    if date_range == "Last Month":
        from datetime import timedelta
        start = now - timedelta(days=30)
        return start, now
    if date_range == "Last Year":
        from datetime import timedelta
        start = now - timedelta(days=365)
        return start, now
    return None, None


def _log_memory_event(user_id, event_type, status="success", payload=None):
    """Best-effort audit event. Payloads carry IDs and field names, never memory values."""
    try:
        mongo_db.workflow_events.insert_one(
            {
                "workflow_id": None,
                "user_id": user_id,
                "event_type": event_type,
                "status": status,
                "payload": payload or {},
                "created_at": timezone.now(),
            }
        )
    except Exception as e:
        logger.warning("Memory event %s not logged: %s", event_type, e)


def _propagate_content_change(node, old_vault_uri):
    """Bring derived stores in line with a corrected `content` (SQL is already saved)."""
    evict_from_active_buffer(node.id)
    archived = False
    if old_vault_uri:
        # The old blob holds the outdated text; replace it rather than leave it behind
        delete_from_cold_storage(old_vault_uri)
        metadata = dict(node.metadata or {})
        metadata.pop("vault_uri", None)
        node.metadata = metadata
        node.save(update_fields=["metadata"])
        if node.tier_level == 3 and settings.MEMORY_COLD_STORAGE_ENABLED:
            archived = migrate_to_cold_storage(node)
    if not archived:
        index_node(node)


class MemoryGraphView(APIView):
    """
    GET /api/memory/graph/
    Query params: search, date_range, memory_type, min_relevance
    Returns { nodes: [...], links: [...] } for the force graph.
    Requires Bearer token.
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required", "details": "Valid Bearer token required"},
                status=401,
            )

        search = (request.query_params.get("search") or "").strip()
        date_range = request.query_params.get("date_range") or "All Time"
        memory_type = request.query_params.get("memory_type") or "All"
        try:
            min_relevance = float(request.query_params.get("min_relevance", 0))
        except (TypeError, ValueError):
            min_relevance = 0.0

        # Scope to authenticated user's own memory nodes only
        qs = MemoryNode.objects.filter(owner_id=str(user.id))

        if search:
            # Map display names (searchable in UI) to DB memory_type values
            search_lower = search.lower().strip()
            type_map = {
                "chunks": "chunk",
                "summaries": "summary",
                "interactions": "interaction",
                "workflows": "workflow",
            }
            type_value = type_map.get(search_lower)
            if type_value:
                qs = qs.filter(
                    Q(name__icontains=search) | Q(memory_type=type_value)
                )
            else:
                qs = qs.filter(name__icontains=search)

        start, end = _parse_date_range(date_range)
        if start is not None and end is not None:
            qs = qs.filter(created_at__gte=start, created_at__lte=end)

        if memory_type != "All":
            type_map = {
                "Chunks": "chunk",
                "Summaries": "summary",
                "Interactions": "interaction",
                "Workflows": "workflow",
            }
            type_value = type_map.get(memory_type)
            if type_value:
                qs = qs.filter(memory_type=type_value)

        if min_relevance > 0:
            qs = qs.filter(relevance__gte=min_relevance)

        node_ids = set(qs.values_list("id", flat=True))
        nodes = [
            {
                "id": n.id,
                "name": n.name,
                "val": n.relevance,
                "group": n.memory_type,
                "memory_type": n.memory_type,
                "relevance": n.relevance,
                "created_at": n.created_at.isoformat() if n.created_at else None,
            }
            for n in qs
        ]

        # Links: only include if both source and target are in filtered nodes
        links_qs = MemoryLink.objects.filter(
            source_id__in=node_ids,
            target_id__in=node_ids,
        )
        links = [
            {"source": link.source_id, "target": link.target_id}
            for link in links_qs
        ]

        return Response({"nodes": nodes, "links": links})


class MemoryNodeDetailView(APIView):
    """
    GET /api/memory/nodes/{id}/
    Returns single node + all connections for detail panel.
    PATCH edits fields (content propagates to derived stores); DELETE removes it everywhere.
    """
    def get(self, request, pk):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=401)
        
        owner_id = str(user.id)
        try:
            # Foreign and nonexistent IDs both 404 so existence is not disclosed
            node = MemoryNode.objects.get(id=pk, owner_id=owner_id)

            # Connections limited to the caller's own nodes
            outgoing = [
                {"id": link.target.id, "name": link.target.name, "group": link.target.memory_type}
                for link in node.outgoing_links.filter(target__owner_id=owner_id).select_related("target")
            ]
            incoming = [
                {"id": link.source.id, "name": link.source.name, "group": link.source.memory_type}
                for link in node.incoming_links.filter(source__owner_id=owner_id).select_related("source")
            ]
            
            return Response({
                "id": node.id,
                "name": node.name,
                "val": node.relevance,
                "group": node.memory_type,
                "memory_type": node.memory_type,
                "relevance": node.relevance,
                "created_at": node.created_at.isoformat(),
                "content": node.content,
                "is_excluded": node.is_excluded,
                "index_status": node.index_status,
                "connections": {
                    "outgoing": outgoing,
                    "incoming": incoming,
                    "total": len(outgoing) + len(incoming)
                }
            })
        except MemoryNode.DoesNotExist:
            return Response({"error": "Node not found"}, status=404)

    def patch(self, request, pk):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=401)

        try:
            node = MemoryNode.objects.get(id=pk, owner_id=str(user.id))
        except MemoryNode.DoesNotExist:
            return Response({"error": "Node not found"}, status=404)

        allowed_fields = {"name", "memory_type", "relevance", "content", "is_excluded"}
        updates = {}
        for field in allowed_fields:
            if field in request.data:
                updates[field] = request.data[field]

        if not updates:
            return Response({"error": "No editable fields provided"}, status=400)

        # Exclusion is a reversible flag; recall honours it through the SQL eligibility join
        if "is_excluded" in updates and not isinstance(updates["is_excluded"], bool):
            return Response(
                {"error": "Validation failed", "details": {"is_excluded": "Must be true or false"}},
                status=400,
            )

        content_changed = False
        if "content" in updates:
            content = updates["content"]
            if not isinstance(content, str) or not content.strip() or len(content) > MAX_CONTENT_CHARS:
                return Response(
                    {"error": "Validation failed", "details": {"content": "Must be 1-%d characters" % MAX_CONTENT_CHARS}},
                    status=400,
                )
            content_changed = content != node.content
            if content_changed:
                updates["content_hash"] = content_hash_for(content)

        old_vault_uri = (node.metadata or {}).get("vault_uri")
        for field, value in updates.items():
            setattr(node, field, value)
        node.save(update_fields=list(updates.keys()))

        if content_changed:
            _propagate_content_change(node, old_vault_uri)

        _log_memory_event(
            user_id=str(user.id),
            event_type="memory_updated",
            payload={
                "memory_node_id": node.id,
                "fields": sorted(f for f in updates if f != "content_hash"),
            },
        )

        return Response(
            {
                "id": node.id,
                "name": node.name,
                "val": node.relevance,
                "group": node.memory_type,
                "memory_type": node.memory_type,
                "relevance": node.relevance,
                "created_at": node.created_at.isoformat(),
                "content": node.content,
                "is_excluded": node.is_excluded,
                "index_status": node.index_status,
            }
        )

    def delete(self, request, pk):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=401)

        try:
            node = MemoryNode.objects.get(id=pk, owner_id=str(user.id))
        except MemoryNode.DoesNotExist:
            return Response({"error": "Node not found"}, status=404)

        node_id = node.id
        vault_uri = (node.metadata or {}).get("vault_uri")
        # SQL is the source of truth: links cascade, supersession pointers are cleared
        node.delete()

        def _delete_derived():
            # Failures are logged by each helper and left for reconciliation (T13);
            # recall never returns a missing row (I2), so an orphan cannot be recalled
            delete_vectors(ids=[node_id])
            evict_from_active_buffer(node_id)
            if vault_uri:
                delete_from_cold_storage(vault_uri)

        transaction.on_commit(_delete_derived)

        _log_memory_event(
            user_id=str(user.id),
            event_type="memory_deleted",
            payload={"memory_node_id": node_id},
        )
        return Response(status=204)


class MemorySaveView(APIView):

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Auth required"}, status=401)

        serializer = MemorySaveSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors}, status=400
            )
        owner_id = str(user.id)
        data = serializer.validated_data

        supersedes = data.get("supersedes")
        if supersedes and not MemoryNode.objects.filter(id=supersedes, owner_id=owner_id).exists():
            return Response({"error": "Node not found"}, status=404)

        try:
            from .services import save_memory

            # Owner always comes from the authenticated user; ids are server-generated.
            node = save_memory(owner_id, data)

            return Response({
                "status": "saved",
                "index_status": node.index_status,
                "deduplicated": node.deduplicated,
                "binary_index": node.binary_index,
                "tier": node.tier_level,
                "node_id": node.id,
            })
        except Exception:
            logger.exception("MemorySaveView failed for user %s", user.id)
            return Response({"error": "Failed to save memory node"}, status=500)

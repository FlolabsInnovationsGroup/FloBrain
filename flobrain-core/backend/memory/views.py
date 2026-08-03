from django.db.models import Q
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from memory.mongo_client import db as mongo_db
from users.views import get_user_from_request

from .models import MemoryLink, MemoryNode

from rest_framework import status
from .sorter import distribute_to_tiers
from .tier_1 import save_to_active_buffer
from .tier_2 import save_to_associative_layer
from .tier_3 import migrate_to_cold_storage

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

        qs = MemoryNode.objects.all()

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
    """
    def get(self, request, pk):
        from users.views import get_user_from_request
        
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required"}, status=401)
        
        try:
            node = MemoryNode.objects.get(id=pk)
            
            # All connections (not filtered)
            outgoing = [
                {"id": link.target.id, "name": link.target.name, "group": link.target.memory_type}
                for link in node.outgoing_links.all()
            ]
            incoming = [
                {"id": link.source.id, "name": link.source.name, "group": link.source.memory_type}
                for link in node.incoming_links.all()
            ]

            return Response({
                "id": node.id,
                "name": node.name,
                "memory_type": node.memory_type,
                "relevance": node.relevance,
                "created_at": node.created_at.isoformat(),
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
            node = MemoryNode.objects.get(id=pk)
        except MemoryNode.DoesNotExist:
            return Response({"error": "Node not found"}, status=404)

        allowed_fields = {"name", "memory_type", "relevance"}
        updates = {}
        for field in allowed_fields:
            if field in request.data:
                updates[field] = request.data[field]

        if not updates:
            return Response({"error": "No editable fields provided"}, status=400)

        before = {
            "name": node.name,
            "memory_type": node.memory_type,
            "relevance": node.relevance,
        }

        for field, value in updates.items():
            setattr(node, field, value)
        node.save(update_fields=list(updates.keys()))

        _log_memory_event(
            user_id=getattr(user, "id", None),
            event_type="memory_updated",
            payload={
                "memory_node_id": node.id,
                "before": before,
                "after": updates,
            },
        )

        return Response(
            {
                "id": node.id,
                "name": node.name,
                "memory_type": node.memory_type,
                "relevance": node.relevance,
                "created_at": node.created_at.isoformat(),
            }
        )


class MemorySaveView(APIView):

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Auth required"}, status=401)

        try:
            node = distribute_to_tiers(request.data)
            embedding = request.data.get('embedding', [])

            migrate_to_cold_storage(node)

            if node.tier_level in [1, 2]:
                save_to_associative_layer(node, embedding)

            if node.tier_level == 1:
                save_to_active_buffer(node)

            return Response({
                "status": "saved",
                "binary_index": node.binary_index,
                "tier": node.tier_level,
                "node_id": node.id
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

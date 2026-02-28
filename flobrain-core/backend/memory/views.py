from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from users.views import get_user_from_request

from .models import MemoryLink, MemoryNode


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
                "val": n.val,
                "group": n.group,
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

"""views_semantic.py — SuperMemory-compatible REST API endpoints + Team scope + Cypher graph.

Routes (mounted via urls.py):
    POST   /api/memory/sm/memorize
    POST   /api/memory/sm/recall?scope=personal|team|all
    DELETE /api/memory/sm/memories/<id>
    GET    /api/memory/sm/entities
    GET    /api/memory/sm/entities/search
    GET    /api/memory/sm/health
    POST   /api/memory/graph/query        — Cypher query (Phase 3)

P1.W3.08: RecallView now accepts scope=personal|team|all (default personal).
  - personal: only owner_id=request.user.id (private memories)
  - team: team_id in user's teams (shared memories)
  - all: both personal and team memories
"""
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .supermemory_adapter import supermemory_adapter
from . import supermemory_connector as smc

logger = logging.getLogger(__name__)


def _get_user_or_401(request):
    try:
        from users.views import get_user_from_request
    except ImportError:
        return None, Response(
            {"error": "Auth module unavailable"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    user = get_user_from_request(request)
    if not user:
        return None, Response(
            {"error": "Authentication required", "details": "Valid Bearer token required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return user, None


def _get_user_team_ids(user_id: str) -> list:
    """Returns list of team IDs the user is a member of."""
    try:
        from .models import TeamMembership
        return list(TeamMembership.objects.filter(user_id=user_id).values_list('team_id', flat=True))
    except Exception:
        return []


class MemorizeView(APIView):
    def post(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err
        content = request.data.get("content", "").strip()
        if not content:
            return Response({"error": "Field 'content' is required"}, status=status.HTTP_400_BAD_REQUEST)
        if len(content) > 100_000:
            return Response({"error": "Content exceeds 100,000 chars"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            result = supermemory_adapter.memorize(
                content=content,
                owner_id=str(user.id),
                metadata=request.data.get("metadata", {}),
                importance=float(request.data.get("importance", 0.5)),
                is_global=bool(request.data.get("is_global", False)),
                source=request.data.get("metadata", {}).get("source", "api"),
                doc_id=request.data.get("doc_id"),
            )
            # P1.W3.06: If team_id in metadata, attach nodes to team
            team_id = request.data.get("metadata", {}).get("team_id") or request.data.get("team_id")
            if team_id and result.get("doc_id"):
                from .models import MemoryNode
                MemoryNode.objects.filter(id=result["doc_id"]).update(team_id=team_id)
                for chunk_id in result.get("chunks", []):
                    MemoryNode.objects.filter(id=chunk_id).update(team_id=team_id)
                result["team_id"] = team_id
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception("[MemorizeView] failed")
            return Response({"error": "Internal error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecallView(APIView):
    """P1.W3.08: scope=personal|team|all parameter."""

    def post(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err
        query = request.data.get("query", "").strip()
        if not query:
            return Response({"error": "Field 'query' is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            top_n = max(1, min(int(request.data.get("top_n", 10)), 100))
        except (TypeError, ValueError):
            top_n = 10
        include_context = bool(request.data.get("include_context", True))
        scope = request.data.get("scope", "personal").lower()
        if scope not in ("personal", "team", "all"):
            scope = "personal"

        try:
            # For personal scope: use adapter.recall with owner_id
            if scope == "personal":
                results = supermemory_adapter.recall(
                    query=query, owner_id=str(user.id), top_n=top_n, include_context=include_context
                )
            else:
                # For team/all: filter at DB level after recall
                team_ids = _get_user_team_ids(str(user.id))
                if scope == "team" and not team_ids:
                    return Response({"memories": [], "count": 0, "scope": scope})
                # Get all candidates (personal + team) and filter
                all_results = supermemory_adapter.recall(
                    query=query, owner_id=str(user.id), top_n=top_n * 3, include_context=include_context
                )
                from .models import MemoryNode
                # Get team membership filter
                if scope == "team":
                    valid_ids = set(MemoryNode.objects.filter(
                        team_id__in=team_ids
                    ).values_list('id', flat=True))
                else:  # all
                    valid_ids = set(MemoryNode.objects.filter(
                        team_id__in=team_ids
                    ).values_list('id', flat=True))
                    # Plus personal owner_id
                    personal_ids = set(MemoryNode.objects.filter(
                        owner_id=str(user.id)
                    ).values_list('id', flat=True))
                    valid_ids.update(personal_ids)
                results = [r for r in all_results if r.get("id") in valid_ids][:top_n]

            return Response({"memories": results, "count": len(results), "scope": scope})
        except Exception as e:
            logger.exception("[RecallView] failed")
            return Response({"error": "Internal error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgetView(APIView):
    def delete(self, request, memory_id):
        user, err = _get_user_or_401(request)
        if err:
            return err
        cascade = request.query_params.get("cascade", "true").lower() != "false"
        try:
            result = supermemory_adapter.forget(memory_id=memory_id, owner_id=str(user.id), cascade=cascade)
            if result["status"] == "not_found":
                return Response(result, status=status.HTTP_404_NOT_FOUND)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("[ForgetView] failed")
            return Response({"error": "Internal error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EntitiesListView(APIView):
    def get(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err
        entity_type = request.query_params.get("type")
        try:
            top_n = max(1, min(int(request.query_params.get("top_n", 100)), 500))
        except (TypeError, ValueError):
            top_n = 100
        try:
            entities = supermemory_adapter.list_entities(owner_id=str(user.id), entity_type=entity_type, top_n=top_n)
            return Response({"entities": entities, "count": len(entities)})
        except Exception as e:
            logger.exception("[EntitiesListView] failed")
            return Response({"error": "Internal error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class EntitiesSearchView(APIView):
    def get(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err
        entity_text = request.query_params.get("text", "").strip()
        if not entity_text:
            return Response({"error": "Query param 'text' is required"}, status=status.HTTP_400_BAD_REQUEST)
        entity_type = request.query_params.get("type")
        try:
            top_n = max(1, min(int(request.query_params.get("top_n", 20)), 100))
        except (TypeError, ValueError):
            top_n = 20
        try:
            results = supermemory_adapter.search_entities(
                entity_text=entity_text, owner_id=str(user.id), entity_type=entity_type, top_n=top_n
            )
            return Response({"memories": results, "count": len(results)})
        except Exception as e:
            logger.exception("[EntitiesSearchView] failed")
            return Response({"error": "Internal error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HealthView(APIView):
    """Reports adapter + connector status. Primary signal for integration readiness."""

    def get(self, request):
        from .embeddings import embedding_service
        from .tier_2 import collection as chroma_collection

        connector = smc.health()

        health = {
            "status": "ok",
            "adapter": "SuperMemoryAdapter",
            "mode": connector.get("mode", "unknown"),
            "components": {
                "chunker": "SemanticChunker",
                "entity_extractor": "EntityExtractor",
                "embedding_service": embedding_service.model_name,
                "embedding_dim": embedding_service.dimension,
                "vector_store": "ChromaDB" if not request.GET.get("vector_backend") else request.GET["vector_backend"],
                "vector_count": 0,
                "storage_backend": "FloBrainCore (tier_1/2/3)",
            },
            "supermemory_connector": connector,
            "capabilities": ["memorize", "recall", "forget", "list_entities", "search_entities"],
        }

        try:
            health["components"]["vector_count"] = chroma_collection.count()
        except Exception as e:
            health["components"]["vector_count"] = f"error: {e}"
            health["status"] = "degraded"

        return Response(health)


# =============================================================================
# Phase 3 — GraphQueryView for Cypher queries against Neo4j
# =============================================================================

class GraphQueryView(APIView):
    """POST /api/memory/graph/query — execute Cypher query against Neo4j.

    Body: {"cypher": "MATCH (n)-[r]-(m) WHERE n.name CONTAINS 'X' RETURN n, r, m LIMIT 50"}

    Returns JSON: {"results": [...], "count": N, "query": "..."}
    Falls back gracefully if Neo4j is unavailable.
    """

    def post(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err
        cypher = request.data.get("cypher", "").strip()
        if not cypher:
            return Response({"error": "Field 'cypher' is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Safety: block write operations
        cypher_lower = cypher.lower()
        if any(op in cypher_lower for op in ["create", "delete", "merge", "set ", "remove"]):
            return Response(
                {"error": "Only read queries (MATCH/RETURN) are allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            from .graph_sync import run_cypher_query
            results = run_cypher_query(cypher)
            return Response({
                "results": results,
                "count": len(results),
                "query": cypher,
            })
        except ImportError:
            return Response(
                {"error": "Neo4j integration not available", "hint": "Install neo4j driver"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            logger.exception("[GraphQueryView] failed")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

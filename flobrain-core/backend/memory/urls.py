"""urls.py — FloBrain memory routes (legacy + SuperMemory + Team + Graph)."""
from django.urls import path

from .views import MemoryGraphView, MemoryNodeDetailView, MemorySaveView
from .views_semantic import (
    MemorizeView, RecallView, ForgetView,
    EntitiesListView, EntitiesSearchView, HealthView,
    GraphQueryView,
)
from .team_views import (
    TeamListCreateView, TeamDetailView,
    TeamMemberView, TeamMemoryListView, TeamMemoryDetailView,
)

urlpatterns = [
    # Legacy endpoints
    path("api/memory/graph/", MemoryGraphView.as_view(), name="memory-graph"),
    path("api/memory/nodes/<str:pk>/", MemoryNodeDetailView.as_view(), name="memory-node-detail"),
    path("api/memory/save/", MemorySaveView.as_view(), name="memory-save"),

    # SuperMemory-compatible semantic API (/sm = supermemory)
    path("api/memory/sm/memorize", MemorizeView.as_view(), name="sm-memorize"),
    path("api/memory/sm/recall", RecallView.as_view(), name="sm-recall"),
    path("api/memory/sm/memories/<str:memory_id>", ForgetView.as_view(), name="sm-forget"),
    path("api/memory/sm/entities", EntitiesListView.as_view(), name="sm-entities-list"),
    path("api/memory/sm/entities/search", EntitiesSearchView.as_view(), name="sm-entities-search"),
    path("api/memory/sm/health", HealthView.as_view(), name="sm-health"),

    # Phase 3 — Neo4j graph query (Cypher)
    path("api/memory/graph/query", GraphQueryView.as_view(), name="sm-graph-query"),

    # Phase 1 W3 — Team Memory + ACL
    path("api/teams/", TeamListCreateView.as_view(), name="team-list-create"),
    path("api/teams/<str:team_id>", TeamDetailView.as_view(), name="team-detail"),
    path("api/teams/<str:team_id>/members", TeamMemberView.as_view(), name="team-member-list"),
    path("api/teams/<str:team_id>/members/<str:user_id>", TeamMemberView.as_view(), name="team-member-detail"),
    path("api/teams/<str:team_id>/memories", TeamMemoryListView.as_view(), name="team-memory-list"),
    path("api/teams/<str:team_id>/memories/<str:memory_id>", TeamMemoryDetailView.as_view(), name="team-memory-detail"),

    # Phase 3 — Health Buddy MVP API
    path("api/health/measurements", __import__('memory.views_health', fromlist=['HealthMeasurementView']).HealthMeasurementView.as_view(), name="health-measurements"),
]

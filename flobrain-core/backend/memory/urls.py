from django.urls import path
from .views import MemoryGraphView, MemoryNodeDetailView, MemorySaveView

urlpatterns = [
    path("api/memory/graph/", MemoryGraphView.as_view(), name="memory-graph"),
    path("api/memory/nodes/<str:pk>/", MemoryNodeDetailView.as_view(), name="memory-node-detail"),
    path("api/memory/save/", MemorySaveView.as_view(), name="memory-save"),
]

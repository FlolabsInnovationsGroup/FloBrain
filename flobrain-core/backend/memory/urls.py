from django.urls import path

from .views import MemoryGraphView

urlpatterns = [
    path("api/memory/graph/", MemoryGraphView.as_view(), name="memory_graph"),
]

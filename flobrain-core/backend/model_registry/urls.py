from django.urls import path

from .views import AIModelDetailView, AIModelListCreateView, AIModelNamesView

urlpatterns = [
    path(
        "api/model-registry/",
        AIModelListCreateView.as_view(),
        name="model-registry-list",
    ),
    path(
        "api/model-registry/names/",
        AIModelNamesView.as_view(),
        name="model-registry-names",
    ),
    path(
        "api/model-registry/<int:pk>/",
        AIModelDetailView.as_view(),
        name="model-registry-detail",
    ),
]

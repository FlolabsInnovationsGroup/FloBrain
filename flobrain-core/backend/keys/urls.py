from django.urls import path

from .views import CredentialResolveView, JWKSView, UserKeyDetailView, UserKeyListCreateView

urlpatterns = [
    # Internal — called by the multimodal service only
    path("internal/jwks/", JWKSView.as_view()),
    path("internal/credentials/resolve", CredentialResolveView.as_view()),

    # User-facing — submit and manage personal provider keys
    path("api/keys/", UserKeyListCreateView.as_view()),
    path("api/keys/<uuid:credential_id>/", UserKeyDetailView.as_view()),
]

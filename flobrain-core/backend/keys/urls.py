from django.urls import path

from .views import CredentialResolveView, JWKSView, UserKeyDetailView, UserKeyListCreateView, UserKeyValidateView

urlpatterns = [
    # Internal — called by the multimodal service only
    path("internal/jwks/", JWKSView.as_view()),
    path("internal/credentials/resolve", CredentialResolveView.as_view()),

    # User-facing — submit, validate and manage personal provider keys
    path("api/keys/", UserKeyListCreateView.as_view()),
    path("api/keys/<uuid:credential_id>/", UserKeyDetailView.as_view()),
    path("api/keys/<uuid:credential_id>/validate/", UserKeyValidateView.as_view()),
]

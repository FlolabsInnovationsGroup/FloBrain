import logging
import os

import jwt
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.views import get_user_from_request

from .crypto import decrypt_key, encrypt_key
from .models import CredentialVersion, ProviderCredential, TokenReplayGuard
from .serializers import (
    CredentialResolveSerializer,
    UserKeyCreateSerializer,
    UserKeyListSerializer,
)
from . import token_service

logger = logging.getLogger(__name__)


def _multimodal_authenticated(request) -> bool:
    """Check the caller is the multimodal service using the shared service secret."""
    secret = getattr(settings, "MULTIMODAL_SERVICE_SECRET", "") or os.environ.get(
        "MULTIMODAL_SERVICE_SECRET", ""
    )
    if not secret:
        logger.warning("MULTIMODAL_SERVICE_SECRET not configured; credential endpoint is open")
        return False
    auth = request.META.get("HTTP_AUTHORIZATION", "")
    return auth == f"Bearer {secret}"


class JWKSView(APIView):
    """
    GET /internal/jwks/
    Returns the backend's public signing key for multimodal to verify request tokens.
    Protected by the same MULTIMODAL_SERVICE_SECRET.
    """

    authentication_classes = []
    permission_classes = []

    def get(self, request):
        if not _multimodal_authenticated(request):
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)
        try:
            return Response(token_service.get_jwks())
        except RuntimeError as exc:
            logger.error("JWKS unavailable: %s", exc)
            return Response({"error": "Service unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class CredentialResolveView(APIView):
    """
    POST /internal/credentials/resolve
    Called by the multimodal service. Verifies the request token, checks the
    credential state and version, marks the JTI as used, and returns the
    decrypted key for that one request. Each JTI is accepted exactly once.

    Request body: {"context_token": "<signed JWT>"}
    Success 200:  {"binding": {...}, "state": "...", "permitted_targets": [...], "key": "..."}
    403: token invalid / wrong caller / JTI already used
    409: version not current, disabled, deleted or expired
    503: storage unavailable
    """

    authentication_classes = []
    permission_classes = []

    def post(self, request):
        if not _multimodal_authenticated(request):
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        raw_token = request.data.get("context_token", "")
        if not raw_token:
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        # Decode and verify the JWT
        try:
            payload = token_service.decode_token(raw_token)
        except jwt.InvalidTokenError as exc:
            logger.warning("Credential resolve: invalid token — %s", type(exc).__name__)
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        jti = payload.get("jti", "")
        kind = payload.get("kind", "")
        binding = payload.get("binding", {})

        credential_ref = binding.get("credential_ref", "")
        credential_version = binding.get("credential_version")
        credential_source = binding.get("credential_source", "")

        if not all([jti, kind, credential_ref, credential_version is not None, credential_source]):
            return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        try:
            with transaction.atomic():
                # Replay guard: each JTI+kind accepted exactly once
                try:
                    exp_ts = payload.get("exp", 0)
                    exp_dt = timezone.datetime.fromtimestamp(exp_ts, tz=timezone.utc)
                    TokenReplayGuard.objects.create(jti=jti, kind=kind, expires_at=exp_dt)
                except Exception:
                    # UniqueConstraint violation — already used
                    logger.warning("Credential resolve: replayed JTI %s kind=%s", jti, kind)
                    return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

                # Load the credential record
                try:
                    cred = ProviderCredential.objects.get(id=credential_ref)
                except (ProviderCredential.DoesNotExist, Exception):
                    return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

                # Verify source hasn't been tampered
                if cred.source != credential_source:
                    return Response({"error": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

                # Load the exact version named in the token
                try:
                    version_obj = CredentialVersion.objects.get(
                        credential=cred, version=credential_version
                    )
                except CredentialVersion.DoesNotExist:
                    return Response({"error": "Credential unavailable."}, status=status.HTTP_409_CONFLICT)

                # State rules: invoke requires active, validate allows active or pending
                if kind == "invoke" and version_obj.state != CredentialVersion.STATE_ACTIVE:
                    return Response({"error": "Credential unavailable."}, status=status.HTTP_409_CONFLICT)
                if kind == "validate" and version_obj.state not in (
                    CredentialVersion.STATE_ACTIVE,
                    CredentialVersion.STATE_PENDING,
                ):
                    return Response({"error": "Credential unavailable."}, status=status.HTTP_409_CONFLICT)

                # Confirm this is the current version for invoke
                if kind == "invoke":
                    current = cred.active_version()
                    if current is None or current.version != version_obj.version:
                        return Response({"error": "Credential unavailable."}, status=status.HTTP_409_CONFLICT)

                decrypted_key = decrypt_key(version_obj.encrypted_key)

        except Exception as exc:
            logger.error("Credential resolve: storage error — %s", exc)
            return Response({"error": "Service unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Never log the key or the response body
        logger.info("Credential resolve: jti=%s kind=%s credential=%s version=%s", jti, kind, credential_ref, credential_version)

        return Response(
            {
                "binding": binding,
                "state": version_obj.state,
                "permitted_targets": version_obj.permitted_targets,
                "key": decrypted_key,
            },
            headers={"Cache-Control": "no-store"},
        )


class UserKeyListCreateView(APIView):
    """
    GET  /api/keys/        — list the requesting user's provider credentials
    POST /api/keys/        — submit a new provider API key (B-4)
    """

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        creds = ProviderCredential.objects.filter(user=user, source=ProviderCredential.SOURCE_CUSTOMER)
        serializer = UserKeyListSerializer(creds, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserKeyCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        raw_key = serializer.validated_data["api_key"]
        provider = serializer.validated_data["provider"]
        label = serializer.validated_data.get("label", "")
        targets = serializer.validated_data.get("permitted_targets", _default_targets(provider))

        with transaction.atomic():
            cred = ProviderCredential.objects.create(
                user=user,
                scope_id=str(user.id),
                provider=provider,
                source=ProviderCredential.SOURCE_CUSTOMER,
                label=label,
            )
            encrypted = encrypt_key(raw_key)
            version_obj = CredentialVersion.objects.create(
                credential=cred,
                version=1,
                encrypted_key=encrypted,
                state=CredentialVersion.STATE_PENDING,
                permitted_targets=targets,
            )

        return Response(
            {
                "id": str(cred.id),
                "provider": cred.provider,
                "source": cred.source,
                "label": cred.label,
                "version": version_obj.version,
                "state": version_obj.state,
                "scope_id": cred.scope_id,
            },
            status=status.HTTP_201_CREATED,
        )


class UserKeyDetailView(APIView):
    """
    DELETE /api/keys/{credential_id}/  — disable and soft-delete a user's key
    """

    def delete(self, request, credential_id):
        user = get_user_from_request(request)
        if not user:
            return Response({"error": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            cred = ProviderCredential.objects.get(
                id=credential_id, user=user, source=ProviderCredential.SOURCE_CUSTOMER
            )
        except ProviderCredential.DoesNotExist:
            return Response({"error": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        CredentialVersion.objects.filter(credential=cred).exclude(
            state__in=[CredentialVersion.STATE_DELETED]
        ).update(state=CredentialVersion.STATE_DELETED, disabled_at=now)

        return Response(status=status.HTTP_204_NO_CONTENT)


def _default_targets(provider: str) -> list[dict]:
    if provider == ProviderCredential.PROVIDER_OPENAI:
        return [
            {"operation": "generate_text", "model": "gpt-4o-mini"},
            {"operation": "transcribe_audio", "model": "gpt-4o-mini-transcribe"},
        ]
    return []

import uuid

from django.db import models
from django.utils import timezone


class ProviderCredential(models.Model):
    """An API key record owned by a user (customer) or the platform."""

    SOURCE_CUSTOMER = "customer"
    SOURCE_PLATFORM = "platform"
    SOURCE_CHOICES = [(SOURCE_CUSTOMER, "Customer"), (SOURCE_PLATFORM, "Platform")]

    PROVIDER_OPENAI = "openai"
    PROVIDER_CHOICES = [(PROVIDER_OPENAI, "OpenAI")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="provider_credentials",
        db_column="user_id",
    )
    # Opaque identifier for token binding: user UUID string or "platform"
    scope_id = models.CharField(max_length=128, db_index=True)
    provider = models.CharField(max_length=32, choices=PROVIDER_CHOICES)
    source = models.CharField(max_length=16, choices=SOURCE_CHOICES)
    label = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "provider_credentials"
        indexes = [models.Index(fields=["scope_id", "provider"])]

    def __str__(self) -> str:
        return f"{self.source}/{self.provider} — {self.scope_id}"

    def active_version(self) -> "CredentialVersion | None":
        return self.versions.filter(state=CredentialVersion.STATE_ACTIVE).order_by("-version").first()


class CredentialVersion(models.Model):
    """One encrypted version of a provider API key with a lifecycle state."""

    STATE_ACTIVE = "active"
    STATE_PENDING = "pending"
    STATE_DISABLED = "disabled"
    STATE_DELETED = "deleted"
    STATE_EXPIRED = "expired"
    STATE_CHOICES = [
        (STATE_ACTIVE, "Active"),
        (STATE_PENDING, "Pending"),
        (STATE_DISABLED, "Disabled"),
        (STATE_DELETED, "Deleted"),
        (STATE_EXPIRED, "Expired"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    credential = models.ForeignKey(
        ProviderCredential, on_delete=models.CASCADE, related_name="versions"
    )
    version = models.PositiveIntegerField()
    # AES-256-GCM: 12-byte nonce prepended to ciphertext
    encrypted_key = models.BinaryField()
    state = models.CharField(
        max_length=16, choices=STATE_CHOICES, default=STATE_PENDING, db_index=True
    )
    # [{operation: "generate_text"|"transcribe_audio", model: "gpt-4o-mini"}]
    permitted_targets = models.JSONField(default=list)
    activated_at = models.DateTimeField(null=True, blank=True)
    disabled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "credential_versions"
        constraints = [
            models.UniqueConstraint(
                fields=["credential", "version"], name="unique_credential_version"
            )
        ]
        ordering = ["-version"]

    def __str__(self) -> str:
        return f"{self.credential} v{self.version} [{self.state}]"


class TokenReplayGuard(models.Model):
    """
    Records used JTIs so each credential token can fetch a key exactly once.
    Expired entries can be purged safely; the token's short lifetime bounds the
    window that must be tracked.
    """

    jti = models.CharField(max_length=128)
    kind = models.CharField(max_length=16)  # "invoke" or "validate"
    expires_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "token_replay_guard"
        constraints = [
            models.UniqueConstraint(fields=["jti", "kind"], name="unique_jti_kind")
        ]


class CredentialValidation(models.Model):
    """Validation result returned by the multimodal service for a key version."""

    STATUS_VALID = "valid"
    STATUS_REJECTED = "rejected"
    STATUS_INDETERMINATE = "indeterminate"
    STATUS_CHOICES = [
        (STATUS_VALID, "Valid"),
        (STATUS_REJECTED, "Rejected"),
        (STATUS_INDETERMINATE, "Indeterminate"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    credential_version = models.ForeignKey(
        CredentialVersion, on_delete=models.CASCADE, related_name="validations"
    )
    status = models.CharField(max_length=16, choices=STATUS_CHOICES)
    reason_code = models.CharField(max_length=64, blank=True, default="")
    checked_at = models.DateTimeField()
    provider_request_id = models.CharField(max_length=255, blank=True, default="")
    request_id = models.CharField(max_length=128, blank=True, default="")
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "credential_validations"
        ordering = ["-created_at"]

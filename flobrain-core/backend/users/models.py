import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone


class Role(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "roles"

    def __str__(self) -> str:
        return str(self.name)


class User(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    username = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(unique=True, db_index=True)
    password_hash = models.TextField()
    provider = models.CharField(max_length=50, blank=True, null=True)
    provider_id = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    last_active = models.DateTimeField(blank=True, null=True)
    roles = models.ManyToManyField(
        Role, related_name="users", blank=True, through="UserRole"
    )

    class Meta:
        db_table = "users"
        indexes = [models.Index(fields=["email"])]

    def __str__(self) -> str:
        return str(self.email)


class UserRole(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, to_field="id", db_column="user_id"
    )
    role = models.ForeignKey(
        Role, on_delete=models.CASCADE, to_field="id", db_column="role_id"
    )

    class Meta:
        db_table = "user_roles"
        unique_together = [["user", "role"]]


# --- Sessions & auth ---


class Session(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sessions", db_column="user_id"
    )
    title = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)  # type: ignore[assignment]
    share_token = models.TextField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sessions"

    def __str__(self) -> str:
        return str(self.title) if self.title else str(self.id)


class RefreshToken(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="refresh_tokens", db_column="user_id"
    )
    token_hash = models.TextField(unique=True, db_index=True)
    device_info = models.TextField(blank=True, null=True)
    issued_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    last_used_at = models.DateTimeField(blank=True, null=True)
    revoked = models.BooleanField(default=False)  # type: ignore[assignment]

    class Meta:
        db_table = "refresh_tokens"


class GuestDeviceMap(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    session = models.ForeignKey(
        Session, on_delete=models.CASCADE, related_name="guest_devices", db_column="session_id"
    )
    device_id = models.TextField(unique=True, db_index=True)
    last_accessed_at = models.DateTimeField(blank=True, null=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = "guest_device_map"


# --- Billing & payments ---


class CustomerBilling(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="billing", db_column="user_id"
    )
    billing_email = models.EmailField(blank=True, null=True)
    plan = models.CharField(max_length=100, blank=True, null=True)
    renewal_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = "customer_billing"


class PaymentHistory(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="payment_history", db_column="user_id"
    )
    amount = models.DecimalField(
        max_digits=14, decimal_places=2, default=Decimal("0.00")
    )
    currency = models.CharField(max_length=10, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    provider_transaction_id = models.TextField(blank=True, null=True, db_index=True)

    class Meta:
        db_table = "payment_history"


# --- Preferences ---


class PresetPreferences(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    settings = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "preset_preferences"

    def __str__(self) -> str:
        return str(self.name) if self.name else str(self.id)


class UserPreferences(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="preferences", db_column="user_id"
    )
    preset = models.ForeignKey(
        PresetPreferences,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_preferences",
        db_column="preset_id",
    )
    overrides = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "user_preferences"


# --- Groups ---


class Group(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        db_column="parent_id",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    members = models.ManyToManyField(
        User, through="UserGroup", related_name="groups", blank=True
    )

    class Meta:
        db_table = "groups"

    def __str__(self) -> str:
        return str(self.name)


class UserGroup(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, to_field="id", db_column="user_id"
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, to_field="id", db_column="group_id"
    )

    class Meta:
        db_table = "user_groups"
        unique_together = [["user", "group"]]


class GroupBilling(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="billing", db_column="group_id"
    )
    billing_email = models.EmailField(blank=True, null=True)
    plan = models.CharField(max_length=100, blank=True, null=True)
    renewal_date = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "group_billing"


class GroupPaymentHistory(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name="payment_history",
        db_column="group_id",
    )
    amount = models.DecimalField(
        max_digits=14, decimal_places=2, default=Decimal("0.00")
    )
    currency = models.CharField(max_length=10, blank=True, null=True)
    status = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    provider_transaction_id = models.TextField(blank=True, null=True, db_index=True)

    class Meta:
        db_table = "group_payment_history"


class GroupPreferences(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="preferences", db_column="group_id"
    )
    preset = models.ForeignKey(
        PresetPreferences,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="group_preferences",
        db_column="preset_id",
    )
    overrides = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "group_preferences"



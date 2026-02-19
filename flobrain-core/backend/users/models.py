import uuid
from django.db import models
from django.utils import timezone


class Role(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.TextField(
        blank=True,
        null=True
    )

    class Meta:
        db_table = "roles"

    def __str__(self):
        return self.name



class User(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    username = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    email = models.EmailField(
        unique=True,
        db_index=True
    )

    password_hash = models.TextField()

    provider = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    provider_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        default=timezone.now
    )

    last_active = models.DateTimeField(
        blank=True,
        null=True
    )

    roles = models.ManyToManyField(Role, related_name="users", blank=True)

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"]),
        ]

    def __str__(self):
        return self.email



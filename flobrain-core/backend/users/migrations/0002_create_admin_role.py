"""
Seeds the "admin" Role row that users.permissions.IsAdmin checks for.

There is no role-assignment API or UI (by design - roles are assigned via
Django Admin's UserRole list, see users/admin.py). This migration only
guarantees the Role itself exists with a stable, predictable name so an
operator can assign it to a user without first having to create it by hand.

get_or_create keeps this idempotent and safe to run against a database that
may already have an "admin" role (e.g. created manually before this
migration existed).
"""
from django.db import migrations


ADMIN_ROLE_NAME = "admin"
ADMIN_ROLE_DESCRIPTION = (
    "Full administrative access for backend-managed resources, e.g. "
    "creating, editing, and deleting Model Registry entries."
)


def create_admin_role(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    Role.objects.get_or_create(
        name=ADMIN_ROLE_NAME,
        defaults={"description": ADMIN_ROLE_DESCRIPTION},
    )


def remove_admin_role(apps, schema_editor):
    """Best-effort reverse: only removes the row this migration would have
    created. If any UserRole rows still reference it, those rows cascade-
    delete along with it (same as deleting any Role via the admin would do).
    Does nothing (no error) if the row was already removed or never existed.
    """
    Role = apps.get_model("users", "Role")
    Role.objects.filter(name=ADMIN_ROLE_NAME).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_admin_role, remove_admin_role),
    ]

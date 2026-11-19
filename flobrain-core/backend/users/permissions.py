"""
Reusable DRF permission classes built on the existing custom JWT auth flow.

This project does not use Django's built-in User/auth/permission system or
DRF's authentication classes for request authentication (see users/views.py:
get_user_from_request, users/jwt_utils.py). This module intentionally reuses
that exact helper rather than introducing a parallel auth mechanism, so these
permission classes behave identically to every other view's manual Bearer
token handling - they just let APIViews opt into role checks via DRF's
standard `permission_classes` / `get_permissions()` mechanism.

Role membership is read through the existing users.models.UserRole join table
(User <-through-> Role), never through Django's groups/permissions.
"""
from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.permissions import BasePermission

from .views import get_user_from_request


class HasRole(BasePermission):
    """Allows the request only if the Bearer-authenticated user has the role
    named by `required_role` (set on the permission instance or, as a
    fallback, as a `required_role` attribute on the view).

    - No/invalid/expired Bearer token -> raises NotAuthenticated (401).
    - Valid token but the user lacks the role -> raises PermissionDenied (403).
    - A view with no role configured anywhere is treated as misconfigured and
      denies access (403) rather than silently allowing everyone through.

    Resolving the user here (rather than relying on DRF's `request.user`)
    matters: this app's DEFAULT_AUTHENTICATION_CLASSES are configured but not
    actually used by any view, so `request.user` would be AnonymousUser and
    `request.successful_authenticator` would never be set. Raising the
    exceptions explicitly, instead of just returning True/False, is what
    keeps the 401-vs-403 distinction correct despite that.
    """

    required_role: str = ""

    def has_permission(self, request, view) -> bool:
        user = get_user_from_request(request)
        if not user:
            raise NotAuthenticated("Authentication required")

        role_name = self.required_role or getattr(view, "required_role", "")
        if not role_name:
            raise PermissionDenied("This view has no role configured")

        if not user.roles.filter(name=role_name).exists():
            raise PermissionDenied(
                f"The '{role_name}' role is required for this action"
            )

        # Views that already call get_user_from_request() again in their
        # method body do an extra (cheap) lookup; stashing the resolved user
        # here lets a view skip that re-lookup if it chooses to.
        request.flobrain_user = user
        return True


class IsAdmin(HasRole):
    """Shortcut for the one role this app currently defines a permission
    for: `required_role = "admin"` (see users/migrations/0002_create_admin_role.py).
    """

    required_role = "admin"

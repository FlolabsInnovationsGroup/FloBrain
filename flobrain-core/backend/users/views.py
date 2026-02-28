import logging
from typing import cast, Optional

from django.conf import settings
from django.db import DatabaseError, IntegrityError
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .jwt_utils import decode_token, make_access_token, make_refresh_token
from .models import User
from .serializers import ChangePasswordSerializer, LoginSerializer, ProfileSerializer, RegisterSerializer

logger = logging.getLogger(__name__)
_UserManager = getattr(User, "objects")


def home(request):
    return JsonResponse({"message": "Welcome to the users home page!"})


# --- Auth API (moved from root api app); uses users.models.User ---

class RegisterView(APIView):
    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = cast(User, serializer.save())
                return Response(
                    {
                        "access_token": make_access_token(str(user.id)),
                        "refresh_token": make_refresh_token(str(user.id)),
                        "userId": str(user.id),
                    },
                    status=status.HTTP_201_CREATED,
                )
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except IntegrityError:
            return Response(
                {"error": "User already exists", "details": "Email is already registered"},
                status=status.HTTP_409_CONFLICT,
            )
        except DatabaseError as e:
            return Response(
                {"error": "Database error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception:
            return Response(
                {"error": "Internal server error", "details": "Registration failed"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginView(APIView):
    def post(self, request):
        try:
            data = request.data if request.data is not None else {}
            serializer = LoginSerializer(data=data)
            if serializer.is_valid():
                validated = serializer.validated_data
                assert validated is not None
                user = cast(User, validated["user"])  # type: ignore[reportIndexIssue]
                return Response(
                    {
                        "access_token": make_access_token(str(user.id)),
                        "refresh_token": make_refresh_token(str(user.id)),
                        "userId": str(user.id),
                    },
                )
            return Response(
                {"error": "Invalid credentials", "details": serializer.errors},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except Exception as e:
            logger.exception("Login failed")
            details = str(e) if getattr(settings, "DEBUG", False) else "Authentication service unavailable"
            return Response(
                {"error": "Login failed", "details": details},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LogoutView(APIView):
    def post(self, request):
        try:
            user_id = request.data.get("userId")
            if not user_id:
                return Response(
                    {"error": "userId is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response({"message": "Logged out successfully"})
        except Exception:
            return Response(
                {"error": "Logout failed", "details": "Please clear browser data"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RefreshView(APIView):
    def post(self, request):
        try:
            refresh = request.data.get("refresh")
            if not refresh:
                return Response(
                    {"error": "refresh token is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            payload = decode_token(refresh)
            if not payload or payload.get("type") != "refresh":
                return Response(
                    {"error": "Invalid or expired refresh token"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            user_id = payload.get("sub")
            if not user_id:
                return Response(
                    {"error": "Invalid token"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            if not getattr(User, "objects").filter(id=user_id).exists():
                return Response(
                    {"error": "User not found"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            return Response({"access": make_access_token(user_id)})
        except Exception:
            return Response(
                {"error": "Refresh failed", "details": "Invalid or expired token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


def get_user_from_request(request) -> Optional[User]:
    """Extract User from Authorization: Bearer <access_token>. Returns None if invalid/missing."""
    auth = request.META.get("HTTP_AUTHORIZATION") or ""
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:].strip()
    if not token:
        return None
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    try:
        return _UserManager.get(id=user_id)
    except (User.DoesNotExist, AttributeError):
        return None


class ProfileView(APIView):
    """GET: return current user profile. PATCH: update fullName and email. Requires Bearer token."""

    def get(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required", "details": "Valid Bearer token required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response({
            "id": str(user.id),
            "fullName": getattr(user, "username", None) or user.email or "",
            "email": user.email,
        })

    def patch(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required", "details": "Valid Bearer token required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        # Normalize fullName -> username for serializer
        payload = dict(request.data) if request.data else {}
        if "fullName" in payload and "username" not in payload:
            payload["username"] = payload["fullName"]
        serializer = ProfileSerializer(
            instance=user,
            data=payload,
            partial=True,
            context={"user": user},
        )
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        return Response({
            "id": str(user.id),
            "fullName": getattr(user, "username", None) or user.email,
            "email": user.email,
        })


class ChangePasswordView(APIView):
    """POST: change password. Body: current_password, new_password. Requires Bearer token."""

    def post(self, request):
        user = get_user_from_request(request)
        if not user:
            return Response(
                {"error": "Authentication required", "details": "Valid Bearer token required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        serializer = ChangePasswordSerializer(
            data=request.data or {},
            context={"user": user},
        )
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        return Response({"message": "Password updated successfully"})
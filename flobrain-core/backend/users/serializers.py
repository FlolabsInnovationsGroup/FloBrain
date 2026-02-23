"""
Auth serializers for register/login using users.models.User.
"""
from django.contrib.auth.hashers import make_password, check_password
from rest_framework import serializers

from .models import User

# Django Model adds .objects and .DoesNotExist at runtime; type checker needs a hint
_UserManager = getattr(User, "objects")
_DoesNotExist = getattr(User, "DoesNotExist", Exception)


class RegisterSerializer(serializers.Serializer):
    """Accepts name, email, password. Phone optional (stored in username or ignored)."""
    name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8, required=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if _UserManager.filter(email=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value

    def create(self, validated_data):
        user = _UserManager.create(
            username=validated_data.get("name") or validated_data["email"],
            email=validated_data["email"],
            password_hash=make_password(validated_data["password"]),
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            user = _UserManager.get(email=attrs["email"])
        except _DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")
        if not check_password(attrs["password"], user.password_hash):
            raise serializers.ValidationError("Invalid credentials")
        attrs["user"] = user
        return attrs

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User


class RegisterSerializer(serializers.Serializer):
    """Accepts name, email, password. Phone optional (not stored on User yet)."""
    name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=8, required=True)
    phone = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        # Django create_user hashes password
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            first_name=validated_data["name"],
            password=validated_data["password"],
        )
        # phone could be stored on a profile model later
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        user = authenticate(
            username=attrs['email'], 
            password=attrs['password']
        )
        if user and user.is_active:
            attrs['user'] = user
            return attrs
        raise serializers.ValidationError("Invalid credentials")

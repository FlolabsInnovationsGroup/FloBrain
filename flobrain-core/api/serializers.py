from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('name', 'email', 'phone', 'password', 'id')
        extra_kwargs = {'name': {'required': True}}

    def create(self, validated_data):
        # Django auto-hashes password
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['name']
        )
        # Store phone in profile or custom field later
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

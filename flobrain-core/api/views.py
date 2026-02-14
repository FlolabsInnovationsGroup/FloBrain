from django.http import JsonResponse


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import authenticate
from django.db import IntegrityError, DatabaseError
from .serializers import RegisterSerializer, LoginSerializer


def health_check(request):
    return JsonResponse({"status": "ok"}, status=200)


# AUTH APIS
class RegisterView(APIView):
    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'userId': str(user.id)
                }, status=status.HTTP_201_CREATED)
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except IntegrityError:
            return Response({
                'error': 'User already exists',
                'details': 'Email is already registered'
            }, status=status.HTTP_409_CONFLICT)
        except DatabaseError as e:
            return Response({
                'error': 'Database error',
                'details': str(e)
            }, status=500)
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'details': 'Registration failed'
            }, status=500)

class LoginView(APIView):
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'userId': str(user.id)
                })
            return Response({
                'error': 'Invalid credentials',
                'details': serializer.errors
            }, status=status.HTTP_401_UNAUTHORIZED)
            
        except Exception as e:
            return Response({
                'error': 'Login failed',
                'details': 'Authentication service unavailable'
            }, status=500)

class LogoutView(APIView):
    def post(self, request):
        try:
            user_id = request.data.get('userId')
            refresh_token = request.data.get('refresh_token')
            
            if not user_id:
                return Response({
                    'error': 'userId is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Blacklist refresh token (prevents reuse)
            if refresh_token:
                try:
                    RefreshToken(refresh_token).blacklist()
                except TokenError:
                    pass  # Already invalid/expired
            
            return Response({
                'message': 'Logged out successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': 'Logout failed',
                'details': 'Please clear browser data'
            }, status=500)

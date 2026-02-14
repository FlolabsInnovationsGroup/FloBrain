from django.urls import path
from .views import RegisterView, LoginView, LogoutView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/signin/', LoginView.as_view(), name='signin'),
    path('auth/signout/', LogoutView.as_view(), name='signout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
]

from django.urls import path
from .views import (
    RefreshView,
    LoginView,
    LogoutView,
    RegisterView,
    home,
)

urlpatterns = [
    path("", home, name="home"),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/signin/", LoginView.as_view(), name="signin"),
    path("api/auth/signout/", LogoutView.as_view(), name="signout"),
    path("api/auth/refresh/", RefreshView.as_view(), name="refresh"),
]
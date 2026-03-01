from django.urls import path
from .views import (
    ChangePasswordView,
    ProfileView,
    RefreshView,
    LoginView,
    LogoutView,
    RegisterView,
    home,
    UserPreferencesListCreateView,
    PresetPreferencesListView,
)

urlpatterns = [
    path("", home, name="home"),
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/signin/", LoginView.as_view(), name="signin"),
    path("api/auth/signout/", LogoutView.as_view(), name="signout"),
    path("api/auth/refresh/", RefreshView.as_view(), name="refresh"),
    path("api/profile/", ProfileView.as_view(), name="profile"),
    path("api/profile/change-password/", ChangePasswordView.as_view(), name="change_password"),
    path("api/settings/preferences/", UserPreferencesListCreateView.as_view(), name="user-preferences"),
    path("api/settings/preferences/<uuid:pk>/", UserPreferencesListCreateView.as_view(), name="user-preference-detail"),
    path("api/settings/presets/", PresetPreferencesListView.as_view(), name="preset-preferences"),
]

# devices/urls.py
from django.urls import path
from .views import DeviceHeartbeatView

urlpatterns = [
    path("heartbeat/", DeviceHeartbeatView.as_view()),
]
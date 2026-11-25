
from django.urls import path

from .consumers import ChatRoomConsumer


websocket_urlpatterns = [
    path(
        "ws/chat/<int:room_id>/",
        ChatRoomConsumer.as_asgi(),
        name="chat-room-websocket",
    ),
]


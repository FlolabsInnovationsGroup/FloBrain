from django.urls import path

from .views import ChatDetailView, ChatListView, SendMessageView

urlpatterns = [
    path("api/brain/chats/", ChatListView.as_view(), name="brain_chat_list"),
    path("api/brain/chats/<int:chat_id>/", ChatDetailView.as_view(), name="brain_chat_detail"),
    path("api/brain/chats/<int:chat_id>/send/", SendMessageView.as_view(), name="brain_send_message"),
]

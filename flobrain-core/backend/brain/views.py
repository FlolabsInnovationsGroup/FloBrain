from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from users.views import get_user_from_request

from .models import Chat, Message
from .serializers import (
    ChatCreateSerializer,
    ChatDetailSerializer,
    ChatListSerializer,
    ChatUpdateSerializer,
    SendMessageSerializer,
)


def _get_user_or_401(request):
    user = get_user_from_request(request)
    if not user:
        return None, Response(
            {"error": "Authentication required", "details": "Valid Bearer token required"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return user, None


class ChatListView(APIView):
    """GET list chats, POST create chat."""

    def get(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err
        chats = Chat.objects.filter(user=user).order_by("-updated_at")
        serializer = ChatListSerializer(chats, many=True)
        return Response(serializer.data)

    def post(self, request):
        user, err = _get_user_or_401(request)
        if err:
            return err
        serializer = ChatCreateSerializer(
            data=request.data or {},
            context={"request": request, "user": user},
        )
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        chat = serializer.save()
        # Return full detail so frontend can open the new chat with messages
        detail = ChatDetailSerializer(chat)
        return Response(detail.data, status=status.HTTP_201_CREATED)


class ChatDetailView(APIView):
    """GET, PATCH, DELETE a single chat."""

    def _get_chat(self, request, chat_id):
        user, err = _get_user_or_401(request)
        if err:
            return None, err
        try:
            chat = Chat.objects.get(pk=chat_id, user=user)
            return chat, None
        except Chat.DoesNotExist:
            return None, Response(
                {"error": "Not found", "details": "Chat not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

    def get(self, request, chat_id):
        chat, err = self._get_chat(request, chat_id)
        if err:
            return err
        serializer = ChatDetailSerializer(chat)
        return Response(serializer.data)

    def patch(self, request, chat_id):
        chat, err = self._get_chat(request, chat_id)
        if err:
            return err
        serializer = ChatUpdateSerializer(chat, data=request.data or {}, partial=True)
        if not serializer.is_valid():
            return Response(
                {"error": "Validation failed", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        return Response(ChatDetailSerializer(chat).data)

    def delete(self, request, chat_id):
        chat, err = self._get_chat(request, chat_id)
        if err:
            return err
        chat.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SendMessageView(APIView):
    """POST send a user message and return assistant reply (append both to chat)."""

    def post(self, request, chat_id):
        user, err = _get_user_or_401(request)
        if err:
            return err
        try:
            chat = Chat.objects.get(pk=chat_id, user=user)
        except Chat.DoesNotExist:
            return Response(
                {"error": "Not found", "details": "Chat not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        ser = SendMessageSerializer(data=request.data or {})
        if not ser.is_valid():
            return Response(
                {"error": "Validation failed", "details": ser.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        text = (ser.validated_data.get("text") or "").strip()
        image = ser.validated_data.get("image") or ""

        if not text and not image:
            return Response(
                {"error": "Validation failed", "details": "text or image required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create user message
        user_msg = Message.objects.create(
            chat=chat,
            role=Message.ROLE_USER,
            text=text or None,
            image=image or None,
        )

        # Update chat title if still default
        if chat.title == "New Chat" and text:
            chat.title = (text[:30] + "..." if len(text) > 30 else text)
            chat.save(update_fields=["title", "updated_at"])

        # Placeholder assistant reply (replace with real LLM call later)
        assistant_text = (
            f'I received your message: "{text[:100]}". '
            "This is a placeholder response. Connect an LLM for real replies."
        )
        assistant_msg = Message.objects.create(
            chat=chat,
            role=Message.ROLE_ASSISTANT,
            text=assistant_text,
        )

        # Bump chat.updated_at so "last used" order is correct
        chat.save(update_fields=["updated_at"])

        # Return full chat with messages so frontend can sync
        serializer = ChatDetailSerializer(chat)
        return Response(serializer.data, status=status.HTTP_200_OK)

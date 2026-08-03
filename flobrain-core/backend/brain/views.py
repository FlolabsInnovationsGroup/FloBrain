from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from usage.models import TokenUsageRecord
from usage.services.quota import QuotaEnforcer
from usage.services.recorder import TokenUsageData, UsageRecorder

from users.views import get_user_from_request

from .llm import get_llm_adapter
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


def _build_llm_messages(chat: Chat) -> list[dict[str, str]]:
    messages: list[dict[str, str]] = [
        {"role": "system", "content": "You are FloBrain, a helpful AI assistant."},
    ]
    for msg in chat.messages.order_by("created_at"):
        if msg.role == Message.ROLE_USER and msg.text:
            messages.append({"role": "user", "content": msg.text})
        elif msg.role == Message.ROLE_ASSISTANT and msg.text:
            messages.append({"role": "assistant", "content": msg.text})
    return messages


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
        model = (ser.validated_data.get("model") or "").strip() or None

        if not text and not image:
            return Response(
                {"error": "Validation failed", "details": "text or image required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        quota_result = QuotaEnforcer().check(user)
        if not quota_result.allowed:
            return Response(
                {
                    "error": "Quota exceeded",
                    "details": quota_result.reason,
                    "quota": {
                        "plan": quota_result.plan,
                        "used_tokens": quota_result.used_tokens,
                        "limit_tokens": quota_result.limit_tokens,
                        "used_requests": quota_result.used_requests,
                        "limit_requests": quota_result.limit_requests,
                        "reset_at": quota_result.reset_at.isoformat(),
                        "upgrade_url": "/pricing",
                    },
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        user_msg = Message.objects.create(
            chat=chat,
            role=Message.ROLE_USER,
            text=text or None,
            image=image or None,
        )

        if chat.title == "New Chat" and text:
            chat.title = (text[:30] + "..." if len(text) > 30 else text)
            chat.save(update_fields=["title", "updated_at"])

        llm_messages = _build_llm_messages(chat)
        llm_result = get_llm_adapter().generate(llm_messages, model=model)

        assistant_msg = Message.objects.create(
            chat=chat,
            role=Message.ROLE_ASSISTANT,
            text=llm_result.generated_response,
        )

        UsageRecorder().record(
            user,
            TokenUsageData(
                provider=TokenUsageRecord.PROVIDER_MULTIMODAL,
                model=llm_result.model,
                request_type=TokenUsageRecord.REQUEST_CHAT,
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                chat_id=chat.pk,
                message_id=assistant_msg.pk,
            ),
        )

        chat.save(update_fields=["updated_at"])

        usage_payload = {
            "model": llm_result.model,
            "file_type": llm_result.file_type,
        }

        serializer = ChatDetailSerializer(chat, context={"usage": usage_payload})
        response = Response(serializer.data, status=status.HTTP_200_OK)

        if quota_result.warning_percent is not None:
            response["X-Usage-Warning"] = str(quota_result.warning_percent)

        return response

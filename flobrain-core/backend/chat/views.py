from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from users.views import get_user_from_request

from .models import ChatRoom
from .serializers import (
    ChatRoomListSerializer,
    ChatRoomDetailSerializer,
    ChatRoomCreateSerializer,
    MessageSerializer,
)


def _get_user_or_401(request):
    """
    Get the authenticated user from the Bearer token.
    Return a 401 response if authentication fails.
    """
    user = get_user_from_request(request)

    if not user:
        return None, Response(
            {
                "error": "Authentication required",
                "details": "Valid Bearer token required",
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return user, None


class ChatRoomListView(APIView):
    """
    GET: List all chat rooms belonging to the authenticated user.
    POST: Create a new chat room.
    """

    def get(self, request):
        user, error_response = _get_user_or_401(request)

        if error_response:
            return error_response

        rooms = (
            ChatRoom.objects
            .filter(members=user)
            .prefetch_related("room_members", "messages")
            .order_by("-updated_at")
        )

        serializer = ChatRoomListSerializer(rooms, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user, error_response = _get_user_or_401(request)

        if error_response:
            return error_response

        serializer = ChatRoomCreateSerializer(
            data=request.data or {},
            context={
                "request": request,
                "user": user,
            },
        )

        if not serializer.is_valid():
            return Response(
                {
                    "error": "Validation failed",
                    "details": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        room = serializer.save()

        return Response(
            ChatRoomDetailSerializer(room).data,
            status=status.HTTP_201_CREATED,
        )


class ChatRoomDetailView(APIView):
    """
    GET: Retrieve details of a specific chat room.
    """

    def get(self, request, room_id):
        user, error_response = _get_user_or_401(request)

        if error_response:
            return error_response

        try:
            room = (
                ChatRoom.objects
                .prefetch_related("room_members__user")
                .get(
                    pk=room_id,
                    members=user,
                )
            )

        except ChatRoom.DoesNotExist:
            return Response(
                {
                    "error": "Not found",
                    "details": "Chat room not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ChatRoomDetailSerializer(room)

        return Response(serializer.data, status=status.HTTP_200_OK)


class ChatRoomMessagesView(APIView):
    """
    GET: Retrieve all messages belonging to a specific chat room.
    """

    def get(self, request, room_id):
        user, error_response = _get_user_or_401(request)

        if error_response:
            return error_response

        try:
            room = ChatRoom.objects.get(
                pk=room_id,
                members=user,
            )

        except ChatRoom.DoesNotExist:
            return Response(
                {
                    "error": "Not found",
                    "details": "Chat room not found",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        messages = (
            room.messages
            .select_related("sender")
            .order_by("created_at")
        )

        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


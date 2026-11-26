
import logging
import re
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from users.jwt_utils import decode_token
from users.models import User

from .models import ChatRoom, Message
from .tasks import generate_flobrain_response


logger = logging.getLogger(__name__)


class ChatRoomConsumer(AsyncJsonWebsocketConsumer):
    """
    Handles real-time messaging inside a chat room.

    Authentication:
        Uses the existing FloBrain JWT access token.

    WebSocket URL:
        /ws/chat/<room_id>/?token=<access_token>
    """

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_room_{self.room_id}"

        # Read the JWT access token from the query string.
        query_string = self.scope["query_string"].decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        if not token:
            await self.close(code=4401)
            return

        # Validate the existing FloBrain JWT.
        payload = decode_token(token)

        if not payload or payload.get("type") != "access":
            await self.close(code=4401)
            return

        user_id = payload.get("sub")

        if not user_id:
            await self.close(code=4401)
            return

        # Verify that the user exists and belongs to this room.
        user = await self.get_room_member(user_id)

        if not user:
            await self.close(code=4403)
            return

        self.user_id = str(user.id)

        # Join the Redis channel group.
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the Redis channel group.
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name,
            )

    async def receive_json(self, content, **kwargs):
        """
        Receive a message from a connected user,
        save it to the database, and broadcast it.
        """

        if not isinstance(content, dict):
            await self.send_json({
                "error": "Invalid message format",
            })
            return

        message_content = content.get("content")

        if not isinstance(message_content, str):
            await self.send_json({
                "error": "Message content must be a string",
            })
            return

        message_content = message_content.strip()

        if not message_content:
            await self.send_json({
                "error": "Message content cannot be empty",
            })
            return

        # Save the message in PostgreSQL.
        message_data = await self.create_message(
            self.room_id,
            self.user_id,
            message_content,
        )

        # Broadcast the message to everyone in this room.
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "message": message_data,
            },
        )

        # Trigger FloBrain when explicitly mentioned.
        if re.search(
            r"(?<!\w)@flobrain\b",
            message_content,
            re.IGNORECASE,
        ):
            try:
                generate_flobrain_response.delay(
                    self.room_id,
                    self.user_id,
                )
            except Exception:
                logger.exception(
                    "Failed to queue FloBrain response for room %s",
                    self.room_id,
                )

                await self.send_json({
                    "error": "FloBrain could not be reached right now.",
                })

    async def chat_message(self, event):
        """
        Send a broadcast message to the WebSocket client.
        """

        await self.send_json(event["message"])

    @database_sync_to_async
    def get_room_member(self, user_id):
        """
        Check whether the user exists and is a member of the room.
        """

        try:
            user = User.objects.get(id=user_id)

            is_member = ChatRoom.objects.filter(
                pk=self.room_id,
                members=user,
            ).exists()

            if is_member:
                return user

            return None

        except (User.DoesNotExist, ValueError, TypeError):
            return None

    @database_sync_to_async
    def create_message(self, room_id, user_id, content):
        """
        Save a user message and return JSON-serializable message data.
        """

        user = User.objects.get(id=user_id)

        message = Message.objects.create(
            room_id=room_id,
            sender=user,
            sender_type=Message.SENDER_USER,
            content=content,
        )

        sender_name = (
            getattr(user, "full_name", None)
            or user.username
            or user.email
        )

        return {
            "id": message.id,
            "sender_id": str(user.id),
            "sender_name": sender_name,
            "sender_type": message.sender_type,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
        }

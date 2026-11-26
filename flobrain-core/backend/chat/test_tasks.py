
from unittest.mock import patch, Mock

from django.test import TestCase

from brain.llm.base import LLMResult
from users.models import User

from .models import ChatRoom, ChatRoomMember, Message
from .tasks import (
    BOT_EMAIL,
    generate_flobrain_response,
)


class FloBrainTaskTestCase(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            username="Alice",
            email="alice@example.test",
            password_hash="unused",
        )

        self.room = ChatRoom.objects.create(
            title="AI Test Room",
            created_by=self.user,
        )

        ChatRoomMember.objects.create(
            room=self.room,
            user=self.user,
            role=ChatRoomMember.ROLE_ADMIN,
        )

    @patch("chat.tasks.async_to_sync")
    @patch("chat.tasks.get_channel_layer")
    @patch("chat.tasks.get_llm_adapter")
    def test_generates_and_broadcasts_flobrain_response(
        self,
        mock_get_adapter,
        mock_get_channel_layer,
        mock_async_to_sync,
    ):
        # Mock the existing FloBrain AI adapter.
        mock_adapter = Mock()
        mock_adapter.generate.return_value = LLMResult(
            generated_response="Hello! I'm FloBrain.",
            model="test-model",
        )

        mock_get_adapter.return_value = mock_adapter

        # Mock the channel layer.
        mock_channel_layer = Mock()
        mock_get_channel_layer.return_value = mock_channel_layer

        mock_group_send = Mock()
        mock_async_to_sync.return_value = mock_group_send

        result = generate_flobrain_response.run(
            self.room.id,
            str(self.user.id),
        )

        # Check the task result.
        self.assertEqual(result["status"], "success")
        self.assertTrue(result["broadcasted"])

        # Check that the AI adapter was called.
        mock_adapter.generate.assert_called_once()

        # Check that the bot account was created.
        bot = User.objects.get(email=BOT_EMAIL)

        # Check that FloBrain was added to the room.
        self.assertTrue(
            ChatRoomMember.objects.filter(
                room=self.room,
                user=bot,
            ).exists()
        )

        # Check that the AI response was saved.
        bot_message = Message.objects.get(
            room=self.room,
            sender=bot,
            sender_type=Message.SENDER_BOT,
        )

        self.assertEqual(
            bot_message.content,
            "Hello! I'm FloBrain.",
        )

        # Check that the response was broadcast.
        mock_async_to_sync.assert_called_once_with(
            mock_channel_layer.group_send
        )

        mock_group_send.assert_called_once()

        broadcast_group, broadcast_event = (
            mock_group_send.call_args.args
        )

        self.assertEqual(
            broadcast_group,
            f"chat_room_{self.room.id}",
        )

        self.assertEqual(
            broadcast_event["message"]["content"],
            "Hello! I'm FloBrain.",
        )

    @patch("chat.tasks.get_llm_adapter")
    def test_skips_if_triggering_user_is_not_a_room_member(
        self,
        mock_get_adapter,
    ):
        # Remove the user's room membership.
        ChatRoomMember.objects.filter(
            room=self.room,
            user=self.user,
        ).delete()

        result = generate_flobrain_response.run(
            self.room.id,
            str(self.user.id),
        )

        self.assertEqual(result["status"], "skipped")
        self.assertEqual(
            result["reason"],
            "user_not_in_room",
        )

        # AI must not be called.
        mock_get_adapter.assert_not_called()

        # No bot message should be created.
        self.assertFalse(
            Message.objects.filter(
                room=self.room,
                sender_type=Message.SENDER_BOT,
            ).exists()
        )
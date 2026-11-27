
import logging

from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from django.contrib.auth.hashers import make_password
from django.db import transaction

from users.models import User
from brain.llm import get_llm_adapter

from .models import ChatRoom, ChatRoomMember, Message

logger = logging.getLogger(__name__)

BOT_EMAIL = "flobrain-bot@flobrain.internal"
BOT_NAME = "FloBrain"


def get_or_create_flobrain_bot():
    """Get the shared FloBrain bot account or create it once."""

    bot, _ = User.objects.get_or_create(
        email=BOT_EMAIL,
        defaults={
            "username": BOT_NAME,
            "password_hash": make_password(None),
            "provider": "system",
        },
    )

    return bot


@shared_task(
    name="chat.tasks.generate_flobrain_response",
    bind=True,
    max_retries=2,
    default_retry_delay=10,
)
def generate_flobrain_response(self, room_id, triggering_user_id):
    """
    Generate an AI response using the existing FloBrain AI service,
    save it as a bot message, and broadcast it to the chat room.
    """

    # Step 1: Verify the room and triggering user.
    with transaction.atomic():
        room = ChatRoom.objects.get(pk=room_id)
        triggering_user = User.objects.get(pk=triggering_user_id)

        # Ensure the triggering user is still a room member.
        if not ChatRoomMember.objects.filter(
            room=room,
            user=triggering_user,
        ).exists():
            logger.warning(
                "User %s is no longer a member of room %s.",
                triggering_user_id,
                room_id,
            )

            return {
                "status": "skipped",
                "reason": "user_not_in_room",
            }

        # Get or create the shared FloBrain bot account.
        bot = get_or_create_flobrain_bot()

        # Ensure FloBrain is a member of this room.
        ChatRoomMember.objects.get_or_create(
            room=room,
            user=bot,
            defaults={
                "role": ChatRoomMember.ROLE_MEMBER,
            },
        )

    # Step 2: Retrieve the latest 20 messages.
    recent_messages = list(
        Message.objects.filter(room=room)
        .select_related("sender")
        .order_by("-created_at", "-id")[:20]
    )

    recent_messages.reverse()

    # Step 3: Prepare the AI conversation history.
    messages = [
        {
            "role": "system",
            "content": (
                "You are FloBrain, the AI assistant in this chat room. "
                "Answer helpfully and naturally. Use the conversation "
                "history to understand the context."
            ),
        }
    ]

    for message in recent_messages:
        role = (
            "assistant"
            if message.sender_type == Message.SENDER_BOT
            else "user"
        )

        messages.append({
            "role": role,
            "content": message.content,
        })

    # Step 4: Call the existing FloBrain AI service.
    try:
        result = get_llm_adapter().generate(messages)

        response_text = (
            result.generated_response or ""
        ).strip()

        # Handle empty AI responses.
        if not response_text:
            raise ValueError(
                "FloBrain AI returned an empty response."
            )

        # The existing adapter returns some service errors as text.
        if response_text.lower().startswith(
            (
                "error:",
                "error from multimodal service:",
            )
        ):
            raise RuntimeError(response_text)

    except Exception as exc:
        logger.exception(
            "FloBrain AI generation failed for room %s.",
            room_id,
        )

        # Retry AI generation failures.
        raise self.retry(exc=exc)

    # Step 5: Save the successful AI response.
    bot_message = Message.objects.create(
        room=room,
        sender=bot,
        sender_type=Message.SENDER_BOT,
        content=response_text,
    )

    message_data = {
        "id": bot_message.id,
        "sender_id": str(bot.id),
        "sender_name": BOT_NAME,
        "sender_type": Message.SENDER_BOT,
        "content": bot_message.content,
        "created_at": bot_message.created_at.isoformat(),
    }

    # Step 6: Broadcast the response to all room members.
    broadcasted = False

    try:
        channel_layer = get_channel_layer()

        if channel_layer is None:
            raise RuntimeError(
                "Chat channel layer is not configured."
            )

        async_to_sync(channel_layer.group_send)(
            f"chat_room_{room_id}",
            {
                "type": "chat.message",
                "message": message_data,
            },
        )

        broadcasted = True

    except Exception:
        # The message is already saved.
        # Do not retry AI generation and create a duplicate message.
        logger.exception(
            "FloBrain response was saved, but broadcasting failed "
            "for room %s.",
            room_id,
        )

    logger.info(
        "FloBrain response generated for room %s, "
        "triggered by user %s.",
        room_id,
        triggering_user_id,
    )

    return {
        "room_id": room_id,
        "message_id": bot_message.id,
        "status": "success",
        "broadcasted": broadcasted,
    }
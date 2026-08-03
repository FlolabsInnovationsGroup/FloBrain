import logging

from elevenlabs.client import ElevenLabs

from app.core.config import settings

logger = logging.getLogger(__name__)

client = (
    ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
    if settings.ELEVENLABS_API_KEY
    else None
)


def synthesize_speech(text: str, voice_id="JBFqnCBsd6RMkjVDRZzb"):
    if not client:
        logger.error("ElevenLabs API key not configured.")
        return None

    try:
        audio = client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            output_format="mp3_44100_128",
        )
        return audio
    except Exception as e:  # noqa: BLE001
        logger.error("Speech synthesis failed: %s", e)
        return None

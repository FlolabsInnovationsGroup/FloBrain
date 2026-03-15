from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional: faster-whisper
# ---------------------------------------------------------------------------
try:
    from faster_whisper import WhisperModel  # type: ignore

    _FASTER_WHISPER_AVAILABLE = True
    logger.info("faster-whisper is available.")
except ImportError:
    _FASTER_WHISPER_AVAILABLE = False
    logger.warning(
        "faster-whisper not installed. Transcription endpoint will return errors."
    )


class TranscriptionError(Exception):
    """Raised when transcription fails or is not available."""
    pass


class TranscriptionService:
    """
    Wraps faster-whisper for local speech-to-text.
    Gracefully degrades to an error message when the library is not installed.
    """

    def __init__(
        self,
        model_size: str = "base",
        device: str = "cpu",
        compute_type: str = "int8",
    ) -> None:
        self._model: Any = None
        self._available = False

        if _FASTER_WHISPER_AVAILABLE:
            try:
                self._model = WhisperModel(model_size, device=device, compute_type=compute_type)
                self._available = True
                logger.info("Loaded Whisper model: size=%s device=%s", model_size, device)
            except Exception as exc:
                logger.warning("Failed to load Whisper model: %s", exc)

    @property
    def is_available(self) -> bool:
        return self._available

    async def transcribe(self, audio_file_path: str) -> dict[str, Any]:
        """
        Transcribe an audio file.

        Returns:
            {
                "text": str,
                "segments": list[dict],
                "language": str,
            }

        Raises:
            TranscriptionError if the service is unavailable or transcription fails.
        """
        if not self._available or self._model is None:
            raise TranscriptionError(
                "Transcription service is not available. "
                "Install faster-whisper: pip install faster-whisper"
            )

        try:
            segments_iter, info = self._model.transcribe(
                audio_file_path,
                beam_size=5,
                vad_filter=True,
            )

            segments: list[dict[str, Any]] = []
            full_text_parts: list[str] = []

            for seg in segments_iter:
                segments.append(
                    {
                        "start": round(seg.start, 3),
                        "end": round(seg.end, 3),
                        "text": seg.text.strip(),
                    }
                )
                full_text_parts.append(seg.text)

            return {
                "text": " ".join(full_text_parts).strip(),
                "segments": segments,
                "language": info.language,
            }
        except Exception as exc:
            raise TranscriptionError(f"Transcription failed: {exc}") from exc


# Module-level singleton (lazy model loading)
transcription_service = TranscriptionService()

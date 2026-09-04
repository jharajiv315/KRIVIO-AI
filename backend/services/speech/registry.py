from typing import Dict, Any
from backend.services.speech.base import SpeechProvider, SpeechProviderUnconfiguredError
from backend.services.speech.chirp import GoogleChirpSpeechProvider
from backend.services.speech.gemini_audio import GeminiAudioSpeechProvider
from backend.services.speech.types import TranscriptionResult, TranscriptionOptions

class SpeechService:
    """
    Coordinates primary Speech-to-Text provider (Google Cloud Speech V2 Chirp 2)
    and graceful fallback adapter.
    """
    def __init__(self):
        self.primary = GoogleChirpSpeechProvider()
        self.fallback = GeminiAudioSpeechProvider()

    @property
    def is_configured(self) -> bool:
        return self.primary.is_configured or self.fallback.is_configured

    def transcribe(
        self,
        audio_bytes: bytes,
        mime_type: str,
        options: TranscriptionOptions
    ) -> TranscriptionResult:
        # Try primary Chirp 2 provider first if configured
        if self.primary.is_configured:
            try:
                return self.primary.transcribe(audio_bytes, mime_type, options)
            except Exception as e:
                # If primary encounters a transient error, check fallback
                if self.fallback.is_configured:
                    return self.fallback.transcribe(audio_bytes, mime_type, options)
                raise e

        # If primary Chirp 2 is unconfigured, try fallback if available
        if self.fallback.is_configured:
            return self.fallback.transcribe(audio_bytes, mime_type, options)

        # If neither is configured, raise unconfigured error
        raise SpeechProviderUnconfiguredError("Google Cloud Speech Chirp 2")

    def get_diagnostics(self) -> Dict[str, Any]:
        return {
            "primary": self.primary.get_status().model_dump(),
            "fallback": self.fallback.get_status().model_dump(),
            "active_provider": (
                "chirp_2" if self.primary.is_configured else
                ("gemini_audio" if self.fallback.is_configured else "none")
            ),
            "is_configured": self.is_configured
        }

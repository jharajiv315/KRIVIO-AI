from abc import ABC, abstractmethod
from typing import Dict, Any, List
from backend.services.speech.types import TranscriptionResult, TranscriptionOptions, SpeechProviderStatus

class SpeechProviderError(Exception):
    def __init__(self, message: str, error_code: str = "SPEECH_PROVIDER_ERROR"):
        super().__init__(message)
        self.error_code = error_code

class SpeechProviderUnconfiguredError(SpeechProviderError):
    def __init__(self, provider_name: str):
        super().__init__(
            f"Speech provider '{provider_name}' is not configured. Credentials must be provided via environment variables.",
            error_code="PROVIDER_UNCONFIGURED"
        )

class SpeechProvider(ABC):
    """
    Abstract interface for Speech-to-Text providers.
    All providers (Chirp 2, fallback engines) implement this contract.
    """
    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        pass

    @property
    @abstractmethod
    def is_configured(self) -> bool:
        pass

    @property
    @abstractmethod
    def supported_languages(self) -> List[str]:
        pass

    @abstractmethod
    def transcribe(
        self,
        audio_bytes: bytes,
        mime_type: str,
        options: TranscriptionOptions
    ) -> TranscriptionResult:
        """
        Transcribes audio bytes into text.
        Must raise SpeechProviderUnconfiguredError if credentials are not configured.
        """
        pass

    def get_status(self) -> SpeechProviderStatus:
        return SpeechProviderStatus(
            provider_name=self.provider_name,
            is_configured=self.is_configured,
            status="configured" if self.is_configured else "unconfigured",
            supported_languages=self.supported_languages,
            model_name=self.model_name
        )

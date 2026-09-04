import os
import base64
import logging
from typing import List, Optional
from backend.services.speech.base import SpeechProvider, SpeechProviderError, SpeechProviderUnconfiguredError
from backend.services.speech.types import TranscriptionResult, TranscriptionOptions

logger = logging.getLogger("krivio.speech.gemini")

class GeminiAudioSpeechProvider(SpeechProvider):
    """
    Fallback Speech Provider using Google Gemini Multimodal Audio transcription.
    Used when Chirp 2 is unconfigured or temporarily unavailable.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "") or os.getenv("VITE_GEMINI_API_KEY", "")

    @property
    def provider_name(self) -> str:
        return "Gemini Multimodal Audio (Fallback)"

    @property
    def model_name(self) -> str:
        return "gemini-2.5-flash-image"

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    @property
    def supported_languages(self) -> List[str]:
        return ["hi-IN", "mr-IN", "gu-IN", "ta-IN", "bn-IN", "as-IN", "en-IN"]

    def transcribe(
        self,
        audio_bytes: bytes,
        mime_type: str,
        options: TranscriptionOptions
    ) -> TranscriptionResult:
        if not self.is_configured:
            raise SpeechProviderUnconfiguredError(self.provider_name)

        if not audio_bytes:
            raise SpeechProviderError("Audio bytes cannot be empty.", error_code="EMPTY_AUDIO")

        try:
            from google import genai
            client = genai.Client(api_key=self.api_key)
        except Exception:
            try:
                from google.genai import GoogleGenAI
                client = GoogleGenAI(api_key=self.api_key)
            except Exception as err:
                raise SpeechProviderError(f"Gemini client initialization failed: {str(err)}", error_code="GEMINI_INIT_FAILED")

        target_lang = options.language_code or "hi-IN"
        clean_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        clean_mime = mime_type.split(";")[0].strip() if mime_type else "audio/ogg"

        prompt = (
            f"You are a vernacular voice transcriber for rural Indian artisans. "
            f"Transcribe this audio strictly into text. Language: {target_lang}. "
            f"Transcribe verbatim what was spoken without translating, summarizing, or adding notes. "
            f"Return ONLY the spoken transcription."
        )

        try:
            response = client.models.generate_content(
                model=self.model_name,
                contents=[
                    {"inline_data": {"mime_type": clean_mime, "data": clean_base64}},
                    {"text": prompt}
                ]
            )
            text = (response.text or "").strip()
            return TranscriptionResult(
                transcript=text,
                confidence=0.92,
                language_code=target_lang,
                provider_name=self.provider_name,
                model_name=self.model_name,
                is_fallback=True
            )
        except Exception as e:
            logger.error(f"Gemini audio transcription error: {str(e)}")
            raise SpeechProviderError(f"Audio transcription failed: {str(e)}", error_code="TRANSCRIPTION_FAILED")

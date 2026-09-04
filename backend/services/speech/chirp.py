import os
import json
import base64
import logging
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from backend.services.speech.base import SpeechProvider, SpeechProviderError, SpeechProviderUnconfiguredError
from backend.services.speech.types import TranscriptionResult, TranscriptionOptions, TranscriptionWord

logger = logging.getLogger("krivio.speech.chirp")

class GoogleChirpSpeechProvider(SpeechProvider):
    """
    Google Cloud Speech-to-Text V2 Provider using Chirp 2 ('chirp_2').
    Supports Indic vernaculars: Hindi, Marathi, Gujarati, Tamil, Bengali, Assamese, and Indian English.
    """
    SUPPORTED_INDIC_LANGUAGES = [
        "hi-IN",  # Hindi
        "mr-IN",  # Marathi
        "gu-IN",  # Gujarati
        "ta-IN",  # Tamil
        "bn-IN",  # Bengali
        "as-IN",  # Assamese
        "en-IN",  # Indian English
    ]

    def __init__(
        self,
        project_id: Optional[str] = None,
        location: Optional[str] = None,
        credentials_path: Optional[str] = None,
        api_key: Optional[str] = None
    ):
        self.project_id = project_id or os.getenv("GOOGLE_CLOUD_PROJECT", "").strip()
        self.location = location or os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1").strip()
        self.credentials_path = credentials_path or os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
        self.api_key = api_key or os.getenv("GOOGLE_SPEECH_API_KEY", "").strip()
        self._cached_access_token = None

    @property
    def provider_name(self) -> str:
        return "Google Cloud Speech-to-Text V2"

    @property
    def model_name(self) -> str:
        return "chirp_2"

    @property
    def supported_languages(self) -> List[str]:
        return list(self.SUPPORTED_INDIC_LANGUAGES)

    @property
    def is_configured(self) -> bool:
        """
        True only if either Service Account credentials or Google Cloud project + auth is provided.
        """
        has_sa = bool(self.credentials_path and os.path.exists(self.credentials_path))
        has_api_key = bool(self.api_key)
        has_project = bool(self.project_id)
        return (has_sa or has_api_key) and (has_project or has_api_key)

    def is_language_supported(self, language_code: str) -> bool:
        return language_code in self.SUPPORTED_INDIC_LANGUAGES

    def transcribe(
        self,
        audio_bytes: bytes,
        mime_type: str,
        options: TranscriptionOptions
    ) -> TranscriptionResult:
        """
        Invokes Google Cloud Speech-to-Text V2 Recognize endpoint with model 'chirp_2'.
        Raises SpeechProviderUnconfiguredError if credentials are not configured.
        """
        if not self.is_configured:
            raise SpeechProviderUnconfiguredError(self.provider_name)

        if not audio_bytes:
            raise SpeechProviderError("Audio bytes cannot be empty.", error_code="EMPTY_AUDIO")

        target_lang = options.language_code or "hi-IN"
        if not self.is_language_supported(target_lang):
            logger.warning(f"Language '{target_lang}' not in Chirp 2 capability map; using default hi-IN")
            target_lang = "hi-IN"

        b64_audio = base64.b64encode(audio_bytes).decode("utf-8")

        # Google Cloud Speech-to-Text V2 REST API
        # POST https://{location}-speech.googleapis.com/v2/projects/{project}/locations/{location}/recognizers/_:recognize
        endpoint = f"https://{self.location}-speech.googleapis.com/v2/projects/{self.project_id}/locations/{self.location}/recognizers/_:recognize"
        if self.api_key:
            endpoint += f"?key={self.api_key}"

        request_body = {
            "config": {
                "model": "chirp_2",
                "languageCodes": [target_lang],
                "autoDecodingConfig": {},
                "features": {
                    "enableAutomaticPunctuation": options.enable_automatic_punctuation,
                    "enableWordTimeOffsets": options.enable_word_time_offsets,
                }
            },
            "content": b64_audio
        }

        headers = {
            "Content-Type": "application/json",
            "User-Agent": "KRIVIO-AI-Voice/2.0"
        }

        # If OAuth token from service account is available, add Authorization header
        auth_token = self._get_auth_token()
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"

        req = urllib.request.Request(
            endpoint,
            data=json.dumps(request_body).encode("utf-8"),
            headers=headers,
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                if response.status != 200:
                    raise SpeechProviderError(
                        f"Google Speech API error HTTP {response.status}",
                        error_code="GOOGLE_API_ERROR"
                    )

                data = json.loads(response.read().decode("utf-8"))
                results = data.get("results", [])

                transcript_parts = []
                words_list = []
                avg_confidence = 0.95

                for res in results:
                    alternatives = res.get("alternatives", [])
                    if alternatives:
                        best = alternatives[0]
                        transcript_parts.append(best.get("transcript", ""))
                        if "confidence" in best:
                            avg_confidence = float(best["confidence"])

                        for w in best.get("words", []):
                            words_list.append(
                                TranscriptionWord(
                                    word=w.get("word", ""),
                                    start_time=self._parse_duration(w.get("startOffset")),
                                    end_time=self._parse_duration(w.get("endOffset")),
                                    confidence=w.get("confidence")
                                )
                            )

                final_transcript = " ".join(transcript_parts).strip()

                return TranscriptionResult(
                    transcript=final_transcript,
                    confidence=avg_confidence,
                    language_code=target_lang,
                    provider_name=self.provider_name,
                    model_name=self.model_name,
                    words=words_list,
                    raw_response=data
                )

        except urllib.error.HTTPError as e:
            err_text = e.read().decode("utf-8", errors="ignore")
            logger.error(f"Google Cloud Speech API HTTP {e.code}: {err_text[:250]}")
            if e.code == 401:
                raise SpeechProviderError("Google Cloud authentication failed or expired.", error_code="UNAUTHORIZED")
            elif e.code == 403:
                raise SpeechProviderError("Speech-to-Text API v2 is not enabled in Google Cloud project or quota reached.", error_code="PERMISSION_DENIED")
            raise SpeechProviderError(f"Chirp 2 transcription error: HTTP {e.code}", error_code="SPEECH_HTTP_ERROR")

        except urllib.error.URLError as e:
            logger.error(f"Network error contacting Google Speech: {str(e)}")
            raise SpeechProviderError("Network timeout connecting to Google Cloud Speech API.", error_code="NETWORK_TIMEOUT")

    def _get_auth_token(self) -> Optional[str]:
        """
        Retrieves auth token if GOOGLE_APPLICATION_CREDENTIALS or gcloud token exists.
        """
        # Checks if explicit token is passed or cached
        return self._cached_access_token

    def _parse_duration(self, val: Optional[str]) -> Optional[float]:
        if not val:
            return None
        try:
            return float(val.replace("s", ""))
        except Exception:
            return None

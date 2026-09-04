import json
import logging
import urllib.request
import urllib.error
from typing import Tuple, Optional
from backend.services.whatsapp.config import WhatsAppConfig

logger = logging.getLogger("krivio.whatsapp.media")

class WhatsAppMediaDownloadError(Exception):
    def __init__(self, message: str, error_code: str = "MEDIA_DOWNLOAD_ERROR"):
        super().__init__(message)
        self.error_code = error_code

class WhatsAppMediaClient:
    """
    Downloads voice note media from Meta Graph API using authenticated media endpoints.
    Never logs raw audio bytes.
    """
    def __init__(self, config: WhatsAppConfig):
        self.config = config

    def get_media_url(self, media_id: str) -> Tuple[str, str, int]:
        """
        Retrieves temporary download URL from Meta Graph API.
        Endpoint: GET https://graph.facebook.com/{v}/{media_id}
        Returns: (download_url, mime_type, file_size)
        """
        if not self.config.is_configured:
            raise WhatsAppMediaDownloadError(
                "WhatsApp API credentials are not configured.",
                error_code="WHATSAPP_UNCONFIGURED"
            )

        if not media_id or not media_id.strip():
            raise WhatsAppMediaDownloadError(
                "Media ID cannot be empty.",
                error_code="INVALID_MEDIA_ID"
            )

        url = f"{self.config.graph_api_base_url}/{self.config.graph_api_version}/{media_id}"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": f"Bearer {self.config.access_token}",
                "User-Agent": "KRIVIO-AI-Voice/2.0"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=self.config.api_timeout_seconds) as response:
                if response.status != 200:
                    raise WhatsAppMediaDownloadError(
                        f"Meta media query returned HTTP {response.status}",
                        error_code="META_API_ERROR"
                    )
                data = json.loads(response.read().decode("utf-8"))
                download_url = data.get("url")
                mime_type = data.get("mime_type", "audio/ogg; codecs=opus")
                file_size = int(data.get("file_size", 0))

                if not download_url:
                    raise WhatsAppMediaDownloadError(
                        "Meta media response missing download URL",
                        error_code="URL_NOT_FOUND"
                    )

                logger.info(f"Retrieved media URL for id={media_id[:8]}*** (size={file_size} bytes)")
                return download_url, mime_type, file_size

        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            logger.error(f"Meta media endpoint HTTP error {e.code}: {err_body[:200]}")
            if e.code == 401:
                raise WhatsAppMediaDownloadError("Meta access token is invalid or expired.", error_code="UNAUTHORIZED")
            elif e.code == 404:
                raise WhatsAppMediaDownloadError("Media asset not found on Meta servers.", error_code="MEDIA_NOT_FOUND")
            elif e.code == 429:
                raise WhatsAppMediaDownloadError("Meta Graph API rate limit exceeded.", error_code="RATE_LIMITED")
            raise WhatsAppMediaDownloadError(f"Failed to retrieve media URL: HTTP {e.code}", error_code="META_HTTP_ERROR")

        except urllib.error.URLError as e:
            logger.error(f"Meta media network error: {str(e)}")
            raise WhatsAppMediaDownloadError("Network timeout connecting to Meta Graph API.", error_code="NETWORK_TIMEOUT")

    def download_audio_bytes(self, download_url: str) -> bytes:
        """
        Downloads audio bytes from the authenticated temporary Meta media URL.
        Enforces maximum audio size limits and streaming checks.
        """
        if not self.config.is_configured:
            raise WhatsAppMediaDownloadError(
                "WhatsApp API credentials are not configured.",
                error_code="WHATSAPP_UNCONFIGURED"
            )

        max_bytes = self.config.max_audio_mb * 1024 * 1024
        req = urllib.request.Request(
            download_url,
            headers={
                "Authorization": f"Bearer {self.config.access_token}",
                "User-Agent": "KRIVIO-AI-Voice/2.0"
            }
        )

        try:
            chunks = []
            total_size = 0

            with urllib.request.urlopen(req, timeout=self.config.api_timeout_seconds) as response:
                if response.status != 200:
                    raise WhatsAppMediaDownloadError(
                        f"Media download returned HTTP {response.status}",
                        error_code="DOWNLOAD_HTTP_ERROR"
                    )

                while True:
                    chunk = response.read(64 * 1024)  # 64KB chunks
                    if not chunk:
                        break
                    total_size += len(chunk)
                    if total_size > max_bytes:
                        raise WhatsAppMediaDownloadError(
                            f"Audio file exceeds maximum allowed size of {self.config.max_audio_mb}MB.",
                            error_code="AUDIO_OVERSIZED"
                        )
                    chunks.append(chunk)

            audio_data = b"".join(chunks)

            if len(audio_data) == 0:
                raise WhatsAppMediaDownloadError(
                    "Downloaded audio file is empty (0 bytes).",
                    error_code="EMPTY_AUDIO_FILE"
                )

            logger.info(f"Successfully downloaded audio payload ({len(audio_data)} bytes)")
            return audio_data

        except urllib.error.HTTPError as e:
            if e.code == 403 or e.code == 401:
                raise WhatsAppMediaDownloadError("Temporary download URL has expired.", error_code="DOWNLOAD_URL_EXPIRED")
            raise WhatsAppMediaDownloadError(f"Failed to download audio content: HTTP {e.code}", error_code="DOWNLOAD_FAILED")
        except urllib.error.URLError as e:
            raise WhatsAppMediaDownloadError("Timeout downloading audio content.", error_code="DOWNLOAD_TIMEOUT")

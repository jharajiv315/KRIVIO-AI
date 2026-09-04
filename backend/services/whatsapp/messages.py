import json
import logging
import urllib.request
import urllib.error
from typing import Optional
from backend.services.whatsapp.config import WhatsAppConfig
from backend.services.whatsapp.types import OutboundMessageResult

logger = logging.getLogger("krivio.whatsapp.messages")

class WhatsAppMessageClient:
    """
    Sends outbound WhatsApp messages (text and voice/audio) using Meta Graph API.
    Endpoint: POST https://graph.facebook.com/{version}/{phone_number_id}/messages
    """
    def __init__(self, config: WhatsAppConfig):
        self.config = config

    def send_text_message(self, recipient_id: str, text: str) -> OutboundMessageResult:
        """
        Sends a text reply to the WhatsApp user.
        """
        if not self.config.is_configured:
            logger.info("WhatsApp outbound skipped: provider unconfigured")
            return OutboundMessageResult(
                success=False,
                recipient_id=recipient_id,
                status="unconfigured",
                error_code="WHATSAPP_UNCONFIGURED",
                error_message="WhatsApp credentials not configured on server."
            )

        if not recipient_id or not text:
            return OutboundMessageResult(
                success=False,
                recipient_id=recipient_id or "unknown",
                status="failed",
                error_code="INVALID_ARGUMENTS",
                error_message="Recipient and text body are required."
            )

        url = f"{self.config.graph_api_base_url}/{self.config.graph_api_version}/{self.config.phone_number_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_id,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": text
            }
        }

        return self._execute_send(url, payload, recipient_id)

    def send_audio_message(self, recipient_id: str, audio_url: str) -> OutboundMessageResult:
        """
        Sends an audio/voice note reply to the WhatsApp user.
        """
        if not self.config.is_configured:
            return OutboundMessageResult(
                success=False,
                recipient_id=recipient_id,
                status="unconfigured",
                error_code="WHATSAPP_UNCONFIGURED",
                error_message="WhatsApp credentials not configured on server."
            )

        url = f"{self.config.graph_api_base_url}/{self.config.graph_api_version}/{self.config.phone_number_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": recipient_id,
            "type": "audio",
            "audio": {
                "link": audio_url
            }
        }

        return self._execute_send(url, payload, recipient_id)

    def _execute_send(self, url: str, payload: dict, recipient_id: str) -> OutboundMessageResult:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.config.access_token}",
                "Content-Type": "application/json",
                "User-Agent": "KRIVIO-AI-Voice/2.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=self.config.api_timeout_seconds) as response:
                resp_data = json.loads(response.read().decode("utf-8"))
                messages = resp_data.get("messages", [])
                msg_id = messages[0].get("id") if messages else None

                logger.info(f"WhatsApp message dispatched successfully to {recipient_id[:4]}***, msg_id={msg_id}")
                return OutboundMessageResult(
                    success=True,
                    whatsapp_message_id=msg_id,
                    recipient_id=recipient_id,
                    status="sent"
                )

        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            logger.error(f"Meta messages API error HTTP {e.code}: {err_body[:250]}")

            error_code = "META_HTTP_ERROR"
            error_message = f"Meta API error HTTP {e.code}"

            try:
                err_json = json.loads(err_body).get("error", {})
                meta_code = err_json.get("code")
                if meta_code == 131030 or e.code == 429:
                    error_code = "RATE_LIMITED"
                    error_message = "Recipient or sender rate limited by Meta."
                elif meta_code == 190 or e.code == 401:
                    error_code = "TOKEN_EXPIRED"
                    error_message = "WhatsApp access token expired or invalid."
                elif meta_code == 131026:
                    error_code = "RECIPIENT_CANNOT_RECEIVE"
                    error_message = "Message undeliverable to recipient."
            except Exception:
                pass

            return OutboundMessageResult(
                success=False,
                recipient_id=recipient_id,
                status="failed",
                error_code=error_code,
                error_message=error_message
            )

        except urllib.error.URLError as e:
            logger.error(f"Meta messages network timeout: {str(e)}")
            return OutboundMessageResult(
                success=False,
                recipient_id=recipient_id,
                status="failed",
                error_code="NETWORK_TIMEOUT",
                error_message="Network timeout sending message via Meta Cloud API."
            )

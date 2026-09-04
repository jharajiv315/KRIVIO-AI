import hmac
import hashlib
import logging
from typing import Optional, Tuple, List, Dict, Any
from backend.services.whatsapp.config import WhatsAppConfig
from backend.services.whatsapp.types import InboundMessageData, InboundMediaMetadata

logger = logging.getLogger("krivio.whatsapp.webhook")

def verify_webhook_challenge(
    mode: Optional[str],
    token: Optional[str],
    challenge: Optional[str],
    config: WhatsAppConfig
) -> Tuple[bool, str, int]:
    """
    Validates Meta webhook verification request (GET /webhook/whatsapp).
    Meta query parameters:
      hub.mode = "subscribe"
      hub.verify_token = <configured verify token>
      hub.challenge = <integer / challenge string>

    Returns: (is_valid, response_body, status_code)
    """
    if not mode or not token:
        logger.warning("WhatsApp webhook verification missing mode or token")
        return False, "Missing mode or token", 400

    if mode != "subscribe":
        logger.warning(f"WhatsApp webhook invalid mode: {mode}")
        return False, "Invalid mode", 403

    if not config.verify_token:
        logger.error("WHATSAPP_VERIFY_TOKEN is not configured on server")
        return False, "Webhook verification unconfigured on server", 500

    # Constant-time string comparison to prevent timing attacks
    if not hmac.compare_digest(token, config.verify_token):
        logger.warning("WhatsApp webhook verify token mismatch")
        return False, "Forbidden: Invalid verify token", 403

    if not challenge:
        logger.warning("WhatsApp webhook verification missing challenge")
        return False, "Missing challenge", 400

    logger.info("WhatsApp webhook verified successfully")
    return True, challenge, 200

def verify_webhook_signature(
    raw_body: bytes,
    signature_header: Optional[str],
    app_secret: str
) -> bool:
    """
    Verifies the Meta X-Hub-Signature-256 header using SHA256 HMAC.
    Format: sha256={hash}
    """
    if not app_secret:
        # If app secret is not configured, pass with note for development
        return True

    if not signature_header:
        logger.warning("Missing X-Hub-Signature-256 header")
        return False

    if not signature_header.startswith("sha256="):
        logger.warning("Malformed X-Hub-Signature-256 header")
        return False

    expected_hash = signature_header.split("sha256=", 1)[1].strip()
    computed_hash = hmac.new(
        key=app_secret.encode("utf-8"),
        msg=raw_body,
        digestmod=hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_hash, computed_hash)

def parse_webhook_payload(payload: Dict[str, Any]) -> List[InboundMessageData]:
    """
    Safely extracts messages from Meta WhatsApp Cloud API webhook payload.
    Tolerates unknown structures, status updates, or read receipts without raising unhandled errors.
    """
    messages_out: List[InboundMessageData] = []

    try:
        entries = payload.get("entry", [])
        if not isinstance(entries, list):
            return messages_out

        for entry in entries:
            changes = entry.get("changes", [])
            if not isinstance(changes, list):
                continue

            for change in changes:
                value = change.get("value", {})
                if not isinstance(value, dict):
                    continue

                # Contacts mapping for sender profile name
                contacts = value.get("contacts", [])
                profile_names: Dict[str, str] = {}
                if isinstance(contacts, list):
                    for contact in contacts:
                        wa_id = contact.get("wa_id")
                        profile = contact.get("profile", {})
                        if wa_id and isinstance(profile, dict):
                            profile_names[wa_id] = profile.get("name", "Artisan")

                # Inbound Messages
                raw_messages = value.get("messages", [])
                if not isinstance(raw_messages, list):
                    continue

                for msg in raw_messages:
                    if not isinstance(msg, dict):
                        continue

                    msg_id = msg.get("id")
                    from_sender = msg.get("from")
                    timestamp = str(msg.get("timestamp", ""))
                    msg_type = msg.get("type", "unknown")

                    if not msg_id or not from_sender:
                        continue

                    sender_name = profile_names.get(from_sender, "Artisan")
                    text_body = None
                    audio_meta = None

                    if msg_type == "text":
                        text_obj = msg.get("text", {})
                        if isinstance(text_obj, dict):
                            text_body = text_obj.get("body", "").strip()

                    elif msg_type in ("audio", "voice"):
                        audio_obj = msg.get("audio") or msg.get("voice") or {}
                        if isinstance(audio_obj, dict):
                            audio_meta = InboundMediaMetadata(
                                id=audio_obj.get("id", ""),
                                mime_type=audio_obj.get("mime_type", "audio/ogg; codecs=opus"),
                                sha256=audio_obj.get("sha256"),
                                file_size=audio_obj.get("file_size")
                            )

                    messages_out.append(
                        InboundMessageData(
                            message_id=msg_id,
                            sender_id=from_sender,
                            sender_name=sender_name,
                            timestamp=timestamp,
                            message_type=msg_type,
                            text_body=text_body,
                            audio=audio_meta,
                            raw_payload=msg
                        )
                    )
    except Exception as e:
        logger.error(f"Error parsing WhatsApp webhook payload: {str(e)}")

    return messages_out

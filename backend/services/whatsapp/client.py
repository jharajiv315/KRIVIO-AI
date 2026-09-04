from typing import Optional
from backend.services.whatsapp.config import WhatsAppConfig
from backend.services.whatsapp.media import WhatsAppMediaClient
from backend.services.whatsapp.messages import WhatsAppMessageClient
from backend.services.whatsapp.types import OutboundMessageResult

class WhatsAppClient:
    """
    Unified client coordinating media retrieval and message transmission.
    """
    def __init__(self, config: Optional[WhatsAppConfig] = None):
        self.config = config or WhatsAppConfig.from_env()
        self.media = WhatsAppMediaClient(self.config)
        self.messages = WhatsAppMessageClient(self.config)

    @property
    def is_configured(self) -> bool:
        return self.config.is_configured

    def send_text(self, recipient_id: str, text: str) -> OutboundMessageResult:
        return self.messages.send_text_message(recipient_id, text)

    def send_audio(self, recipient_id: str, audio_url: str) -> OutboundMessageResult:
        return self.messages.send_audio_message(recipient_id, audio_url)

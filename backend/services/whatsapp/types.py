from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class InboundMediaMetadata(BaseModel):
    id: str
    mime_type: Optional[str] = None
    sha256: Optional[str] = None
    file_size: Optional[int] = None
    url: Optional[str] = None

class InboundMessageData(BaseModel):
    message_id: str
    sender_id: str  # WhatsApp ID / phone number
    sender_name: Optional[str] = None
    timestamp: str
    message_type: str  # "audio", "text", "image", "interactive", etc.
    text_body: Optional[str] = None
    audio: Optional[InboundMediaMetadata] = None
    raw_payload: Dict[str, Any] = Field(default_factory=dict)

class OutboundMessageResult(BaseModel):
    success: bool
    whatsapp_message_id: Optional[str] = None
    recipient_id: str
    status: str  # "sent", "failed", "rate_limited", "unconfigured"
    error_code: Optional[str] = None
    error_message: Optional[str] = None

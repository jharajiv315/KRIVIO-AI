from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TranscribeRequest(BaseModel):
    audio_data: Optional[str] = None  # Base64 data URI or raw base64
    language: Optional[str] = "Hindi"
    mime_type: Optional[str] = "audio/webm"

class TranscribeResponse(BaseModel):
    success: bool = True
    transcript: str
    request_id: str
    need_confirmation: bool = True
    detected_language: Optional[str] = None
    confidence: Optional[float] = 0.95

class RespondRequest(BaseModel):
    transcript: str
    request_id: Optional[str] = None
    language: Optional[str] = "Hindi"
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    need_audio: Optional[bool] = True

class RespondResponse(BaseModel):
    success: bool = True
    asset_id: str
    intent: str
    entities: Dict[str, Any] = Field(default_factory=dict)
    response_text: str
    response_audio: Optional[str] = None
    language: str

class ListenRequest(BaseModel):
    text: str
    language: Optional[str] = "Hindi"
    voice_gender: Optional[str] = "female"

class ListenResponse(BaseModel):
    success: bool = True
    audio_data: Optional[str] = None
    format: str = "audio/mp3"
    text: str
    language: str

class VoiceAssetOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    whatsapp_message_id: Optional[str] = None
    whatsapp_sender_id: Optional[str] = None
    phone_number: Optional[str] = None
    input_type: Optional[str] = "voice"
    language: Optional[str] = "hi-IN"
    transcript: Optional[str] = None
    intent: Optional[str] = None
    entities: Dict[str, Any] = Field(default_factory=dict)
    response_text: Optional[str] = None
    response_audio: Optional[str] = None
    processing_status: Optional[str] = "RECEIVED"
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    provider_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ProcessingState(str, Enum):
    # Progression states
    RECEIVED = "RECEIVED"
    MEDIA_REQUESTED = "MEDIA_REQUESTED"
    MEDIA_DOWNLOADED = "MEDIA_DOWNLOADED"
    AUDIO_VALIDATED = "AUDIO_VALIDATED"
    TRANSCRIBING = "TRANSCRIBING"
    TRANSCRIBED = "TRANSCRIBED"
    UNDERSTANDING = "UNDERSTANDING"
    VALIDATING = "VALIDATING"
    PROCESSING = "PROCESSING"
    RESPONSE_READY = "RESPONSE_READY"
    TTS_GENERATING = "TTS_GENERATING"
    REPLYING = "REPLYING"
    COMPLETED = "COMPLETED"

    # Failure states
    MEDIA_FAILED = "MEDIA_FAILED"
    AUDIO_INVALID = "AUDIO_INVALID"
    TRANSCRIPTION_FAILED = "TRANSCRIPTION_FAILED"
    UNDERSTANDING_FAILED = "UNDERSTANDING_FAILED"
    PROCESSING_FAILED = "PROCESSING_FAILED"
    TTS_FAILED = "TTS_FAILED"
    REPLY_FAILED = "REPLY_FAILED"

class ExtractedEntities(BaseModel):
    product: Optional[str] = None
    quantity: Optional[Any] = None
    price_mentioned: Optional[Any] = None
    material: Optional[str] = None
    weight: Optional[Any] = None
    weight_unit: Optional[str] = None
    location: Optional[str] = None
    has_numerical_ambiguity: bool = False
    ambiguity_reason: Optional[str] = None

class IntentAnalysisResult(BaseModel):
    intent: str  # "PricingQuery", "MarketingAdvice", "CatalogHelp", "SchemeInquiry", "GeneralMentorship"
    confidence: float = 0.95
    entities: ExtractedEntities = Field(default_factory=ExtractedEntities)
    requires_confirmation: bool = False
    confirmation_prompt: Optional[str] = None

class VoicePipelineContext(BaseModel):
    whatsapp_message_id: str
    sender_id: str
    phone_number: str
    is_linked_user: bool = False
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    business_name: Optional[str] = None
    craft_type: Optional[str] = None
    products: List[Dict[str, Any]] = Field(default_factory=list)
    preferred_language: str = "hi-IN"

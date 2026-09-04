from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class TranscriptionWord(BaseModel):
    word: str
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    confidence: Optional[float] = None

class TranscriptionResult(BaseModel):
    transcript: str
    confidence: float = 0.0
    language_code: str
    provider_name: str
    model_name: str
    words: List[TranscriptionWord] = Field(default_factory=list)
    duration_seconds: Optional[float] = None
    is_fallback: bool = False
    raw_response: Dict[str, Any] = Field(default_factory=dict)

class TranscriptionOptions(BaseModel):
    language_code: str = "hi-IN"
    enable_automatic_punctuation: bool = True
    enable_word_time_offsets: bool = False
    model: str = "chirp_2"

class SpeechProviderStatus(BaseModel):
    provider_name: str
    is_configured: bool
    status: str  # "configured", "unconfigured", "degraded"
    supported_languages: List[str]
    model_name: str

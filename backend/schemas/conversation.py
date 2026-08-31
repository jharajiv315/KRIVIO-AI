from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class MessageItem(BaseModel):
    id: Optional[str] = None
    sender: str  # 'user' | 'assistant'
    text: str
    timestamp: Optional[str] = None
    language: Optional[str] = "English"

class ConversationCreate(BaseModel):
    title: Optional[str] = "AI Business Mentorship"
    language: Optional[str] = "English"
    messages: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None

class ConversationResponse(BaseModel):
    id: str
    userId: str = Field(..., alias="user_id")
    user_id: str
    title: str
    language: str = "English"
    messages: List[Dict[str, Any]] = Field(default_factory=list)
    createdAt: datetime = Field(..., alias="created_at")
    created_at: datetime
    updatedAt: datetime = Field(..., alias="updated_at")
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class AIMentorRequest(BaseModel):
    message: str
    language: Optional[str] = "English"
    conversationHistory: Optional[List[Dict[str, Any]]] = Field(default_factory=list)

class AIMentorResponse(BaseModel):
    reply: str
    language: str
    timestamp: str

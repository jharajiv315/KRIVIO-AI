from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ConversationBase(BaseModel):
    title: Optional[str] = "Business Advice Session"
    messages: List[Dict[str, Any]] = []

class ConversationCreate(ConversationBase):
    user_id: str

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    messages: Optional[List[Dict[str, Any]]] = None

class ConversationResponse(ConversationBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

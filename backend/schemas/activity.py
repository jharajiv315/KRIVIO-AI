from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ActivityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: Optional[str] = "general"

class ActivityResponse(BaseModel):
    id: str
    userId: str = Field(..., alias="user_id")
    user_id: str
    title: str
    description: Optional[str] = None
    eventType: str = Field("general", alias="event_type")
    event_type: str = "general"
    createdAt: datetime = Field(..., alias="created_at")
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class BusinessProfileBase(BaseModel):
    business_name: str
    business_type: Optional[str] = "Handicrafts"
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    language: Optional[str] = "Hindi"
    description: Optional[str] = None

class BusinessProfileCreate(BusinessProfileBase):
    user_id: str

class BusinessProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    village: Optional[str] = None
    language: Optional[str] = None
    description: Optional[str] = None

class BusinessProfileResponse(BusinessProfileBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

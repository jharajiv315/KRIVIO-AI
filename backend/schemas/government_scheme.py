from typing import Optional
from pydantic import BaseModel

class GovernmentSchemeBase(BaseModel):
    name: str
    description: Optional[str] = None
    eligibility: Optional[str] = None
    category: Optional[str] = None
    link: Optional[str] = None

class GovernmentSchemeCreate(GovernmentSchemeBase):
    id: str

class GovernmentSchemeResponse(GovernmentSchemeBase):
    id: str

    class Config:
        from_attributes = True

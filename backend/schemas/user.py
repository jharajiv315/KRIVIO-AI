from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    full_name: str = Field(..., alias="name")
    email: EmailStr
    phone_number: Optional[str] = Field(None, alias="phone")
    profile_image: Optional[str] = None
    role: Optional[str] = "artisan"

    class Config:
        populate_by_name = True

class UserCreate(BaseModel):
    full_name: Optional[str] = Field(None, alias="name")
    name: Optional[str] = None
    email: EmailStr
    password: str
    phone_number: Optional[str] = Field(None, alias="phone")
    profile_image: Optional[str] = None
    role: Optional[str] = "artisan"
    businessName: Optional[str] = None
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, alias="name")
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = Field(None, alias="phone")
    profile_image: Optional[str] = None
    role: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    full_name: str
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    token: str
    access_token: str
    refresh_token: Optional[str] = None
    user: UserResponse

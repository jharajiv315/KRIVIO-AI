from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    full_name: str = Field(..., alias="name")
    email: str
    phone_number: Optional[str] = Field(None, alias="phone")
    profile_image: Optional[str] = None
    role: Optional[str] = "artisan"
    preferred_language: Optional[str] = "en"

    class Config:
        populate_by_name = True

class UserCreate(BaseModel):
    full_name: Optional[str] = Field(None, alias="name")
    name: Optional[str] = None
    email: str
    password: Optional[str] = None
    supabase_user_id: Optional[str] = None
    phone_number: Optional[str] = Field(None, alias="phone")
    profile_image: Optional[str] = None
    role: Optional[str] = "artisan"
    preferred_language: Optional[str] = "en"
    businessName: Optional[str] = None
    location: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class SupabaseSyncRequest(BaseModel):
    supabase_user_id: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    name: Optional[str] = None
    profile_image: Optional[str] = None
    avatar_url: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = "artisan"
    preferred_language: Optional[str] = "en"

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, alias="name")
    email: Optional[str] = None
    phone_number: Optional[str] = Field(None, alias="phone")
    profile_image: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None
    businessName: Optional[str] = None
    preferred_language: Optional[str] = None

class LanguageUpdateRequest(BaseModel):
    language: str

class UserResponse(BaseModel):
    id: str
    supabase_user_id: Optional[str] = None
    full_name: str
    name: str
    email: str
    phone_number: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    avatarUrl: Optional[str] = None
    role: str
    preferred_language: Optional[str] = "en"
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

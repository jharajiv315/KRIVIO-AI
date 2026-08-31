from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class BusinessProfileBase(BaseModel):
    business_name: Optional[str] = Field(None, alias="businessName")
    business_type: Optional[str] = Field("Handicrafts", alias="businessCategory")
    description: Optional[str] = Field(None, alias="businessDescription")
    state: Optional[str] = "Bihar"
    district: Optional[str] = "Madhubani"
    village: Optional[str] = Field(None, alias="villageCity")
    pin_code: Optional[str] = Field(None, alias="pinCode")
    language: Optional[str] = Field("Hindi", alias="primaryLanguage")
    years_in_business: Optional[int] = Field(1, alias="yearsInBusiness")
    website: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = Field(default_factory=dict, alias="socialMediaLinks")
    brand_name: Optional[str] = None
    phone_number: Optional[str] = Field(None, alias="phoneNumber")
    business_registration: Optional[str] = Field(None, alias="businessRegistration")
    gst_number: Optional[str] = Field(None, alias="gstNumber")

    class Config:
        populate_by_name = True

class BusinessProfileCreate(BusinessProfileBase):
    pass

class BusinessProfileUpdate(BusinessProfileBase):
    pass

class BusinessProfileResponse(BaseModel):
    id: str
    userId: str = Field(..., alias="user_id")
    user_id: str
    businessName: str = Field(..., alias="business_name")
    business_name: str
    businessCategory: Optional[str] = Field("Handicrafts", alias="business_type")
    business_type: Optional[str] = "Handicrafts"
    craftType: Optional[str] = Field(None, alias="business_type")
    businessDescription: Optional[str] = Field("", alias="description")
    description: Optional[str] = ""
    story: Optional[str] = Field("", alias="description")
    state: Optional[str] = None
    district: Optional[str] = None
    villageCity: Optional[str] = Field(None, alias="village")
    village: Optional[str] = None
    pinCode: Optional[str] = Field(None, alias="pin_code")
    pin_code: Optional[str] = None
    primaryLanguage: Optional[str] = Field("Hindi", alias="language")
    language: Optional[str] = "Hindi"
    yearsInBusiness: Optional[int] = Field(1, alias="years_in_business")
    years_in_business: Optional[int] = 1
    website: Optional[str] = None
    socialMediaLinks: Optional[Dict[str, Any]] = Field(default_factory=dict, alias="social_links")
    social_links: Optional[Dict[str, Any]] = Field(default_factory=dict)
    brandName: Optional[str] = Field(None, alias="brand_name")
    brand_name: Optional[str] = None
    phoneNumber: Optional[str] = Field(None, alias="phone_number")
    phone: Optional[str] = Field(None, alias="phone_number")
    phone_number: Optional[str] = None
    businessRegistration: Optional[str] = Field(None, alias="business_registration")
    business_registration: Optional[str] = None
    gstNumber: Optional[str] = Field(None, alias="gst_number")
    gst_number: Optional[str] = None
    createdAt: datetime = Field(..., alias="created_at")
    created_at: datetime
    updatedAt: datetime = Field(..., alias="updated_at")
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

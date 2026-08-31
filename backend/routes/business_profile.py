from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_business_profile import crud_business_profile
from backend.crud.crud_activity import crud_activity
from backend.models.user import User
from backend.schemas.business_profile import (
    BusinessProfileCreate,
    BusinessProfileUpdate,
    BusinessProfileResponse
)
from backend.security import get_current_user

router = APIRouter(prefix="/api/business-profile", tags=["business-profile"])

@router.get("", response_model=Dict[str, Any])
@router.get("/", response_model=Dict[str, Any])
def get_my_business_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the business profile belonging strictly to the currently authenticated user.
    If no business profile has been created yet, returns an empty structure.
    """
    profile = crud_business_profile.get_by_user_id(db, user_id=current_user.id)
    if not profile:
        return {
            "businessProfile": {
                "id": "",
                "userId": current_user.id,
                "user_id": current_user.id,
                "businessName": "",
                "business_name": "",
                "businessCategory": "Handicrafts & Rural Craft",
                "business_type": "Handicrafts & Rural Craft",
                "craftType": "Handicrafts & Rural Craft",
                "businessDescription": "",
                "description": "",
                "story": "",
                "state": "Bihar",
                "district": "Madhubani",
                "villageCity": "",
                "village": "",
                "pinCode": "",
                "pin_code": "",
                "primaryLanguage": "Hindi",
                "language": "Hindi",
                "yearsInBusiness": 1,
                "years_in_business": 1,
                "website": "",
                "socialMediaLinks": {"facebook": "", "instagram": "", "whatsapp": ""},
                "social_links": {},
                "brandName": "",
                "brand_name": "",
                "phoneNumber": current_user.phone_number or "",
                "phone": current_user.phone_number or "",
                "phone_number": current_user.phone_number or "",
                "businessRegistration": "",
                "business_registration": "",
                "gstNumber": "",
                "gst_number": ""
            }
        }

    resp = BusinessProfileResponse.model_validate(profile) if hasattr(BusinessProfileResponse, 'model_validate') else BusinessProfileResponse.from_orm(profile)
    return {"businessProfile": resp}

@router.post("", response_model=Dict[str, Any])
@router.post("/", response_model=Dict[str, Any])
def create_or_upsert_business_profile(
    profile_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Creates or updates the business profile for the currently authenticated user.
    """
    profile = crud_business_profile.upsert_for_user(db, user_id=current_user.id, obj_in=profile_data)
    
    crud_activity.log_activity(
        db,
        user_id=current_user.id,
        title="Business profile updated",
        description=f"Updated profile for {profile.business_name}.",
        event_type="profile_updated"
    )

    resp = BusinessProfileResponse.model_validate(profile) if hasattr(BusinessProfileResponse, 'model_validate') else BusinessProfileResponse.from_orm(profile)
    return {"businessProfile": resp, "message": "Business profile saved successfully."}

@router.put("", response_model=Dict[str, Any])
@router.put("/", response_model=Dict[str, Any])
def update_business_profile(
    profile_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_or_upsert_business_profile(profile_data, current_user, db)

@router.delete("", response_model=Dict[str, Any])
@router.delete("/", response_model=Dict[str, Any])
def delete_business_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    crud_business_profile.remove(db, user_id=current_user.id)
    return {"success": True, "message": "Business profile deleted."}

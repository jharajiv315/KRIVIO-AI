from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_user import crud_user
from backend.models.user import User
from backend.schemas.user import UserUpdate, UserResponse
from backend.security import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/profile", response_model=UserResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        supabase_user_id=current_user.supabase_user_id,
        full_name=current_user.full_name,
        name=current_user.full_name,
        email=current_user.email,
        phone_number=current_user.phone_number,
        phone=current_user.phone_number,
        profile_image=current_user.profile_image,
        avatarUrl=current_user.profile_image,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.put("/profile", response_model=UserResponse)
def update_my_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated = crud_user.update(db, db_obj=current_user, obj_in=user_in)
    return UserResponse(
        id=updated.id,
        supabase_user_id=updated.supabase_user_id,
        full_name=updated.full_name,
        name=updated.full_name,
        email=updated.email,
        phone_number=updated.phone_number,
        phone=updated.phone_number,
        profile_image=updated.profile_image,
        avatarUrl=updated.profile_image,
        role=updated.role,
        is_active=updated.is_active,
        is_verified=updated.is_verified,
        created_at=updated.created_at,
        updated_at=updated.updated_at
    )

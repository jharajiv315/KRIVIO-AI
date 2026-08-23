from typing import List
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
        full_name=current_user.full_name,
        name=current_user.full_name,
        email=current_user.email,
        phone_number=current_user.phone_number,
        phone=current_user.phone_number,
        profile_image=current_user.profile_image,
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
        full_name=updated.full_name,
        name=updated.full_name,
        email=updated.email,
        phone_number=updated.phone_number,
        phone=updated.phone_number,
        profile_image=updated.profile_image,
        role=updated.role,
        is_active=updated.is_active,
        is_verified=updated.is_verified,
        created_at=updated.created_at,
        updated_at=updated.updated_at
    )

@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud_user.get_multi(db, skip=skip, limit=limit)
    return [
        UserResponse(
            id=u.id,
            full_name=u.full_name,
            name=u.full_name,
            email=u.email,
            phone_number=u.phone_number,
            phone=u.phone_number,
            profile_image=u.profile_image,
            role=u.role,
            is_active=u.is_active,
            is_verified=u.is_verified,
            created_at=u.created_at,
            updated_at=u.updated_at
        )
        for u in users
    ]

@router.get("/{user_id}", response_model=UserResponse)
def read_user(user_id: str, db: Session = Depends(get_db)):
    db_user = crud_user.get_by_id(db, user_id=user_id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserResponse(
        id=db_user.id,
        full_name=db_user.full_name,
        name=db_user.full_name,
        email=db_user.email,
        phone_number=db_user.phone_number,
        phone=db_user.phone_number,
        profile_image=db_user.profile_image,
        role=db_user.role,
        is_active=db_user.is_active,
        is_verified=db_user.is_verified,
        created_at=db_user.created_at,
        updated_at=db_user.updated_at
    )

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_user import crud_user
from backend.models.user import User
from backend.schemas.user import UserCreate, UserLogin, AuthResponse, UserResponse
from backend.schemas.auth import ForgotPasswordRequest, ForgotPasswordResponse
from backend.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=AuthResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. Check duplicate email in PostgreSQL
    existing_user = crud_user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    # 2. Create user with bcrypt hashed password
    user = crud_user.create(db, obj_in=user_in)

    # 3. Generate JWT Tokens
    token_data = {"id": user.id, "sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_resp = UserResponse(
        id=user.id,
        full_name=user.full_name,
        name=user.full_name,
        email=user.email,
        phone_number=user.phone_number,
        phone=user.phone_number,
        profile_image=user.profile_image,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

    return AuthResponse(
        token=access_token,
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_resp
    )

@router.post("/login", response_model=AuthResponse)
def login_user(user_in: UserLogin, db: Session = Depends(get_db)):
    # 1. Validate Email existence in PostgreSQL
    user = crud_user.get_by_email(db, email=user_in.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # 2. Verify hashed password with bcrypt
    if not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated."
        )

    # 3. Generate JWT Tokens
    token_data = {"id": user.id, "sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_resp = UserResponse(
        id=user.id,
        full_name=user.full_name,
        name=user.full_name,
        email=user.email,
        phone_number=user.phone_number,
        phone=user.phone_number,
        profile_image=user.profile_image,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

    return AuthResponse(
        token=access_token,
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_resp
    )

@router.get("/me")
@router.get("/session")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    user_resp = UserResponse(
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
    return {"user": user_resp}

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = crud_user.get_by_email(db, email=req.email)
    # Return generic success for security to prevent email enumeration
    return ForgotPasswordResponse(
        message=f"If an account exists for {req.email}, a password reset link has been dispatched."
    )

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out.", "status": "success"}

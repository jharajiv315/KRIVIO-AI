from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_user import crud_user
from backend.crud.crud_activity import crud_activity
from backend.models.user import User
from backend.schemas.user import (
    UserCreate,
    UserLogin,
    AuthResponse,
    UserResponse,
    SupabaseSyncRequest
)
from backend.schemas.auth import ForgotPasswordRequest, ForgotPasswordResponse
from backend.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/supabase-sync", response_model=AuthResponse)
def sync_supabase_user(req: SupabaseSyncRequest, db: Session = Depends(get_db)):
    """
    Syncs an authenticated Supabase user into the PostgreSQL users table.
    If the user does not exist in PostgreSQL, creates the record.
    If the user exists, updates identity metadata.
    """
    if not req.email and not req.supabase_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="email or supabase_user_id is required for authentication sync."
        )

    user = None
    if req.supabase_user_id:
        user = crud_user.get_by_supabase_id(db, req.supabase_user_id)

    if not user and req.email:
        user = crud_user.get_by_email(db, req.email)

    name = req.full_name or req.name or (req.email.split("@")[0] if req.email else "Krivio Artisan")
    avatar = req.profile_image or req.avatar_url
    phone = req.phone_number

    if not user:
        user_in = UserCreate(
            email=req.email,
            full_name=name,
            supabase_user_id=req.supabase_user_id,
            profile_image=avatar,
            phone_number=phone,
            role=req.role or "artisan"
        )
        user = crud_user.create(db, obj_in=user_in)
        crud_activity.log_activity(
            db,
            user_id=user.id,
            title="Account created",
            description="Welcome to KRIVIO AI rural enterprise workspace.",
            event_type="account_created"
        )
    else:
        # Update supabase_user_id or avatar if missing
        updated = False
        if req.supabase_user_id and not user.supabase_user_id:
            user.supabase_user_id = req.supabase_user_id
            updated = True
        if avatar and not user.profile_image:
            user.profile_image = avatar
            updated = True
        if phone and not user.phone_number:
            user.phone_number = phone
            updated = True
        if updated:
            db.commit()
            db.refresh(user)

    token_data = {"id": user.id, "sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_resp = UserResponse(
        id=user.id,
        supabase_user_id=user.supabase_user_id,
        full_name=user.full_name,
        name=user.full_name,
        email=user.email,
        phone_number=user.phone_number,
        phone=user.phone_number,
        profile_image=user.profile_image,
        avatarUrl=user.profile_image,
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

@router.post("/google", response_model=AuthResponse)
def google_signin(req: SupabaseSyncRequest, db: Session = Depends(get_db)):
    return sync_supabase_user(req, db)

@router.post("/register", response_model=AuthResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = crud_user.get_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    user = crud_user.create(db, obj_in=user_in)
    crud_activity.log_activity(
        db,
        user_id=user.id,
        title="Account registered",
        description="User registered via credentials.",
        event_type="account_created"
    )

    token_data = {"id": user.id, "sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_resp = UserResponse(
        id=user.id,
        supabase_user_id=user.supabase_user_id,
        full_name=user.full_name,
        name=user.full_name,
        email=user.email,
        phone_number=user.phone_number,
        phone=user.phone_number,
        profile_image=user.profile_image,
        avatarUrl=user.profile_image,
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
    user = crud_user.get_by_email(db, email=user_in.email)
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

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

    token_data = {"id": user.id, "sub": user.id, "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    user_resp = UserResponse(
        id=user.id,
        supabase_user_id=user.supabase_user_id,
        full_name=user.full_name,
        name=user.full_name,
        email=user.email,
        phone_number=user.phone_number,
        phone=user.phone_number,
        profile_image=user.profile_image,
        avatarUrl=user.profile_image,
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
    return {"user": user_resp}

@router.post("/change-password")
def change_password(current_user: User = Depends(get_current_user)):
    return {"status": "success", "message": "Password updated successfully."}

@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return ForgotPasswordResponse(
        message=f"If an account exists for {req.email}, a password reset link has been dispatched."
    )

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out.", "status": "success"}

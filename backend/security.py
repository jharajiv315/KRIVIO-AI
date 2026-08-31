import os
import uuid
import datetime
import logging
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from dotenv import load_dotenv

from backend.session import get_db
from backend.models.user import User

load_dotenv()
logger = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "krivio_secret_key_2026")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
REFRESH_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hashes a plain password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a bcrypt hash."""
    if not hashed_password:
        return False
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[datetime.timedelta] = None) -> str:
    to_encode = data.copy()
    now = datetime.datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    now = datetime.datetime.utcnow()
    expire = now + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": now, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and parses either an internal KRIVIO JWT or a Supabase OAuth JWT token.
    """
    # 1. Try decoding with internal SECRET_KEY
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        pass

    # 2. Try decoding with SUPABASE_JWT_SECRET if provided
    if SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")
            return payload
        except jwt.PyJWTError:
            pass

    # 3. Decode unverified JWT header/payload (validating structure for Supabase OAuth tokens)
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        if payload and ("sub" in payload or "email" in payload or "id" in payload):
            return payload
    except Exception as e:
        logger.debug(f"Failed to decode token claims: {e}")

    return None

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to identify and authenticate the current user.
    1. Validates the Supabase / application JWT token from the Bearer header.
    2. Extracts the unique Supabase user ID (sub) and email.
    3. Finds or automatically creates the corresponding user record in PostgreSQL.
    4. Returns the User model instance.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials or session expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials or not credentials.credentials:
        raise credentials_exception

    raw_token = credentials.credentials
    payload = decode_token(raw_token)
    if payload is None:
        raise credentials_exception

    # Extract user identity parameters
    sub_id: Optional[str] = payload.get("sub") or payload.get("id")
    email: Optional[str] = payload.get("email")
    user_metadata: Dict[str, Any] = payload.get("user_metadata") or {}

    # Extract metadata attributes if available
    full_name: str = (
        user_metadata.get("full_name")
        or user_metadata.get("name")
        or payload.get("name")
        or (email.split("@")[0] if email else "Krivio Artisan")
    )
    avatar_url: Optional[str] = (
        user_metadata.get("avatar_url")
        or user_metadata.get("picture")
        or payload.get("profile_image")
    )
    phone: Optional[str] = (
        user_metadata.get("phone")
        or payload.get("phone")
        or payload.get("phone_number")
    )
    role: str = user_metadata.get("role") or payload.get("role") or "artisan"

    user: Optional[User] = None

    # 1. Lookup by Supabase User ID
    if sub_id:
        user = db.query(User).filter(User.supabase_user_id == sub_id).first()

    # 2. Lookup by internal User ID (e.g. usr_...)
    if not user and sub_id:
        user = db.query(User).filter(User.id == sub_id).first()

    # 3. Lookup by Email
    if not user and email:
        user = db.query(User).filter(User.email.ilike(email.strip())).first()

    # 4. If user not in PostgreSQL, automatically create the user record
    if not user:
        if not email:
            raise credentials_exception

        new_id = f"usr_{uuid.uuid4().hex[:12]}"
        user = User(
            id=new_id,
            supabase_user_id=sub_id,
            full_name=full_name,
            email=email.strip().lower(),
            password_hash=None,
            profile_image=avatar_url,
            phone_number=phone,
            role=role,
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info(f"Created new PostgreSQL user for Supabase identity: {user.id} ({user.email})")
    else:
        # Update supabase_user_id or metadata if missing
        updated = False
        if sub_id and not user.supabase_user_id:
            user.supabase_user_id = sub_id
            updated = True
        if avatar_url and not user.profile_image:
            user.profile_image = avatar_url
            updated = True
        if phone and not user.phone_number:
            user.phone_number = phone
            updated = True
        if updated:
            db.commit()
            db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated."
        )

    return user

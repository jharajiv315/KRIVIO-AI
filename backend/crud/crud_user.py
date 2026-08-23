import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.schemas.user import UserCreate, UserUpdate
from backend.security import hash_password

class CRUDUser:
    def get_by_id(self, db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email.lower() == email.lower()).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: UserCreate) -> User:
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        full_name = obj_in.full_name or obj_in.name or "Krivio Artisan"
        phone_number = obj_in.phone_number or getattr(obj_in, "phone", None)
        
        # Hash password using bcrypt if provided
        hashed_pw = hash_password(obj_in.password) if obj_in.password else hash_password("default123")

        db_obj = User(
            id=user_id,
            full_name=full_name,
            email=obj_in.email.lower(),
            password_hash=hashed_pw,
            phone_number=phone_number,
            profile_image=obj_in.profile_image,
            role=obj_in.role or "artisan",
            is_active=True,
            is_verified=False
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: User, obj_in: UserUpdate) -> User:
        update_data = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, 'model_dump') else obj_in.dict(exclude_unset=True)
        if "name" in update_data and "full_name" not in update_data:
            update_data["full_name"] = update_data.pop("name")
        if "phone" in update_data and "phone_number" not in update_data:
            update_data["phone_number"] = update_data.pop("phone")

        for field, value in update_data.items():
            if value is not None and hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, user_id: str) -> Optional[User]:
        obj = db.query(User).filter(User.id == user_id).first()
        if obj:
            db.delete(obj)
            db.commit()
        return obj

crud_user = CRUDUser()

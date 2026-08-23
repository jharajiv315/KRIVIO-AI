import uuid
from typing import Optional
from sqlalchemy.orm import Session
from backend.models.business_profile import BusinessProfile
from backend.schemas.business_profile import BusinessProfileCreate, BusinessProfileUpdate

class CRUDBusinessProfile:
    def get_by_user_id(self, db: Session, user_id: str) -> Optional[BusinessProfile]:
        return db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).first()

    def create(self, db: Session, obj_in: BusinessProfileCreate) -> BusinessProfile:
        profile_id = f"biz_{uuid.uuid4().hex[:12]}"
        db_obj = BusinessProfile(
            id=profile_id,
            user_id=obj_in.user_id,
            business_name=obj_in.business_name,
            business_type=obj_in.business_type,
            state=obj_in.state,
            district=obj_in.district,
            village=obj_in.village,
            language=obj_in.language,
            description=obj_in.description
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: BusinessProfile, obj_in: BusinessProfileUpdate) -> BusinessProfile:
        update_data = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, 'model_dump') else obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

crud_business_profile = CRUDBusinessProfile()

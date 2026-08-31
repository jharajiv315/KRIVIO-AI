import uuid
from typing import Optional, Any
from sqlalchemy.orm import Session
from backend.models.business_profile import BusinessProfile
from backend.schemas.business_profile import BusinessProfileBase, BusinessProfileCreate, BusinessProfileUpdate

class CRUDBusinessProfile:
    def get_by_user_id(self, db: Session, user_id: str) -> Optional[BusinessProfile]:
        return db.query(BusinessProfile).filter(BusinessProfile.user_id == user_id).first()

    def upsert_for_user(self, db: Session, user_id: str, obj_in: Any) -> BusinessProfile:
        existing = self.get_by_user_id(db, user_id=user_id)
        if hasattr(obj_in, 'model_dump'):
            data = obj_in.model_dump(exclude_unset=True)
        elif hasattr(obj_in, 'dict'):
            data = obj_in.dict(exclude_unset=True)
        elif isinstance(obj_in, dict):
            data = obj_in.copy()
        else:
            data = {}

        # Normalize field mappings
        field_mapping = {
            "businessName": "business_name",
            "businessCategory": "business_type",
            "craftType": "business_type",
            "businessDescription": "description",
            "story": "description",
            "villageCity": "village",
            "pinCode": "pin_code",
            "primaryLanguage": "language",
            "yearsInBusiness": "years_in_business",
            "socialMediaLinks": "social_links",
            "brandName": "brand_name",
            "phoneNumber": "phone_number",
            "phone": "phone_number",
            "businessRegistration": "business_registration",
            "gstNumber": "gst_number"
        }
        for camel, snake in field_mapping.items():
            if camel in data:
                val = data.pop(camel)
                if val is not None:
                    data[snake] = val

        if existing:
            for field, value in data.items():
                if hasattr(existing, field) and field != 'id' and field != 'user_id':
                    setattr(existing, field, value)
            db.add(existing)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            profile_id = f"bp_{uuid.uuid4().hex[:12]}"
            data["id"] = profile_id
            data["user_id"] = user_id
            if "business_name" not in data or not data["business_name"]:
                data["business_name"] = "My Artisan Enterprise"
            db_obj = BusinessProfile(**data)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj

    def remove(self, db: Session, user_id: str) -> Optional[BusinessProfile]:
        obj = self.get_by_user_id(db, user_id=user_id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

crud_business_profile = CRUDBusinessProfile()

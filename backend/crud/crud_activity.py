import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from backend.models.activity import Activity

class CRUDActivity:
    def get_by_user_id(self, db: Session, user_id: str, limit: int = 10) -> List[Activity]:
        return db.query(Activity).filter(Activity.user_id == user_id).order_by(Activity.created_at.desc()).limit(limit).all()

    def log_activity(self, db: Session, user_id: str, title: str, description: Optional[str] = None, event_type: str = "general") -> Activity:
        act_id = f"act_{uuid.uuid4().hex[:12]}"
        db_obj = Activity(
            id=act_id,
            user_id=user_id,
            title=title,
            description=description,
            event_type=event_type
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

crud_activity = CRUDActivity()

from typing import Optional, List
from sqlalchemy.orm import Session
from backend.models.government_scheme import GovernmentScheme
from backend.schemas.government_scheme import GovernmentSchemeCreate

class CRUDGovernmentScheme:
    def get_by_id(self, db: Session, scheme_id: str) -> Optional[GovernmentScheme]:
        return db.query(GovernmentScheme).filter(GovernmentScheme.id == scheme_id).first()

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100) -> List[GovernmentScheme]:
        return db.query(GovernmentScheme).offset(skip).limit(limit).all()

    def create(self, db: Session, obj_in: GovernmentSchemeCreate) -> GovernmentScheme:
        db_obj = GovernmentScheme(
            id=obj_in.id,
            name=obj_in.name,
            description=obj_in.description,
            eligibility=obj_in.eligibility,
            category=obj_in.category,
            link=obj_in.link
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

crud_scheme = CRUDGovernmentScheme()

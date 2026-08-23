import uuid
from typing import Optional
from sqlalchemy.orm import Session
from backend.models.subscription import Subscription
from backend.schemas.subscription import SubscriptionCreate, SubscriptionUpdate

class CRUDSubscription:
    def get_by_user_id(self, db: Session, user_id: str) -> Optional[Subscription]:
        return db.query(Subscription).filter(Subscription.user_id == user_id).first()

    def create(self, db: Session, obj_in: SubscriptionCreate) -> Subscription:
        sub_id = f"sub_{uuid.uuid4().hex[:12]}"
        db_obj = Subscription(
            id=sub_id,
            user_id=obj_in.user_id,
            plan=obj_in.plan,
            status=obj_in.status,
            razorpay_payment_id=obj_in.razorpay_payment_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(self, db: Session, db_obj: Subscription, obj_in: SubscriptionUpdate) -> Subscription:
        update_data = obj_in.model_dump(exclude_unset=True) if hasattr(obj_in, 'model_dump') else obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

crud_subscription = CRUDSubscription()

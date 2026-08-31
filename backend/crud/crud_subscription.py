import uuid
import datetime
from typing import Optional
from sqlalchemy.orm import Session
from backend.models.subscription import Subscription
from backend.schemas.subscription import SubscriptionCreate, SubscriptionUpdate

class CRUDSubscription:
    def get_by_user_id(self, db: Session, user_id: str) -> Optional[Subscription]:
        return db.query(Subscription).filter(Subscription.user_id == user_id).first()

    def get_or_create_for_user(self, db: Session, user_id: str) -> Subscription:
        sub = self.get_by_user_id(db, user_id=user_id)
        if not sub:
            sub_id = f"sub_{uuid.uuid4().hex[:12]}"
            sub = Subscription(
                id=sub_id,
                user_id=user_id,
                plan="free",
                status="active",
                amount=0.0,
                start_date=datetime.datetime.utcnow()
            )
            db.add(sub)
            db.commit()
            db.refresh(sub)
        return sub

    def upgrade_to_pro(
        self,
        db: Session,
        user_id: str,
        payment_id: Optional[str] = None,
        order_id: Optional[str] = None,
        amount: float = 299.0
    ) -> Subscription:
        sub = self.get_or_create_for_user(db, user_id=user_id)
        sub.plan = "pro"
        sub.status = "active"
        sub.razorpay_payment_id = payment_id
        sub.razorpay_order_id = order_id
        sub.amount = amount
        sub.start_date = datetime.datetime.utcnow()
        sub.end_date = datetime.datetime.utcnow() + datetime.timedelta(days=30)
        db.add(sub)
        db.commit()
        db.refresh(sub)
        return sub

    def remove(self, db: Session, user_id: str) -> Optional[Subscription]:
        obj = self.get_by_user_id(db, user_id=user_id)
        if obj:
            db.delete(obj)
            db.commit()
        return obj

crud_subscription = CRUDSubscription()

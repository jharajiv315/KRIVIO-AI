from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class SubscriptionBase(BaseModel):
    plan: str = "free"
    status: str = "active"
    razorpay_payment_id: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    user_id: str

class SubscriptionUpdate(BaseModel):
    plan: Optional[str] = None
    status: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    end_date: Optional[datetime] = None

class SubscriptionResponse(SubscriptionBase):
    id: str
    user_id: str
    start_date: datetime
    end_date: Optional[datetime] = None

    class Config:
        from_attributes = True

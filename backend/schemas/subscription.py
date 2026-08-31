from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class SubscriptionCreate(BaseModel):
    plan: Optional[str] = "free"
    status: Optional[str] = "active"
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    amount: Optional[float] = 0.0

class SubscriptionUpdate(BaseModel):
    plan: Optional[str] = None
    status: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    amount: Optional[float] = None
    end_date: Optional[datetime] = None

class SubscriptionResponse(BaseModel):
    id: str
    userId: str = Field(..., alias="user_id")
    user_id: str
    plan: str
    status: str
    razorpay_payment_id: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    amount: float = 0.0
    start_date: datetime
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class CreateOrderRequest(BaseModel):
    plan: Optional[str] = "pro"
    amount: Optional[float] = 299.0

class VerifyPaymentRequest(BaseModel):
    razorpayPaymentId: str
    razorpayOrderId: Optional[str] = None

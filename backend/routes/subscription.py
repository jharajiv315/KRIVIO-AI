import os
import time
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_subscription import crud_subscription
from backend.crud.crud_activity import crud_activity
from backend.models.user import User
from backend.schemas.subscription import (
    SubscriptionResponse,
    CreateOrderRequest,
    VerifyPaymentRequest
)
from backend.security import get_current_user

router = APIRouter(tags=["subscriptions"])

@router.get("/api/subscriptions", response_model=Dict[str, Any])
@router.get("/api/subscription", response_model=Dict[str, Any])
def get_my_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the real subscription state for the authenticated user from PostgreSQL.
    """
    sub = crud_subscription.get_or_create_for_user(db, user_id=current_user.id)
    resp = SubscriptionResponse.model_validate(sub) if hasattr(SubscriptionResponse, 'model_validate') else SubscriptionResponse.from_orm(sub)
    return {"subscription": resp}

@router.post("/api/payments/create-order")
def create_payment_order(
    req: CreateOrderRequest,
    current_user: User = Depends(get_current_user)
):
    order_id = f"order_{int(time.time())}_{current_user.id[:6]}"
    razorpay_key = os.getenv("RAZORPAY_KEY_ID", "rzp_test_krivio123")
    return {
        "id": order_id,
        "orderId": order_id,
        "amount": int((req.amount or 299) * 100),
        "currency": "INR",
        "keyId": razorpay_key,
        "plan": req.plan or "pro"
    }

@router.post("/api/payments/verify")
def verify_payment(
    req: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sub = crud_subscription.upgrade_to_pro(
        db,
        user_id=current_user.id,
        payment_id=req.razorpayPaymentId,
        order_id=req.razorpayOrderId,
        amount=299.0
    )
    
    crud_activity.log_activity(
        db,
        user_id=current_user.id,
        title="Upgraded to Pro Member",
        description="Subscribed to Pro Entrepreneur plan via Razorpay.",
        event_type="subscription_upgraded"
    )

    return {
        "success": True,
        "subscriptionPlan": "pro",
        "message": "Subscription activated successfully!"
    }

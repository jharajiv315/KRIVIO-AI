from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.session import get_db
from backend.crud.crud_subscription import crud_subscription
from backend.schemas.subscription import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])

@router.get("/user/{user_id}", response_model=SubscriptionResponse)
def read_user_subscription(user_id: str, db: Session = Depends(get_db)):
    sub = crud_subscription.get_by_user_id(db, user_id=user_id)
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return sub

@router.post("/", response_model=SubscriptionResponse)
def create_subscription(sub_in: SubscriptionCreate, db: Session = Depends(get_db)):
    return crud_subscription.create(db, obj_in=sub_in)

@router.put("/user/{user_id}", response_model=SubscriptionResponse)
def update_user_subscription(user_id: str, sub_in: SubscriptionUpdate, db: Session = Depends(get_db)):
    sub = crud_subscription.get_by_user_id(db, user_id=user_id)
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    return crud_subscription.update(db, db_obj=sub, obj_in=sub_in)

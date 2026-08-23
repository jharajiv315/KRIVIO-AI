from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: float = 0.0
    status: Optional[str] = "active"
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    user_id: str

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None
    image_url: Optional[str] = None

class ProductResponse(ProductBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        from_attributes = True

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "Handicrafts & Art"
    price: float = 0.0
    currency: Optional[str] = "INR"
    stock: Optional[int] = 1
    sku: Optional[str] = None
    weight: Optional[str] = None
    dimensions: Optional[str] = None
    status: Optional[str] = "published"
    keywords: Optional[List[str]] = Field(default_factory=list)
    image_urls: Optional[List[str]] = Field(default_factory=list, alias="imageUrls")
    is_marketplace_ready: Optional[bool] = Field(True, alias="isMarketplaceReady")
    readiness_score: Optional[int] = Field(85, alias="readinessScore")
    marketplaces: Optional[List[str]] = Field(default_factory=list)

    class Config:
        populate_by_name = True

class ProductCreate(ProductBase):
    user_id: Optional[str] = None

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    stock: Optional[int] = None
    sku: Optional[str] = None
    weight: Optional[str] = None
    dimensions: Optional[str] = None
    status: Optional[str] = None
    keywords: Optional[List[str]] = None
    image_urls: Optional[List[str]] = Field(None, alias="imageUrls")
    is_marketplace_ready: Optional[bool] = Field(None, alias="isMarketplaceReady")
    readiness_score: Optional[int] = Field(None, alias="readinessScore")
    marketplaces: Optional[List[str]] = None

    class Config:
        populate_by_name = True

class ProductResponse(BaseModel):
    id: str
    userId: str = Field(..., alias="user_id")
    user_id: str
    title: str
    description: Optional[str] = ""
    category: str
    price: float
    currency: str = "INR"
    stock: int = 1
    sku: Optional[str] = None
    weight: Optional[str] = None
    dimensions: Optional[str] = None
    status: str = "published"
    keywords: List[str] = Field(default_factory=list)
    imageUrls: List[str] = Field(default_factory=list, alias="image_urls")
    image_urls: List[str] = Field(default_factory=list)
    isMarketplaceReady: bool = Field(True, alias="is_marketplace_ready")
    is_marketplace_ready: bool = True
    readinessScore: int = Field(85, alias="readiness_score")
    readiness_score: int = 85
    marketplaces: List[str] = Field(default_factory=list)
    createdAt: datetime = Field(..., alias="created_at")
    created_at: datetime
    updatedAt: datetime = Field(..., alias="updated_at")
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class ProductListResponse(BaseModel):
    products: List[ProductResponse]

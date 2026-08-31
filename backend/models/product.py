import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=True)
    price = Column(Float, default=0.0)
    currency = Column(String, default="INR")
    stock = Column(Integer, default=1)
    sku = Column(String, nullable=True)
    weight = Column(String, nullable=True)
    dimensions = Column(String, nullable=True)
    status = Column(String, default="published")  # draft, published, archived
    keywords = Column(JSON, default=list)
    image_urls = Column(JSON, default=list)
    is_marketplace_ready = Column(Boolean, default=True)
    readiness_score = Column(Integer, default=85)
    marketplaces = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")

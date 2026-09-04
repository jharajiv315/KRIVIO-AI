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
    material = Column(String, nullable=True)
    short_description = Column(String, nullable=True)
    craft_story = Column(String, nullable=True)
    hsn_code = Column(String, nullable=True)
    wholesale_price = Column(Float, nullable=True)
    mrp = Column(Float, nullable=True)
    moq = Column(Integer, default=1)
    lead_time = Column(String, default="3-5 business days")
    brand = Column(String, nullable=True)
    color = Column(String, nullable=True)
    origin_state = Column(String, nullable=True)
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

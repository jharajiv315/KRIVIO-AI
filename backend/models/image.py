import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String, nullable=False)
    storage_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="images")
    product = relationship("Product", back_populates="images")

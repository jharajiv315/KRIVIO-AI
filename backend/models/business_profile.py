import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    business_name = Column(String, nullable=False)
    business_type = Column(String, nullable=True)  # Handicrafts, Pottery, Weaving, Agriculture
    description = Column(String, nullable=True)
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    village = Column(String, nullable=True)
    pin_code = Column(String, nullable=True)
    language = Column(String, default="Hindi")
    years_in_business = Column(Integer, default=1)
    website = Column(String, nullable=True)
    social_links = Column(JSON, default=dict)
    brand_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    business_registration = Column(String, nullable=True)
    gst_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="business_profile")

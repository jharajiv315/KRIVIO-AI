import datetime
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    supabase_user_id = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    google_id = Column(String, nullable=True, index=True)
    phone_number = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    role = Column(String, default="artisan")  # artisan, shg, farmer, small_business
    preferred_language = Column(String(10), default="en", nullable=False)  # en, hi, mr, gu, ta, bn, as
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Convenience alias properties
    @property
    def name(self) -> str:
        return self.full_name

    @name.setter
    def name(self, value: str):
        self.full_name = value

    @property
    def phone(self) -> str:
        return self.phone_number

    @phone.setter
    def phone(self, value: str):
        self.phone_number = value

    # Relationships
    business_profile = relationship("BusinessProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    products = relationship("Product", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    subscription = relationship("Subscription", back_populates="user", uselist=False, cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    images = relationship("ProductImage", back_populates="user", cascade="all, delete-orphan")

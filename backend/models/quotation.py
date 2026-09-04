import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quotation_number = Column(String, unique=True, nullable=False, index=True)
    buyer_name = Column(String, nullable=False)
    buyer_company = Column(String, nullable=True)
    buyer_email = Column(String, nullable=True)
    buyer_phone = Column(String, nullable=True)
    buyer_address = Column(String, nullable=True)
    buyer_gst = Column(String, nullable=True)
    currency = Column(String, default="INR")
    subtotal = Column(Float, default=0.0)
    tax_total = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    valid_until = Column(String, nullable=True)
    commercial_notes = Column(String, nullable=True)
    shipping_terms = Column(String, nullable=True)
    payment_terms = Column(String, nullable=True)
    status = Column(String, default="generated")  # draft, generated, sent, archived
    items_snapshot = Column(JSON, default=list)
    seller_snapshot = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationship
    user = relationship("User")

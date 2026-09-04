import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class VoiceAsset(Base):
    __tablename__ = "voice_assets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    whatsapp_message_id = Column(String, unique=True, index=True, nullable=True)
    whatsapp_sender_id = Column(String, index=True, nullable=True)
    phone_number = Column(String, index=True, nullable=True)
    input_type = Column(String, default="voice")  # "voice" or "text"
    language = Column(String, default="hi-IN")
    transcript = Column(Text, nullable=True)
    intent = Column(String, nullable=True)
    entities = Column(JSON, default=dict)
    response_text = Column(Text, nullable=True)
    response_audio = Column(Text, nullable=True)
    processing_status = Column(String, default="RECEIVED", index=True)
    error_code = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    provider_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="voice_assets")

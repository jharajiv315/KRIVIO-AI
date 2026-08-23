from sqlalchemy import Column, String
from backend.database import Base

class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    eligibility = Column(String, nullable=True)
    category = Column(String, nullable=True)
    link = Column(String, nullable=True)

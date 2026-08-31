"""
Imports all SQLAlchemy ORM models so Alembic can detect them for migrations.
"""
from backend.database import Base
from backend.models.user import User
from backend.models.business_profile import BusinessProfile
from backend.models.product import Product
from backend.models.conversation import Conversation
from backend.models.government_scheme import GovernmentScheme
from backend.models.subscription import Subscription
from backend.models.activity import Activity
from backend.models.image import ProductImage

__all__ = [
    "Base",
    "User",
    "BusinessProfile",
    "Product",
    "Conversation",
    "GovernmentScheme",
    "Subscription",
    "Activity",
    "ProductImage"
]

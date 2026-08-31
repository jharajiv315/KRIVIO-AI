import logging
from sqlalchemy import text
from backend.database import engine, Base

# Import all SQLAlchemy ORM models so they are registered with Base.metadata
from backend.models.user import User
from backend.models.business_profile import BusinessProfile
from backend.models.product import Product
from backend.models.conversation import Conversation
from backend.models.subscription import Subscription
from backend.models.government_scheme import GovernmentScheme
from backend.models.activity import Activity
from backend.models.image import ProductImage

logger = logging.getLogger(__name__)

def verify_db_connection() -> bool:
    """
    Attempts to execute a ping query against PostgreSQL.
    Returns True if successful, False otherwise.
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Successfully connected to PostgreSQL database.")
        return True
    except Exception as e:
        logger.error(f"Failed to connect to PostgreSQL: {e}")
        return False

def init_db():
    """
    Creates all tables in PostgreSQL if they do not exist.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully in PostgreSQL.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")

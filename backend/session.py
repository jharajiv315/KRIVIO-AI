from typing import Generator
from backend.database import SessionLocal

def get_db() -> Generator:
    """
    FastAPI dependency that provides a SQLAlchemy database session.
    Ensures the connection is cleanly closed after each request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

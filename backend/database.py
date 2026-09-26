import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Default to local postgresql connection string for local development
raw_database_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/krivio_db"
)

# Normalize postgres:// to postgresql:// for SQLAlchemy 1.4/2.0 compatibility (standard Render/Supabase convention)
if raw_database_url.startswith("postgres://"):
    DATABASE_URL = raw_database_url.replace("postgres://", "postgresql://", 1)
else:
    DATABASE_URL = raw_database_url

# Configure connect_args for SSL if required by Supabase or cloud PostgreSQL
connect_args = {}
if "sslmode=require" in DATABASE_URL or os.getenv("DB_SSL_REQUIRE", "").lower() == "true":
    connect_args["sslmode"] = "require"

# SQLAlchemy Engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=int(os.getenv("DB_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "10")),
    connect_args=connect_args
)

# SessionLocal class for DB session instantiation
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy ORM models
Base = declarative_base()


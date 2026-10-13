import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Load .env explicitly
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(backend_dir, ".env")
load_dotenv(dotenv_path=env_path)

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")

is_production = os.environ.get("RENDER") == "true"
use_sqlite = os.environ.get("USE_LOCAL_SQLITE", "true").lower() in ("true", "1", "yes")

if (use_sqlite and not is_production) or not SQLALCHEMY_DATABASE_URL:
    if is_production and not SQLALCHEMY_DATABASE_URL:
        raise ValueError("CRITICAL: DATABASE_URL environment variable is missing on Render. Please set it in the Render Dashboard.")
    print("INFO: Using local SQLite database.")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
else:
    # SQLAlchemy 2.0+ with psycopg3 requires postgresql+psycopg://
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
    elif SQLALCHEMY_DATABASE_URL.startswith("postgresql://") and not SQLALCHEMY_DATABASE_URL.startswith("postgresql+psycopg://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"ERROR: Failed to create database engine: {e}")
    engine = None
    SessionLocal = None

Base = declarative_base()

# Dependency
def get_db():
    if not SessionLocal:
        raise RuntimeError("Database is not configured. Please set DATABASE_URL.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

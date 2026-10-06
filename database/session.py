import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.settings import settings
from database.models import Base

# Normalize Database URL (Render provides postgres://, SQLAlchemy requires postgresql://)
raw_db_url = settings.DATABASE_URL
if raw_db_url.startswith("postgres://"):
    db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
else:
    db_url = raw_db_url

connect_args = {}
engine_kwargs = {"echo": False}

if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    # Production PostgreSQL connection resilience
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = int(os.getenv("DB_POOL_SIZE", "10"))
    engine_kwargs["max_overflow"] = int(os.getenv("DB_MAX_OVERFLOW", "20"))

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency for obtaining database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

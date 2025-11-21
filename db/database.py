"""Database connection and session management"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from db.models import Base

# Get database URL from environment or construct from parts
def get_database_url():
    # Try DATABASE_URL first (standard)
    url = os.environ.get('DATABASE_URL')
    if url:
        # Fix postgres:// to postgresql:// if needed (some platforms use old format)
        if url.startswith('postgres://'):
            url = url.replace('postgres://', 'postgresql://', 1)
        return url
    
    # Try individual env vars
    host = os.environ.get('PGHOST', 'localhost')
    port = os.environ.get('PGPORT', '5432')
    user = os.environ.get('PGUSER', 'postgres')
    password = os.environ.get('PGPASSWORD', '')
    database = os.environ.get('PGDATABASE', 'postgres')
    
    return f"postgresql://{user}:{password}@{host}:{port}/{database}"


# Load environment file (.env.local for dev, .env.dokku for production)
def load_env_file():
    # Check for local dev config first
    local_env = os.path.join(os.path.dirname(__file__), '.env.local')
    dokku_env = os.path.join(os.path.dirname(__file__), '.env.dokku')
    
    env_file = local_env if os.path.exists(local_env) else dokku_env
    
    if os.path.exists(env_file):
        print(f"Loading database config from {os.path.basename(env_file)}")
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ.setdefault(key, value)


# Initialize
load_env_file()
DATABASE_URL = get_database_url()

# Create engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verify connections before using
    echo=False  # Set to True for SQL debugging
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables. Idempotent - safe to call multiple times."""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created/verified")


@contextmanager
def get_db():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db_session() -> Session:
    """Dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

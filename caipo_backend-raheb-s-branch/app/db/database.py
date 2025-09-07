# File: app/db/database.py

import logging
from pathlib import Path  
from sqlmodel import create_engine, SQLModel, Session

logger = logging.getLogger(__name__)

DATABASE_URL = "sqlite:///./caipo_prototype.db"
# Get the path to the SQLite file from the URL
DB_FILE_PATH = Path(DATABASE_URL.split("///")[1])

engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})

def create_db_and_tables():
    """
    Initializes the database.
    - If the DB file doesn't exist, it logs that it's creating a new one.
    - If it exists, it logs that it's just ensuring tables are present.
    - The create_all call is idempotent and safe to run every time.
    """
    # Check if the database file already exists
    if not DB_FILE_PATH.exists():
        logger.info(f"Database file not found. Creating new database at: {DB_FILE_PATH}")
    else:
        logger.info(f"Database already exists at: {DB_FILE_PATH}. Ensuring all tables are created.")
    
    try:
        # This will create tables if they don't exist, and do nothing if they do.
        SQLModel.metadata.create_all(engine)
        logger.info("Database initialization complete.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        raise

def get_session():
    """
    FastAPI dependency that yields a database session.
    """
    with Session(engine) as session:
        yield session
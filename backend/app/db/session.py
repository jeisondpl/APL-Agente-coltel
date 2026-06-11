from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

USER = settings.postgres_user
PASSWORD = settings.postgres_password
DB = settings.postgres_db
HOST = settings.postgres_host
PORT = settings.postgres_port

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB}"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency to get the database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# In SQLite, we need to allow multiple threads to interact with the same connection
connect_args = {"check_same_thread": False} if "sqlite" in settings.get_database_url else {}

engine = create_engine(
    settings.get_database_url,
    connect_args=connect_args,
    echo=settings.ENVIRONMENT == "development" # Print SQL statements in development
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to yield database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

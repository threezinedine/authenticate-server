import os
# Programmatically enforce the test environment before the application is even imported!
os.environ["ENVIRONMENT"] = "test"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from server import app
from app.database.session import Base, get_db

# Setup an entirely isolated in-memory SQLite engine
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool, # Keep connection static across threads for memory DB
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Override the application's default database dependency
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    # Spin up fresh tables in the in-memory SQLite database for test isolation
    Base.metadata.create_all(bind=engine)
    
    with TestClient(app) as c:
        yield c
        
    # Tear down tables after test
    Base.metadata.drop_all(bind=engine)

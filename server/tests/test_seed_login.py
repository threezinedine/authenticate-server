import pytest
import jwt
from fastapi.testclient import TestClient
from app.config import settings
from server import app
from app.seed import seed_database

# We import the exact SQLite memory engine reference the test runner uses natively
from tests.conftest import TestingSessionLocal

def test_seeded_admin_can_login(client):
    """
    Verifies that the automatically seeded Admin user can successfully authenticate and receive a JWT.
    """
    db = TestingSessionLocal()
    seed_database(db)
    db.close()

    response = client.post(
        "/api/v1/login",
        json={
            "email": settings.ADMIN_EMAIL,
            "password": settings.ADMIN_PASSWORD
        }
    )
    
    # Assert successful negotiation
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    
    # Verify the profile payload exposes the correct role natively in the token
    token_payload = jwt.decode(data["access_token"], options={"verify_signature": False})
    assert data["user"]["email"] == settings.ADMIN_EMAIL
    assert "admin" in token_payload.get("roles", [])

def test_seeded_normal_user_can_login(client):
    """
    Verifies that the automatically seeded Test user can successfully authenticate and receive a JWT.
    """
    db = TestingSessionLocal()
    seed_database(db)
    db.close()

    response = client.post(
        "/api/v1/login",
        json={
            "email": settings.TEST_USER_EMAIL,
            "password": settings.TEST_USER_PASSWORD
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    
    assert data["user"]["email"] == settings.TEST_USER_EMAIL
    token_payload = jwt.decode(data["access_token"], options={"verify_signature": False})
    assert "user" in token_payload.get("roles", [])

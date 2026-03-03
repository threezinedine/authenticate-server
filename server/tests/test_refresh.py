import pytest
import jwt
from datetime import timedelta
from app.services.auth import create_refresh_token, create_access_token
from app.database.models import User, UserProfile
from app.services.i18n import Translator
from tests.conftest import TestingSessionLocal
from datetime import datetime, timezone

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

BASE_USER = {
    "email": "refresh_test@example.com",
    "password": "securepassword123",
    "first_name": "Test",
    "last_name": "User"
}

def register_base_user(client):
    """Register dummy user so it exists in DB to be refreshed."""
    client.post("/api/v1/register/", json=BASE_USER)

@pytest.fixture
def dummy_refresh_token(db_session, client):
    register_base_user(client)
    user = db_session.query(User).filter(User.email == BASE_USER["email"]).first()
    # Backdate the test token by 1 second so that when the API generates a new one,
    # the exact `iat` and `exp` timestamps are mathematically different.
    past_time = datetime.now(timezone.utc) - timedelta(seconds=1)
    return create_refresh_token(user, start_time=past_time)

@pytest.fixture
def dummy_access_token(db_session, client):
    register_base_user(client)
    user = db_session.query(User).filter(User.email == BASE_USER["email"]).first()
    return create_access_token(user)

def test_valid_refresh(client, dummy_refresh_token):
    register_base_user(client)
    
    payload = {"refresh_token": dummy_refresh_token}
    response = client.post("/api/v1/refresh/", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    
    # 1. Verify the newly generated access_token is valid and contains user info
    from app.services.auth import verify_access_token, verify_refresh_token
    new_access_payload = verify_access_token(data["access_token"])
    assert new_access_payload["email"] == BASE_USER["email"]
    
    # 2. Verify the newly generated refresh_token is valid
    new_refresh_payload = verify_refresh_token(data["refresh_token"])
    assert new_refresh_payload["sub"] is not None
    
    # 3. Ensure the newly rotated refresh token is cryptographically DIFFERENT from the used token
    assert data["refresh_token"] != dummy_refresh_token
    
def test_expired_refresh_token(client, db_session):
    register_base_user(client)
    user = db_session.query(User).filter(User.email == BASE_USER["email"]).first()
    
    # Generate expired token
    expired_token = create_refresh_token(user, expires_delta=timedelta(minutes=-1))
    
    payload = {"refresh_token": expired_token}
    response = client.post("/api/v1/refresh/", json=payload)
    
    assert response.status_code == 401
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_TOKEN")
    
def test_invalid_signature_tampered_token(client, dummy_refresh_token):
    register_base_user(client)
    
    payload = {"refresh_token": dummy_refresh_token + "a"}
    response = client.post("/api/v1/refresh/", json=payload)
    
    assert response.status_code == 401
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_TOKEN")

def test_token_type_mismatch(client, dummy_access_token):
    # Sends an access token in the body instead of a refresh token
    register_base_user(client)
    
    payload = {"refresh_token": dummy_access_token}
    response = client.post("/api/v1/refresh/", json=payload)
    
    assert response.status_code == 401
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_TOKEN")

def test_missing_payload(client):
    # Empty body
    response = client.post("/api/v1/refresh/", json={})
    assert response.status_code == 422
    assert response.json()["detail"][0]["type"] == "missing"
    assert response.json()["detail"][0]["loc"] == ["body", "refresh_token"]

def test_refresh_user_deleted(client, dummy_refresh_token, db_session):
    # The token is cryptographically valid, but the user is hard-deleted from DB
    user = db_session.query(User).filter(User.email == BASE_USER["email"]).first()
    db_session.delete(user)
    db_session.commit()
    
    payload = {"refresh_token": dummy_refresh_token}
    response = client.post("/api/v1/refresh/", json=payload)
    
    assert response.status_code == 401
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_TOKEN")

def test_refresh_user_deactivated(client, dummy_refresh_token, db_session):
    # The token is valid, but the user was banned/deactivated
    user = db_session.query(User).filter(User.email == BASE_USER["email"]).first()
    user.is_active = False
    db_session.commit()
    
    payload = {"refresh_token": dummy_refresh_token}
    response = client.post("/api/v1/refresh/", json=payload)
    
    assert response.status_code == 401
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_TOKEN")

def test_refresh_missing_sub_claim(client):
    from app.config import settings
    # Encode a totally valid token but missing the "sub" claim
    claims = {
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
        "iat": datetime.now(timezone.utc),
        "type": "refresh"
    }
    missing_sub_token = jwt.encode(claims, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.JWT_REFRESH_ALGORITHM)
    
    payload = {"refresh_token": missing_sub_token}
    response = client.post("/api/v1/refresh/", json=payload)
    
    assert response.status_code == 401
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_TOKEN")

def test_refresh_malformed_token(client):
    # Pass arbitrary malicious string instead of a 3-part JWT
    payload = {"refresh_token": "Bearer yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"}
    response = client.post("/api/v1/refresh/", json=payload)
    
    # Ideally should fail graceful verification
    assert response.status_code == 401
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_TOKEN")

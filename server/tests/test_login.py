import jwt
from app.services.i18n import Translator

BASE_USER = {
    "email": "login_test@example.com",
    "password": "securepassword123",
    "first_name": "Test",
    "last_name": "User"
}

def register_base_user(client):
    """Helper to pre-register a user for login tests."""
    client.post("/api/v1/register/", json=BASE_USER)

def test_valid_login(client):
    register_base_user(client)
    
    payload = {
        "email": BASE_USER["email"],
        "password": BASE_USER["password"]
    }
    response = client.post("/api/v1/login/", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == BASE_USER["email"]
    
    # Verify the access_token contains the necessary claims for SDKs without Auth Service lookups
    token_payload = jwt.decode(data["access_token"], options={"verify_signature": False})
    assert "sub" in token_payload # User ID (UUID)
    assert token_payload["email"] == BASE_USER["email"]
    assert "roles" in token_payload # Should be a list, e.g., ["user"]
    assert token_payload["first_name"] == BASE_USER["first_name"]
    assert token_payload["last_name"] == BASE_USER["last_name"]
    
    # Verify the refresh_token is symmetrically structured (no public claim leakage)
    refresh_payload = jwt.decode(data["refresh_token"], options={"verify_signature": False})
    assert refresh_payload["type"] == "refresh"
    assert "sub" in refresh_payload
    assert "email" not in refresh_payload

def test_unregistered_email(client):
    payload = {
        "email": "nonexistent@example.com",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/login/", json=payload)
    assert response.status_code == 401
    
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_CREDENTIALS")

def test_invalid_password(client):
    register_base_user(client)
    
    payload = {
        "email": BASE_USER["email"],
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/login/", json=payload)
    assert response.status_code == 401
    
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_CREDENTIALS")

def test_case_sensitive_login_fails(client):
    register_base_user(client)
    
    payload = {
        # Random casing. E.g. lOgIn_tEst@ExAmPle.cOm
        "email": "LOGIN_TEST@EXAMPLE.COM",
        "password": BASE_USER["password"]
    }
    response = client.post("/api/v1/login/", json=payload)
    assert response.status_code == 401
    
    t = Translator("en")
    assert response.json()["detail"] == t.translate("INVALID_CREDENTIALS")

def test_invalid_email_format(client):
    payload = {
        "email": "not-an-email",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/login/", json=payload)
    assert response.status_code == 422
    
    error = response.json()["detail"][0]
    assert error["type"] == "value_error"
    assert error["loc"] == ["body", "email"]

def test_missing_email(client):
    payload = {
        "password": "securepassword123"
    }
    response = client.post("/api/v1/login/", json=payload)
    assert response.status_code == 422
    
    error = response.json()["detail"][0]
    assert error["type"] == "missing"
    assert error["loc"] == ["body", "email"]

def test_missing_password(client):
    payload = {
        "email": "test@example.com"
    }
    response = client.post("/api/v1/login/", json=payload)
    assert response.status_code == 422
    
    error = response.json()["detail"][0]
    assert error["type"] == "missing"
    assert error["loc"] == ["body", "password"]

def test_login_i18n_invalid_credentials(client):
    # Try invalid password with Spanish locale
    register_base_user(client)
    
    payload = {
        "email": BASE_USER["email"],
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/login/", json=payload, headers={"Accept-Language": "es-ES,es;q=0.9"})
    assert response.status_code == 401
    
    t = Translator("es")
    assert response.json()["detail"] == t.translate("INVALID_CREDENTIALS")

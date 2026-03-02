from app.services.i18n import Translator

BASE_PAYLOAD = {
    "email": "test@example.com",
    "password": "securepassword123",
    "first_name": "Test",
    "last_name": "User"
}

def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from server!"}

def test_valid_register(client):
    # Test valid registration
    response = client.post("/api/v1/register/", json=BASE_PAYLOAD)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == BASE_PAYLOAD["email"]
    assert "id" in data
    
    t = Translator("en")
    assert data["message"] == t.translate("REGISTER_SUCCESS")

def test_duplicate_email(client):
    # First registration should succeed
    client.post("/api/v1/register/", json=BASE_PAYLOAD)
    
    # Second registration with same email should fail
    duplicate_response = client.post("/api/v1/register/", json=BASE_PAYLOAD)
    assert duplicate_response.status_code == 400
    
    t = Translator("en")
    assert duplicate_response.json()["detail"] == t.translate("EMAIL_ALREADY_REGISTERED")

def test_invalid_email(client):
    payload = BASE_PAYLOAD.copy()
    payload["email"] = "not-an-email"
    
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 422
    
    error = response.json()["detail"][0]
    assert error["type"] == "value_error"
    assert error["loc"] == ["body", "email"]

def test_invalid_password(client):
    payload = BASE_PAYLOAD.copy()
    payload["password"] = "short" # Less than 8 chars
    
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 422
    
    error = response.json()["detail"][0]
    assert error["type"] == "string_too_short"
    assert error["loc"] == ["body", "password"]

def test_missing_email(client):
    payload = BASE_PAYLOAD.copy()
    del payload["email"]
    
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 422
    
    error = response.json()["detail"][0]
    assert error["type"] == "missing"
    assert error["loc"] == ["body", "email"]

def test_missing_password(client):
    payload = BASE_PAYLOAD.copy()
    del payload["password"]
    
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 422
    
    error = response.json()["detail"][0]
    assert error["type"] == "missing"
    assert error["loc"] == ["body", "password"]

def test_password_too_long(client):
    payload = BASE_PAYLOAD.copy()
    payload["password"] = "a" * 73
    
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 422
    
    error = response.json()["detail"][0]
    assert error["type"] == "string_too_long"
    assert error["loc"] == ["body", "password"]

def test_register_i18n_success(client):
    payload = BASE_PAYLOAD.copy()
    
    # Test valid registration with Vietnamese header
    response = client.post("/api/v1/register/", json=payload, headers={"Accept-Language": "vi-VN,vi;q=0.9"})
    assert response.status_code == 201
    
    t = Translator("vi")
    assert response.json()["message"] == t.translate("REGISTER_SUCCESS")

def test_register_i18n_duplicate_email(client):
    # Register first time (using default)
    client.post("/api/v1/register/", json=BASE_PAYLOAD)
    
    # Second registration with same email should fail, requested in Spanish
    response = client.post("/api/v1/register/", json=BASE_PAYLOAD, headers={"Accept-Language": "es-ES,es;q=0.9"})
    assert response.status_code == 400
    
    t = Translator("es")
    assert response.json()["detail"] == t.translate("EMAIL_ALREADY_REGISTERED")
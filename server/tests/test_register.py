def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from server!"}

def test_valid_register(client):
    payload = {
        "email": "test@example.com",
        "password": "securepassword123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    # Test valid registration
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert data["message"] == "User registered successfully."

def test_duplicate_email(client):
    payload = {
        "email": "duplicate@example.com",
        "password": "securepassword123",
        "first_name": "Test",
        "last_name": "User"
    }
    
    # First registration should succeed
    client.post("/api/v1/register/", json=payload)
    
    # Second registration with same email should fail
    duplicate_response = client.post("/api/v1/register/", json=payload)
    assert duplicate_response.status_code == 400
    assert duplicate_response.json()["detail"] == "Email already registered"

def test_invalid_email(client):
    payload = {
        "email": "not-an-email",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "value_error",
                "loc": ["body", "email"],
                "msg": "value is not a valid email address: An email address must have an @-sign.",
                "input": "not-an-email",
                "ctx": {"reason": "An email address must have an @-sign."}
            }
        ]
    }

def test_invalid_password(client):
    payload = {
        "email": "test2@example.com",
        "password": "short" # Less than 8 chars
    }
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "string_too_short",
                "loc": ["body", "password"],
                "msg": "String should have at least 8 characters",
                "input": "short",
                "ctx": {"min_length": 8}
            }
        ]
    }

def test_missing_email(client):
    payload = {
        "password": "securepassword123"
    }
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "missing",
                "loc": ["body", "email"],
                "msg": "Field required",
                "input": {"password": "securepassword123"}
            }
        ]
    }

def test_missing_password(client):
    payload = {
        "email": "test3@example.com"
    }
    response = client.post("/api/v1/register/", json=payload)
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "missing",
                "loc": ["body", "password"],
                "msg": "Field required",
                "input": {"email": "test3@example.com"}
            }
        ]
    }

def test_password_too_long(client):
    # Bcrypt inherently fails if a password exceeds 72 bytes. 
    # Attempting to register with 73 characters should be structurally prevented.
    payload = {
        "email": "longpwd@example.com",
        "password": "a" * 73
    }
    response = client.post("/api/v1/register/", json=payload)
    # This requires adding `max_length=72` to the Pydantic schema later!
    assert response.status_code == 422
    assert response.json() == {
        "detail": [
            {
                "type": "string_too_long",
                "loc": ["body", "password"],
                "msg": "String should have at most 72 characters",
                "input": "a" * 73,
                "ctx": {"max_length": 72}
            }
        ]
    }
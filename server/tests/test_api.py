def test_read_main(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello from server!"}

def test_register_user(client):
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
    
    # Test duplicate email rejection
    duplicate_response = client.post("/api/v1/register/", json=payload)
    assert duplicate_response.status_code == 400
    assert duplicate_response.json()["detail"] == "Email already registered"

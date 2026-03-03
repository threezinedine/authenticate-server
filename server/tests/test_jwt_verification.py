import pytest
import jwt
from datetime import timedelta
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from app.services.auth import create_access_token, create_refresh_token, verify_access_token, verify_refresh_token
from app.database.models import User, UserProfile
from app.config import settings

@pytest.fixture
def mock_user():
    user = User(
        id="123e4567-e89b-12d3-a456-426614174000",
        email="test_verify@example.com"
    )
    user.profile = UserProfile(first_name="Verify", last_name="User")
    user.roles = []
    return user

@pytest.fixture
def rogue_rsa_key():
    """Generates a complete separate RSA key simulating a forged or old signature."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    return private_key

# --- Access Token (RS256) Verification Tests ---

def test_verify_access_token_success(mock_user):
    token = create_access_token(mock_user)
    payload = verify_access_token(token)
    
    assert payload["sub"] == mock_user.id
    assert payload["email"] == mock_user.email
    assert payload["type"] == "access"

def test_verify_access_token_expired(mock_user):
    # Create a token that intentionally expired 1 minute ago
    token = create_access_token(mock_user, expires_delta=timedelta(minutes=-1))
    
    with pytest.raises(jwt.ExpiredSignatureError):
        verify_access_token(token)

def test_verify_access_token_invalid_signature(mock_user, rogue_rsa_key):
    # We construct a perfectly valid token, but using a rogue RSA key
    claims = {
        "sub": str(mock_user.id),
        "email": mock_user.email,
        "type": "access"
    }
    forged_token = jwt.encode(claims, rogue_rsa_key, algorithm=settings.JWT_ALGORITHM, headers={"kid": "internal-rsa-1"})
    
    # The verifier should mathematically reject the signature against its own Public Key
    with pytest.raises(jwt.InvalidSignatureError):
        verify_access_token(forged_token)

def test_verify_access_token_wrong_type(mock_user):
    # Attackers might try to use a long-lived Refresh Token to access target services
    refresh_token = create_refresh_token(mock_user)
    
    # The access token verifier should explicitly reject tokens that do not possess the `type: access` claim
    with pytest.raises(ValueError, match="Invalid token type"):
        verify_access_token(refresh_token)
        
def test_verify_access_token_tampered(mock_user):
    token = create_access_token(mock_user)
    tampered_token = token + "A" # Break HMAC / RSA structure
    
    with pytest.raises(jwt.DecodeError):
        verify_access_token(tampered_token)

# --- Refresh Token (HS256) Verification Tests ---

def test_verify_refresh_token_success(mock_user):
    token = create_refresh_token(mock_user)
    payload = verify_refresh_token(token)
    
    assert payload["sub"] == mock_user.id
    assert payload["type"] == "refresh"

def test_verify_refresh_token_expired(mock_user):
    # Expired 1 minute ago
    token = create_refresh_token(mock_user, expires_delta=timedelta(minutes=-1))
    
    with pytest.raises(jwt.ExpiredSignatureError):
        verify_refresh_token(token)

def test_verify_refresh_token_invalid_signature(mock_user):
    # Encode with wrong symmetric secret
    claims = {"sub": str(mock_user.id), "type": "refresh"}
    forged_token = jwt.encode(claims, "completely-wrong-secret-key-1234", algorithm=settings.JWT_REFRESH_ALGORITHM)
    
    with pytest.raises(jwt.InvalidSignatureError):
        verify_refresh_token(forged_token)

def test_verify_refresh_token_wrong_type(mock_user):
    # Passing an access token to the refresh verifier
    access_token = create_access_token(mock_user)
    
    with pytest.raises(ValueError, match="Invalid token type"):
        verify_refresh_token(access_token)

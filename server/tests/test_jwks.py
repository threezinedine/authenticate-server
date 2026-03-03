import pytest
import jwt
from fastapi.testclient import TestClient
from app.config import settings

def test_jwks_valid_response_format(client: TestClient):
    response = client.get("/.well-known/jwks.json")
    
    # Assert HTTP 200 OK
    assert response.status_code == 200
    data = response.json()
    
    # RFC 7517: MUST contain a "keys" array
    assert "keys" in data
    assert isinstance(data["keys"], list)
    assert len(data["keys"]) >= 1

def test_jwks_required_attributes(client: TestClient):
    response = client.get("/.well-known/jwks.json")
    data = response.json()
    keys = data.get("keys", [])
    
    # Check that at least one key matches our configured Kid (if any is configured) or just check standard RS256 attributes
    valid_key_found = False
    for jwk in keys:
        if jwk.get("kid") == "internal-rsa-1":
            assert jwk.get("kty") == "RSA"
            assert jwk.get("alg") == "RS256"
            assert jwk.get("use") == "sig"
            assert "n" in jwk
            assert "e" in jwk
            
            # The Exponent for standard RSA is almost always AQAB (65537)
            assert jwk.get("e") == "AQAB"
            
            valid_key_found = True
            
    assert valid_key_found, "Could not find the expected RSA public key in the JWKS endpoint."

def test_jwks_security_no_private_keys_escaped(client: TestClient):
    """
    CRITICAL SECURITY TEST: Ensure that private key components (d, p, q, dp, dq, qi)
    are NEVER serialized and exposed to the public internet.
    """
    response = client.get("/.well-known/jwks.json")
    data = response.json()
    
    private_key_attributes = ["d", "p", "q", "dp", "dq", "qi"]
    
    for jwk in data.get("keys", []):
        for attr in private_key_attributes:
            assert attr not in jwk, f"SEVERE SECURITY FLAW: Private key attribute '{attr}' was leaked in JWKS!"

def test_jwks_cache_and_cors_headers(client: TestClient):
    response = client.get("/.well-known/jwks.json")
    
    assert response.status_code == 200
    
    # Check for CORS (Allow ANY origin to read the public keys)
    # Note: Depending on middleware, this might only appear on OPTIONS requests, 
    # but a well-configured public API often includes it on GET too.
    assert response.headers.get("access-control-allow-origin") == "*"
    
    # Check for Cache-Control (SDKs should cache this heavily, e.g., 1 hour)
    cache_control = response.headers.get("cache-control", "")
    assert "max-age" in cache_control
    assert "public" in cache_control

def test_jwks_cross_compatibility_verification(client: TestClient):
    """
    E2E Test: Generates a real Access Token from the Login flow (or auth service directly),
    fetches the JWKS endpoint, parses it into an RSA Public Key, and proves the token
    can be verified perfectly using ONLY the public endpoint data.
    """
    from app.services.auth import create_access_token
    from app.database.models import User
    
    user = User(id="test-e2e-uuid", email="jwks_test@example.com")
    access_token = create_access_token(user)
    
    # Fetch public keys
    response = client.get("/.well-known/jwks.json")
    jwks_data = response.json()
    
    # PyJWT has a built-in PyJWKClient that mimics what an SDK would do
    # Since we don't have a live HTTP server during TestClient, we feed it manually
    jwks = jwt.PyJWKSet.from_dict(jwks_data)
    
    # Get the unverified header to find the active 'kid'
    unverified_header = jwt.get_unverified_header(access_token)
    kid = unverified_header.get("kid")
    
    assert kid is not None, "Access Token is missing 'kid' in header"
    
    # Find the specific public key mathematically
    # Note: In a real SDK, PyJWKClient(url).get_signing_key_from_jwt(token) does this automatically
    signing_key = None
    for key in jwks.keys:
        if key.key_id == kid:
            signing_key = key
            break
            
    assert signing_key is not None, f"Could not find public key with kid={kid} in JWKS"
    
    # Finally, mathematically decode the token using ONLY the remote public key
    decoded_payload = jwt.decode(
        access_token,
        signing_key.key,
        algorithms=["RS256"]
    )
    
    assert decoded_payload["sub"] == "test-e2e-uuid"
    assert decoded_payload["email"] == "jwks_test@example.com"

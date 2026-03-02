import jwt
from datetime import datetime, timezone, timedelta
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
import os
from app.config import settings

def get_or_create_rsa_key():
    """Loads the RSA Private Key or generates an ephemeral one in-memory for testing."""
    key_path = settings.RSA_PRIVATE_KEY_PATH
    
    if os.path.exists(key_path):
        with open(key_path, "rb") as f:
            # We explicitly don't use a password for the internal system key
            return serialization.load_pem_private_key(f.read(), password=None)
            
    # Generate an ephemeral key if running tests or missing a generated `.pem` file
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    
    # Attempt to write it so it persists on developer machines, but silently fail if no perm
    try:
        os.makedirs(os.path.dirname(key_path), exist_ok=True)
        with open(key_path, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ))
    except Exception:
        pass
        
    return private_key

_private_key = get_or_create_rsa_key()

def create_access_token(user, expires_delta: timedelta = timedelta(minutes=15)) -> str:
    """Generates an RS256 asynchronous Access Token embedding the necessary user SDK claims."""
    claims = {
        "sub": str(user.id),
        "email": user.email,
        "first_name": user.profile.first_name if user.profile else None,
        "last_name": user.profile.last_name if user.profile else None,
        "roles": [role.name for role in getattr(user, "roles", [])],
        "exp": datetime.now(timezone.utc) + expires_delta,
        "iat": datetime.now(timezone.utc),
        "type": "access"
    }
    
    headers = {"kid": "internal-rsa-1"}
    encoded_jwt = jwt.encode(claims, _private_key, algorithm=settings.JWT_ALGORITHM, headers=headers)
    return encoded_jwt

def create_refresh_token(user, expires_delta: timedelta = timedelta(days=30)) -> str:
    """Generates a long-lived HS256 refresh token strictly containing just the identity layer."""
    claims = {
        "sub": str(user.id),
        "exp": datetime.now(timezone.utc) + expires_delta,
        "iat": datetime.now(timezone.utc),
        "type": "refresh"
    }
    
    encoded_jwt = jwt.encode(claims, settings.JWT_REFRESH_SECRET_KEY, algorithm=settings.JWT_REFRESH_ALGORITHM)
    return encoded_jwt

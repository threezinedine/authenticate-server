"""
FastAPI dependencies for stateless JWT verification.
"""

from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from .jwks import AsyncJWKSCache
from .models import UserPayload

security = HTTPBearer()

_auth_config = {
    "jwks_cache": None,
    "algorithms": ["RS256"]
}

def configure_auth_client(jwks_url: str, algorithms: list[str] = None):
    """Configure the authentication client with the Identity Server's JWKS endpoint."""
    if algorithms is None:
        algorithms = ["RS256"]
    _auth_config["jwks_cache"] = AsyncJWKSCache(jwks_url)
    _auth_config["algorithms"] = algorithms

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserPayload:
    token = credentials.credentials
    jwks_cache = _auth_config.get("jwks_cache")
    
    if not jwks_cache:
        raise RuntimeError("ntt_client_auth is not configured. Call configure_auth_client() on startup.")
        
    try:
        unverified_header = jwt.get_unverified_header(token)
    except jwt.DecodeError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format")
        
    kid = unverified_header.get("kid")
    if not kid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing 'kid' header")
        
    try:
        signing_key = await jwks_cache.get_signing_key(kid)
        
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=_auth_config["algorithms"]
        )
        
        # Verify the custom NTT claim strictly matching 'access'
        if payload.get("type") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
            
        return UserPayload(**payload)
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.PyJWKClientError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unable to find signing key")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")

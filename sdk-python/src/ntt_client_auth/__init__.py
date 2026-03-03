"""
ntt_client_auth Python SDK

This SDK provides FastAPI dependencies and Pydantic models to statelessly verify 
Access Tokens against the NTT Authentication Service using an asynchronous JWKS cache.
"""

from .models import UserPayload
from .deps import get_current_user, configure_auth_client

__version__ = "0.1.0"
__all__ = ["UserPayload", "get_current_user", "configure_auth_client"]

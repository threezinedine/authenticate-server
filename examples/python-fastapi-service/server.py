from fastapi import FastAPI, Depends
from typing import Dict, Any
from contextlib import asynccontextmanager

from ntt_client_auth import get_current_user, UserPayload, configure_auth_client

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Configure the SDK to pull public keys from the locally running Auth Server
    configure_auth_client(jwks_url="http://127.0.0.1:8000/.well-known/jwks.json")
    yield

app = FastAPI(title="Dummy Target Microservice", lifespan=lifespan)

@app.get("/api/data")
async def get_secure_data(user: UserPayload = Depends(get_current_user)):
    """
    A protected route inside the target microservice.
    It mathematically validates the JWT supplied in `Authorization: Bearer <Token>`
    using the SDK cache, meaning 0 network calls were made to the Auth DB!
    """
    return {
        "status": "success",
        "message": "You have accessed the protected microservice data.",
        "identity_verified_statelessly": True,
        "user_email": getattr(user, "email", "UNKNOWN"),
        "user_id": getattr(user, "sub", "UNKNOWN"),
        "roles": getattr(user, "roles", [])
    }

from fastapi import APIRouter, Response
from app.services.auth import _private_key
from jwt.algorithms import RSAAlgorithm
import json

router = APIRouter(prefix="/.well-known", tags=["Discovery"])

@router.get("/jwks.json")
def get_jwks():
    """
    Returns the JSON Web Key Set (JWKS) containing the active public key.
    This allows microservices to independently verify the signature of JWT tokens
    without making network requests for each user authentication.
    """
    # Extract only the mathematically safe Public Key
    public_key = _private_key.public_key()
    
    # Serialize it to RFC 7517 JSON standard string using PyJWT's native RS256 algorithm
    jwk_json_str = RSAAlgorithm.to_jwk(public_key)
    jwk_dict = json.loads(jwk_json_str)
    
    # Append the identifier metadata matching the `kid` header injected into Access Tokens
    jwk_dict["kid"] = "internal-rsa-1"
    jwk_dict["use"] = "sig"
    jwk_dict["alg"] = "RS256"
    
    jwks = {"keys": [jwk_dict]}
    
    # Return as pure JSON with aggressive CORS and Cache-Control headers
    return Response(
        content=json.dumps(jwks),
        media_type="application/json",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=3600"
        }
    )

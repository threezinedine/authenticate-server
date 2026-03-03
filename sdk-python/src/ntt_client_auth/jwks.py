"""
JWKS Asynchronous Fetcher and Cacher.
"""

import httpx
import jwt
import asyncio
from typing import Dict, Any

class AsyncJWKSCache:
    def __init__(self, jwks_url: str):
        self.jwks_url = jwks_url
        self._keys: Dict[str, jwt.PyJWK] = {}
        self._lock = asyncio.Lock()
        
    async def fetch_keys(self) -> None:
        async with httpx.AsyncClient() as client:
            response = await client.get(self.jwks_url)
            response.raise_for_status()
            jwks_data = response.json()
            
            # Using PyJWT to parse the RFC 7517 specification format
            jwks = jwt.PyJWKSet.from_dict(jwks_data)
            self._keys = {key.key_id: key for key in jwks.keys if key.key_id}

    async def get_signing_key(self, kid: str) -> jwt.PyJWK:
        # Optimistic lock-free read for blazing fast access
        if kid in self._keys:
            return self._keys[kid]
            
        async with self._lock:
            # Double checked locking in case another async task just fetched it
            if kid in self._keys:
                return self._keys[kid]
            
            await self.fetch_keys()
            
            if kid in self._keys:
                return self._keys[kid]
                
        raise jwt.PyJWKClientError(f"Unable to find a signing key that matches the requested kid: '{kid}'")

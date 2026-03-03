from pydantic import BaseModel
from typing import List, Optional

class UserPayload(BaseModel):
    sub: str
    email: str
    roles: List[str] = []
    first_name: Optional[str] = None
    last_name: Optional[str] = None

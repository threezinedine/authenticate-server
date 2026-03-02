from pydantic import BaseModel, EmailStr, Field

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str | None = None
    last_name: str | None = None

class RegisterResponse(BaseModel):
    id: str
    email: str
    message: str

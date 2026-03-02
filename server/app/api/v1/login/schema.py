from pydantic import BaseModel, EmailStr

class LoginUser(BaseModel):
    id: str
    email: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: LoginUser

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

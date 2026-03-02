from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.api.v1.shared.dependencies import get_translator
from app.services.i18n import Translator
from app.services.auth import create_access_token, create_refresh_token
from .schema import LoginRequest, LoginResponse

router = APIRouter(prefix="/login", tags=["Authentication"])

@router.post("/", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db),
    translator: Translator = Depends(get_translator)
):
    user = db.query(User).filter(User.email == request.email).first()
    
    # Strictly enforce case sensitive emails (SQLite == is case sensitive, but this guarantees it across DB engines if collations differ)
    if not user or user.email != request.email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translator.translate("INVALID_CREDENTIALS")
        )
        
    if not user.check_password(request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translator.translate("INVALID_CREDENTIALS")
        )
        
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": user.id,
            "email": user.email
        }
    )

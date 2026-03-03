from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User
from app.api.v1.shared.dependencies import get_translator
from app.services.i18n import Translator
from app.services.auth import verify_refresh_token, create_access_token, create_refresh_token
import jwt
from .schema import RefreshRequest, RefreshResponse

router = APIRouter(prefix="/refresh", tags=["Authentication"])

@router.post("/", response_model=RefreshResponse, status_code=status.HTTP_200_OK)
def refresh_token_rotation(
    request: RefreshRequest,
    db: Session = Depends(get_db),
    translator: Translator = Depends(get_translator)
):
    try:
        # Decodes token, validates asymmetric/symmetric type, and checks expiration built-in
        payload = verify_refresh_token(request.refresh_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translator.translate("INVALID_TOKEN")
        )
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translator.translate("INVALID_TOKEN")
        )
        
    user = db.query(User).filter(User.id == user_id).first()
    
    # Token cryptographic signature was fully valid, but user doesn't exist anymore
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=translator.translate("INVALID_TOKEN")
        )
        
    access_token = create_access_token(user)
    new_refresh_token = create_refresh_token(user)
    
    return RefreshResponse(
        access_token=access_token,
        refresh_token=new_refresh_token
    )

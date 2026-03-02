from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, UserProfile
from .schema import RegisterRequest, RegisterResponse

router = APIRouter(prefix="/register", tags=["Registration"])

@router.post("/", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create the core user identity
    new_user = User(email=request.email)
    new_user.set_password(request.password)
    
    db.add(new_user)
    db.flush() # Flush to database to obtain the auto-generated User UUID
    
    # Create the associated user profile
    new_profile = UserProfile(
        user_id=new_user.id,
        first_name=request.first_name,
        last_name=request.last_name
    )
    db.add(new_profile)
    
    db.commit()
    db.refresh(new_user)
    
    return RegisterResponse(
        id=new_user.id,
        email=new_user.email,
        message="User registered successfully."
    )

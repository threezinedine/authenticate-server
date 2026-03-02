import uuid
from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone_number = Column(String(20), nullable=True)
    avatar_path = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="profile")

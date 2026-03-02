import uuid
from sqlalchemy import Column, String, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from app.database.session import Base

class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    provider = Column(String(50), nullable=False) # e.g. "google"
    provider_account_id = Column(String(255), nullable=False)
    access_token = Column(Text, nullable=True)
    expires_at = Column(Integer, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="oauth_accounts")

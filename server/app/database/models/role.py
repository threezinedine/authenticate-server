import uuid
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.database.models.association import user_roles

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, index=True)
    description = Column(String(255), nullable=True)
    
    # Relationships
    users = relationship("User", secondary=user_roles, back_populates="roles")

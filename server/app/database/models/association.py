import uuid
from sqlalchemy import Column, String, ForeignKey, Table
from app.database.session import Base

# Many-to-Many join table for Users and Roles
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", String(36), ForeignKey("users.id")),
    Column("role_id", String(36), ForeignKey("roles.id")),
)

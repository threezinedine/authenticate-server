import pytest
from app.database.session import Base, engine, SessionLocal
from app.database.models.user import User
from app.database.models.role import Role
from app.database.models.profile import UserProfile
from app.config import settings

# Import the seeding function
from app.seed import seed_database

@pytest.fixture(scope="function")
def test_db():
    # Setup test database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_seed_database_creates_roles(test_db):
    seed_database(test_db)
    
    admin_role = test_db.query(Role).filter(Role.name == "admin").first()
    user_role = test_db.query(Role).filter(Role.name == "user").first()

    assert admin_role is not None
    assert user_role is not None
    assert admin_role.description == "Full administrative access."

def test_seed_database_creates_admin_user(test_db):
    seed_database(test_db)
    
    admin_user = test_db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    
    assert admin_user is not None
    assert admin_user.email == settings.ADMIN_EMAIL
    assert admin_user.is_active is True
    # Ensure they have the admin role internally
    assert any(role.name == "admin" for role in admin_user.roles)
    
    # Ensure profile was created
    assert admin_user.profile is not None
    assert admin_user.profile.first_name == "System"

def test_seed_database_creates_normal_user(test_db):
    seed_database(test_db)
    
    normal_user = test_db.query(User).filter(User.email == settings.TEST_USER_EMAIL).first()
    
    assert normal_user is not None
    assert normal_user.email == settings.TEST_USER_EMAIL
    assert normal_user.is_active is True
    # Ensure they have the normal user role internally
    assert any(role.name == "user" for role in normal_user.roles)

def test_seed_database_is_idempotent(test_db):
    # Run it twice to ensure no Unique Constraint Violations or duplicates happen natively
    seed_database(test_db)
    seed_database(test_db)
    
    # Should still only be 2 roles
    roles_count = test_db.query(Role).count()
    assert roles_count == 2
    
    # Should still only be 2 users
    users_count = test_db.query(User).count()
    assert users_count == 2

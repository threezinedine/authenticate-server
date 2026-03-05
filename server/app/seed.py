import logging
from sqlalchemy.orm import Session
from app.database.session import SessionLocal, engine, Base
from app.database.models.user import User
from app.database.models.role import Role
from app.database.models.profile import UserProfile
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_database(db: Session = None):
    """
    Seeds the database with foundational Roles ('admin', 'user') 
    and provisions the initial system Admin and a Test user.
    """
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Create Tables if they don't exist
        Base.metadata.create_all(bind=engine)

        # 1. Seed Roles
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            admin_role = Role(name="admin", description="Full administrative access.")
            db.add(admin_role)
            logger.info("Admin role created.")

        user_role = db.query(Role).filter(Role.name == "user").first()
        if not user_role:
            user_role = Role(name="user", description="Standard user access.")
            db.add(user_role)
            logger.info("User role created.")

        db.commit()
        
        # We need the refreshed objects to assign them to relationships
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        user_role = db.query(Role).filter(Role.name == "user").first()

        # 2. Seed Admin User
        admin_user = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.ADMIN_EMAIL,
                is_active=True
            )
            admin_user.set_password(settings.ADMIN_PASSWORD)
            admin_user.roles.append(admin_role)
            db.add(admin_user)
            
            # Setup Admin Profile
            admin_profile = UserProfile(
                user=admin_user,
                first_name="System",
                last_name="Administrator"
            )
            db.add(admin_profile)
            logger.info(f"Admin user seeded with email: {settings.ADMIN_EMAIL}")

        # 3. Seed Normal User
        normal_user = db.query(User).filter(User.email == settings.TEST_USER_EMAIL).first()
        if not normal_user:
            normal_user = User(
                email=settings.TEST_USER_EMAIL,
                is_active=True
            )
            normal_user.set_password(settings.TEST_USER_PASSWORD)
            normal_user.roles.append(user_role)
            db.add(normal_user)
            
            # Setup Normal Profile
            normal_profile = UserProfile(
                user=normal_user,
                first_name="Test",
                last_name="User"
            )
            db.add(normal_profile)
            logger.info(f"Test user seeded with email: {settings.TEST_USER_EMAIL}")
            
        db.commit()
        logger.info("Database seeding completed successfully.")

    except Exception as e:
        logger.error(f"Error during database seeding: {e}")
        db.rollback()
        raise e
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_database()

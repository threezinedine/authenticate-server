from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    
    # Database Configuration Properties 
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_USER: str = "user"
    MYSQL_PASSWORD: str = "password"
    MYSQL_DB: str = "auth_db"
    
    JWT_ALGORITHM: str = "RS256"
    JWT_REFRESH_ALGORITHM: str = "HS256"
    JWT_REFRESH_SECRET_KEY: str = "super-secret-symmetric-key-for-refresh-tokens"
    RSA_PRIVATE_KEY_PATH: str = "/etc/secrets/private_key.pem"
    AVATAR_UPLOAD_DIR: str = "./uploads/avatars"
    PORT: int = 8000
    
    @property
    def get_database_url(self) -> str:
        """
        Constructs the SQLAlchemy connection URL dynamically.
        Forces the usage of an in-memory SQLite database when the ENVIRONMENT flag is 'test'.
        """
        if self.ENVIRONMENT == "test":
            return "sqlite+pysqlite:///:memory:"
        return f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
    
    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        extra="ignore"
    )

def get_settings() -> Settings:
    env_name = os.getenv("ENVIRONMENT", "development").lower()
    
    if env_name == "test":
        env_file = ".test.env"
    elif env_name == "production":
        env_file = ".env"
    else:
        env_file = ".dev.env"
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(base_dir, env_file)
    
    if not os.path.exists(env_path):
        print(f"Warning: Environment file {env_path} not found. Falling back to system environment variables.")
        return Settings()

    return Settings(_env_file=env_path)

settings = get_settings()

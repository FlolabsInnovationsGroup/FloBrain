# File: app/core/config.py

import logging
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """
    Application settings are managed here.
    Pydantic-settings loads variables from .env files and the environment.
    """
    APP_NAME: str = "CAIPO Backend API"
    API_V1_STR: str = "/api/v1"
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

@lru_cache()
def get_settings() -> Settings:
    """
    Returns a cached instance of the settings.
    Using lru_cache ensures the .env file is read only once.
    """
    return Settings()

# Basic Logging Configuration
# This configures the root logger.
# All loggers created with logging.getLogger(__name__) will inherit this.
logging.basicConfig(
    level=get_settings().LOG_LEVEL,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
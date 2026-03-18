from __future__ import annotations

import json
from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "FloBrain"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    VERSION: str = "0.1.0-alpha"

    # LLM - Ollama (primary)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.2"

    # LLM - OpenAI-compatible fallback (optional)
    OPENAI_COMPATIBLE_API_URL: Optional[str] = None
    OPENAI_COMPATIBLE_API_KEY: Optional[str] = None

    # Notion Integration
    NOTION_TOKEN: Optional[str] = None
    NOTION_TASKS_DB_ID: Optional[str] = None
    NOTION_PROJECTS_DB_ID: Optional[str] = None

    # Notion OAuth
    NOTION_CLIENT_ID: Optional[str] = None
    NOTION_CLIENT_SECRET: Optional[str] = None
    NOTION_REDIRECT_URI: str = "http://localhost:8000/auth/notion/callback"

    # JWT Auth
    JWT_SECRET_KEY: str = "change-this-to-a-secure-random-secret-key-at-least-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    SQLITE_URL: str = "sqlite+aiosqlite:///./data/flobrain.db"

    # Vector Store
    CHROMADB_PATH: str = "./data/chroma"

    # Rate limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_GENERAL: int = 60   # requests per minute
    RATE_LIMIT_AUDIO: int = 10     # requests per minute for audio endpoint

    # Judge
    JUDGE_ENABLED: bool = True
    JUDGE_CONFIDENCE_THRESHOLD: float = 0.6

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list) -> list[str]:
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, ValueError):
                pass
            # Treat as comma-separated string
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()

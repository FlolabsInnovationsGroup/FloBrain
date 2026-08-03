from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Caipo Backend"
    API_V1_STR: str = "/api/v1"

    OPENAI_API_KEY: str | None = None
    ELEVENLABS_API_KEY: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )


settings = Settings()

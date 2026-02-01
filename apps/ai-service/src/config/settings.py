"""Configuration management for AI service."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # Server configuration
    port: int = 8800
    host: str = "0.0.0.0"
    log_level: str = "info"
    
    # AI Configuration (for future use)
    openai_api_key: str = ""
    
    # API versioning
    api_version: str = "v1"


# Global settings instance
settings = Settings()

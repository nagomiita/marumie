from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    database_url: str = "sqlite+aiosqlite:///./app.db"
    
    # Supabase configuration
    supabase_url: str = "http://127.0.0.1:54321"
    supabase_service_role_key: str | None = None
    
    # Seed configuration
    seed_admin_email: str = "admin@example.com"
    seed_admin_password: str = "admin123456"

    model_config = SettingsConfigDict(
        env_prefix="",
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Allow extra fields in .env
    )

    @property
    def is_development(self) -> bool:
        return self.app_env.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()

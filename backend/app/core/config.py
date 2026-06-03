"""
Nexus Backend Configuration
Loads environment variables and provides typed settings.
"""
from pydantic_settings import BaseSettings, NoDecode
from pydantic import field_validator
from functools import lru_cache
from typing import List, Annotated
import warnings
import json


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Nexus API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Supabase (required in production, can be empty for local demo of non-db endpoints)
    SUPABASE_URL: str = ""
    SUPABASE_SECRET_KEY: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""

    # CORS - restrict in production
    ALLOWED_ORIGINS: Annotated[List[str], NoDecode] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # AI / LLM (OpenAI compatible)
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"

    # Security
    API_KEY_HEADER: str = "X-API-Key"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        if isinstance(v, str):
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed]
            except (json.JSONDecodeError, TypeError):
                pass
            return [item.strip() for item in v.split(",") if item.strip()]
        return v


@lru_cache()
def get_settings() -> Settings:
    s = Settings()
    if not s.SUPABASE_URL or not s.SUPABASE_SECRET_KEY:
        warnings.warn(
            "SUPABASE_URL or SUPABASE_SECRET_KEY not set. "
            "AI endpoints that need DB will not work fully. "
            "Copy backend/.env.example to .env and fill values.",
            stacklevel=2,
        )
    return s


settings = get_settings()


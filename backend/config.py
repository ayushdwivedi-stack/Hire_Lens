from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    AI_PROVIDER: str = "ollama"

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    OPENAI_TIMEOUT_SECONDS: float = 60.0

    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "qwen3:4b"
    OLLAMA_TIMEOUT_SECONDS: float = 120.0

    HOST: str = "0.0.0.0"
    PORT: int = 8000

    CORS_ORIGINS: List[str] = [
    "http://localhost:3000",
    "https://hire-lens-mbwq.vercel.app",
]

    MAX_RESUME_CHARS: int = 15000
    MAX_JD_CHARS: int = 8000
    MAX_PDF_BYTES: int = 10 * 1024 * 1024


settings = Settings()
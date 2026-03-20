from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "contract-analyzer"
    ENV: str = "dev"
    DEBUG: bool = False

    # Database
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_NAME: str = "hackathon_db"

    # AWS SES
    AWS_REGION: str = "ap-south-1"
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    SES_SENDER_EMAIL: str = "Cadre ODR <no-reply@cadreodr.com>"
    SES_REPLY_TO_EMAIL: str = "Cadre ODR <no-reply@cadreodr.com>"

    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_CHAT_MODEL: str = "mistral"
    OLLAMA_EMBED_MODEL: str = "nomic-embed-text"

    # OpenAI (optional fallback)
    OPENAI_API_KEY: Optional[str] = None

    # Contract Analyzer
    MAX_CONTRACT_SIZE_KB: int = 500

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

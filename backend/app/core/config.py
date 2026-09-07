import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Azure Document Intelligence
    AZURE_DOC_INTEL_ENDPOINT: str = ""
    AZURE_DOC_INTEL_KEY: str = ""

    # Azure OpenAI
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT_NAME: str = "gpt-4o"
    AZURE_OPENAI_API_VERSION: str = "2024-08-01-preview"

    # App Config
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    ENABLE_MOCK_FALLBACK: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_doc_intel(self) -> bool:
        return bool(self.AZURE_DOC_INTEL_ENDPOINT and self.AZURE_DOC_INTEL_KEY and "your-" not in self.AZURE_DOC_INTEL_KEY)

    @property
    def has_openai(self) -> bool:
        return bool(self.AZURE_OPENAI_ENDPOINT and self.AZURE_OPENAI_API_KEY and "your_" not in self.AZURE_OPENAI_API_KEY)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

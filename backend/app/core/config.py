from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "VARTA - AI/ML Tropical Cyclone Diagnostic & Prediction System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DESCRIPTION: str = (
        "Production-grade prototype for Smart India Hackathon. "
        "Delivers end-to-end cyclone genesis detection, intensity classification, "
        "track & cone forecasting, multi-hazard risk analysis, and CAP-compliant alert dissemination."
    )
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./varta.db"
    
    # Security / CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # AI Engine Flags
    ENABLE_AI_SIMULATION: bool = True
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.85
    
    # Data Providers
    ENABLE_LIVE_WEATHER_FEED: bool = False
    OPENWEATHER_API_KEY: str = Field(default="")
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")

settings = Settings()

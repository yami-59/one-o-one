# /backend/app/core/settings.py

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # 1. Indique à Pydantic de chercher un fichier .env à la racine
    # Ceci est crucial pour le développement local (hors Docker Compose)
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Configuration FastAPI/Générale ---
    SECRET_KEY: SecretStr | None = Field(default=None,min_length=32)
    DEBUG: bool = False
    
    # --- Configuration Base de Données (PostgreSQL) ---
    # Pydantic validera que c'est une URL valide
    DATABASE_URL: str

    # --- Configuration Cache/Temps Réel (Redis) ---
    REDIS_URL: str

    # --- Configuration E-mail (Pour le Magic Code/OTP futur) ---
    SMTP_USERNAME: str | None = None
    SMTP_PASSWORD: SecretStr | None = None
    SMTP_SERVER: str | None = None
    SMTP_PORT: int  = 587 # Port standard pour SMTP TLS
    SMTP_TLS: bool = True # Utiliser TLS pour la sécurité

# Instance unique des paramètres
settings = Settings()
# /backend/app/core/settings.py

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from functools import cached_property

class Settings(BaseSettings):
    # 1. Indique à Pydantic de chercher un fichier .env à la racine
    # Ceci est crucial pour le développement local (hors Docker Compose)
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- Configuration FastAPI/Générale ---
    SECRET_KEY: SecretStr | None = Field(default=None,min_length=32)
    ALGORITHM:str
    DEBUG: bool = False
    # Lit la chaîne brute du .env
    CORS_ORIGINS: str = Field(alias="ORIGINS") 

    @cached_property
    def origins(self) -> List[str]:
        """Convertit la chaîne d'origines en une liste Python."""
        # On nettoie les espaces blancs et on split la chaîne par la virgule.
        return [
            origin.strip() for origin in self.CORS_ORIGINS.split(',') 
        ]
    
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
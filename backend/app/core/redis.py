# /backend/app/core/redis.py (Nouveau fichier)

import redis.asyncio as aioredis
from typing import AsyncGenerator
from app.core.settings import settings
from redis.asyncio import Redis as AsyncRedis

# Variable globale pour stocker la connexion Redis (sera initialisée au démarrage)
redis_client: AsyncRedis | None = None

# --- 1. Fonction d'Initialisation (Lifespan) ---
async def startup_redis():
    """Initialise la connexion Redis au démarrage de l'application."""
    global redis_client
    try:
        # Utilise l'URL définie dans settings (ex: redis://redis_cache:6379/0)
        redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True # Pour que les clés/valeurs soient retournées comme des chaînes Python (str)
        )
        await redis_client.ping() # Teste la connexion
        print("✅ Connexion Redis établie.")
    except Exception as e:
        print(f"❌ ERREUR DE CONNEXION REDIS : {e}")
        redis_client = None # Laisser None si la connexion échoue

async def shutdown_redis():
    """Ferme la connexion Redis à l'arrêt de l'application."""
    global redis_client
    if redis_client:
        await redis_client.aclose()
        print("🔌 Connexion Redis fermée.")

# --- 2. Dépendance FastAPI ---
async def get_redis_client() -> AsyncGenerator[AsyncRedis, None]:
    """
    Dépendance FastAPI pour injecter le client Redis dans les routes.
    """
    if redis_client is None:
        raise Exception("Le client Redis n'a pas été initialisé.")
    # Le 'yield' renvoie le client déjà établi
    yield redis_client
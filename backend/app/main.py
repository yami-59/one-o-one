# /backend/app/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.settings import settings
from app.core.db import check_db_connection
from app.api.matchmaking import router as matchmaking_router # 🚀 Routeur Matchmaking
from app.api.websocket import router as websocket_router # 🚀 Routeur Matchmaking
from app.core.redis import startup_redis, shutdown_redis

# --- 1. Lifespan pour la gestion des événements de démarrage/arrêt ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crée les tables de la DB au démarrage du serveur."""
    print("Démarrage de l'API One'o One...")
    # Événement de Démarrage :
    await check_db_connection()
    await startup_redis()        # 🎯 Connexion Redis
    
    yield # L'application commence à traiter les requêtes
    
    # Événement d'Arrêt :
    await shutdown_redis()
    print("Arrêt de l'API.")

# --- 2. Initialisation de FastAPI ---
app = FastAPI(
    title="One'o One Game API (MVP)",
    version="0.1.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)

# --- 3. Inclusion des Routeurs ---
# Route principale pour le matchmaking (création de partie)
app.include_router(matchmaking_router, prefix="/api/v1", tags=["Matchmaking"])
# Route principale pour le websocket (connexion à une partie)
app.include_router(websocket_router, prefix="/api/v1", tags=["Websocket"])


@app.get("/")
async def read_root():
    return {"message": "Bienvenue sur l'API One'o One. Voir /docs pour les endpoints."}
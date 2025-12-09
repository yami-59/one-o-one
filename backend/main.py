# /backend/app/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.settings import settings
from app.core.db import create_db_and_tables # Crée les tables
from app.api.matchmaking import router as matchmaking_router # 🚀 Routeur Matchmaking

# --- 1. Lifespan pour la gestion des événements de démarrage/arrêt ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crée les tables de la DB au démarrage du serveur."""
    print("Démarrage de l'API One'o One...")
    await create_db_and_tables() 
    yield
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


@app.get("/")
async def read_root():
    return {"message": "Bienvenue sur l'API One'o One. Voir /docs pour les endpoints."}
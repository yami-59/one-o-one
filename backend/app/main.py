# /backend/app/main.py

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.settings import settings
from app.core.db import check_db_connection
from app.api.matchmaking import router as matchmaking_router # 🚀 Routeur Matchmaking
from app.api.guest import router as guest_router
from app.api.websocket import router as websocket_router # 🚀 Routeur Matchmaking
from app.core.redis import startup_redis, shutdown_redis
from fastapi.middleware.cors import CORSMiddleware

# --- Lifespan pour la gestion des événements de démarrage/arrêt ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crée les tables de la DB au démarrage du serveur."""
    print("Démarrage de l'API One'o One...")
    print(settings.origins)

    # Événement de Démarrage :
    await check_db_connection()
    await startup_redis()        # 🎯 Connexion Redis
    
    yield # L'application commence à traiter les requêtes
    
    # Événement d'Arrêt :
    await shutdown_redis()
    print("Arrêt de l'API.")

# --- Initialisation de FastAPI ---
app = FastAPI(
    title="One'o One Game API (MVP)",
    version="0.1.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)


# --- Configuration CORS ---
origins = settings.origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # 🎯 Les origines autorisées (votre frontend)
    allow_credentials=True,        # Autoriser les cookies et headers d'autorisation (JWT)
    allow_methods=["*"],           # Autoriser toutes les méthodes (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],           # Autoriser tous les en-têtes (y compris X-Player-Identifier)
)

# Route principale pour le matchmaking (création de partie)
app.include_router(matchmaking_router, prefix="/api/v1", tags=["Matchmaking"])
app.include_router(guest_router,prefix="/api/v1",tags=["create new guest Account"])
app.include_router(websocket_router,prefix="/api/v1",tags=["websocket"])


@app.get("/")
async def read_root():
    return {"message": "Bienvenue sur l'API One'o One. Voir /docs pour les endpoints."}
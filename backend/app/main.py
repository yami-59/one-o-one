# /backend/app/main.py

import asyncio
from contextlib import asynccontextmanager,suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as guest_router
from app.core.db import check_db_connection
from app.core.matchmaker_service import run_matchmaking_consumer
from app.core.redis import  shutdown_redis, startup_redis
from app.core.settings import settings
from app.api.matchmaking import (
    router as matchmaking_router,
)  
from app.api.websocket import (
    router as websocket_router,
) 
from app.api.ws_auth import ( router as ws_auth_router)
from app.api.health import (router as health_router)

from app.core.matchmaker_service import STOP_EVENT



# --- Lifespan pour la gestion des événements de démarrage/arrêt ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Démarrage de l'API One'o One...")

    # Toujours remettre STOP_EVENT à zéro
    STOP_EVENT.clear()

    # Startup
    await check_db_connection()
    await startup_redis()

    matchmaker_task = asyncio.create_task(run_matchmaking_consumer())

    yield 

    # Shutdown
    STOP_EVENT.set()

    # Si la tâche n'est pas déjà terminée, on la cancel proprement
    if not matchmaker_task.done():
        matchmaker_task.cancel()
        with suppress(asyncio.CancelledError):
            await matchmaker_task


    await shutdown_redis()
    print("Arrêt de l'API.")


# --- Initialisation de FastAPI ---
app = FastAPI(
    title="One'o One Game API (MVP)",
    version="0.1.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)


# --- Configuration CORS ---
origins = settings.origins


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🎯 Les origines autorisées (votre frontend)
    allow_credentials=True,  # Autoriser les cookies et headers d'autorisation (JWT)
    allow_methods=["*"],  # Autoriser toutes les méthodes (GET, POST, OPTIONS, etc.)
    allow_headers=["*"],  # Autoriser tous les en-têtes (y compris X-Player-Identifier)
)

app.include_router(matchmaking_router, prefix="/api/v1", tags=["matchmaking"])
app.include_router(guest_router, prefix="/api/v1", tags=["create new guest Account"])
app.include_router(websocket_router, prefix="/api/v1", tags=["websocket"])
app.include_router(ws_auth_router,prefix="/api/v1",tags=["websocket authentification"])
app.include_router(health_router)

@app.get("/")
async def read_root():
    return {"message": "Bienvenue sur l'API One'o One. Voir /docs pour les endpoints."}

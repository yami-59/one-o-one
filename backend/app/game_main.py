# /backend/app/game_main.py (Point d'entrée du Game Engine)

from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.db import check_db_connection
from app.core.redis import startup_redis, shutdown_redis
from app.api.websocket import router as websocket_router 
from app.core.settings import settings # Pour l'accès à settings.DEBUG


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gère l'initialisation des ressources DB/Redis pour le Game Engine."""
    print("Démarrage du Game Engine...")
    
    # Initialisation des ressources partagées
    await check_db_connection()
    await startup_redis()        
    
    yield 
    
    # Arrêt
    await shutdown_redis()       
    print("🔌 Arrêt du Game Engine.")


app = FastAPI(
    title="Game Engine (WebSocket)",
    lifespan=lifespan,
    debug=settings.DEBUG
)

# 🎯 Inclusion UNIQUE du routeur WebSocket pour ce service
app.include_router(websocket_router) 

# Note : Aucune route REST n'est incluse ici.
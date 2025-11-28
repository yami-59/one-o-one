# /backend/app/api/websocket.py (Nouveau fichier)

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlmodel import Session, select
from typing import Annotated, Dict, List

from app.core.db import get_session
from app.models.game import GameSession
from app.models.game_schemas import BoardState # Pour le typage de l'état

router = APIRouter()

# ⚠️ Structure globale pour stocker les connexions actives
# Clé: game_id (str) -> Valeur: List[WebSocket] (tous les joueurs de cette partie)
active_connections: Dict[str, List[WebSocket]] = {}


# /backend/app/api/websocket.py (suite)

@router.websocket("/ws/game/{game_id}/{player_identifier}")
async def websocket_endpoint(
    websocket: WebSocket,
    game_id: str,
    player_identifier: str,
    session: Annotated[Session, Depends(get_session)] # Utilise la DB pour la vérification
):
    """
    Gère la connexion WebSocket pour une partie spécifique.
    """
    
  

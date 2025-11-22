# /backend/app/api/websocket.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status
from sqlmodel import  select
from typing import  Dict, List
from app.core.db import SessionDep  # Pour la vérification DB
from app.models.tables import GameSession # Pour vérifier l'existence de la partie
from app.utils.auth import get_websocket_token,get_current_player_id
import asyncio


# --- État Global des Connexions (En mémoire) ---
# Clé: game_id (str) -> Valeur: List[WebSocket] (connexions des joueurs)
ACTIVE_CONNECTIONS: Dict[str, List[WebSocket]] = {}



# Configurez le schéma de sécurité OAuth2 (FastAPI l'utilise pour extraire le jeton de l'en-tête)
router = APIRouter()


# -----------------------------------------------------------------
# Fonction utilitaire pour diffuser les messages
# -----------------------------------------------------------------
async def broadcast_message(game_id: str, message: dict):
    """Envoie un message JSON à tous les clients connectés à ce game_id."""
    if game_id in ACTIVE_CONNECTIONS:
        # Tâches asynchrones pour envoyer à toutes les connexions simultanément
        send_tasks = [
            conn.send_json(message) 
            for conn in ACTIVE_CONNECTIONS[game_id]
        ]

        print(f"le nombre de message à envoyé en broadcast : {len(send_tasks)}")
        # Exécute toutes les tâches d'envoi sans attendre la fin de chacune
        await asyncio.gather(*send_tasks)


# -----------------------------------------------------------------
# ROUTE WEBSOCKET PRINCIPALE
# -----------------------------------------------------------------

@router.websocket("/ws/game/{game_id}")
async def websocket_endpoint(
    game_id: str,
    session: SessionDep ,
    websocket: WebSocket,

):
    """
    Gère la connexion WebSocket pour une partie spécifique (vérification de l'ID, enregistrement).
    """

    token=get_websocket_token(websocket)
    player_identifier=get_current_player_id(token)


    # 1. Vérification de la Session de Jeu en DB
    game = (await session.exec(
        select(GameSession).where(GameSession.game_id == game_id)
    )).first()
    
    if not game:
        print(f"WS Échec: Partie {game_id} introuvable.")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Game Not Found")
        return

    # 2. Acceptation et Enregistrement de la Connexion
    await websocket.accept()
    
    # Initialisation de la liste pour ce game_id si elle n'existe pas
    if game_id not in ACTIVE_CONNECTIONS:
        ACTIVE_CONNECTIONS[game_id] = []
    
    # Enregistre la connexion
    ACTIVE_CONNECTIONS[game_id].append(websocket)
    print(f"WS Connexion établie: Joueur {player_identifier} pour {game_id}")

    try:
        # 3. Notification de Connexion
        await broadcast_message(
            game_id, 
            {"type": "player_joined", "player": player_identifier}
        )

        # 4. Boucle de Réception des Messages (Moteur de Jeu)
        while True:
            # Attend un message du client (doit être non-bloquant)
            data = await websocket.receive_json()
            
            # --- Logique de Test (Écho) ---

            # Pour le test, on renvoie simplement ce qu'on reçoit à tous les joueurs
            message = {"type": "echo", "sender": player_identifier, "data": data}
            
            # 5. Diffusion de la réponse à tous les joueurs de la partie
            await broadcast_message(game_id, message)

    except WebSocketDisconnect:
        # 6. Déconnexion
        print(f"WS Déconnexion: Joueur {player_identifier} de la partie {game_id}")
        
        # Supprime la connexion de la liste active
        ACTIVE_CONNECTIONS[game_id].remove(websocket)
        
        # Notifie l'adversaire (et soi-même pour le journal)
        await broadcast_message(
            game_id, 
            {"type": "player_left", "player": player_identifier}
        )
        
    except Exception as e:
        print(f"WS Erreur inattendue pour {player_identifier}: {e}")
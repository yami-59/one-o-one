# /backend/app/api/websocket.py

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, status
from sqlmodel import  select
from typing import  Dict
from app.core.db import SessionDep  # Pour la vérification DB
from app.models.tables import GameSession # Pour vérifier l'existence de la partie
from app.utils.auth import get_websocket_token,get_current_player_id
from app.utils.enums import GameMessageType

# --- État Global des Connexions (En mémoire) ---
# Clé: game_id (str) -> Valeur: Dict[str,WebSocket] (connexions des joueurs)
ACTIVE_CONNECTIONS: Dict[str, Dict[str,WebSocket]] = {}



# Configurez le schéma de sécurité OAuth2 (FastAPI l'utilise pour extraire le jeton de l'en-tête)
router = APIRouter()


# -----------------------------------------------------------------
# Fonction utilitaire pour diffuser les messages
# -----------------------------------------------------------------
async def transfert_message(game_id: str,opponent_identifier:str,message: dict):
    """Envoie un message JSON à l'adversaire connectés à ce game_id."""
    if game_id in ACTIVE_CONNECTIONS :
        # Vérification de l'existence de l'adversaire dans cette salle
        conn = ACTIVE_CONNECTIONS[game_id].get(opponent_identifier)
        
        if conn:
            try:
                # ⚠️ CORRECTION : Utiliser await pour la méthode asynchrone
                await conn.send_json(message)
                
            except Exception as e:
                # ⚠️ Amélioration : Gérer les erreurs de déconnexion silencieuse
                # Si le joueur est parti juste avant l'envoi, on nettoie
                print(f"WS ERROR: Failed to send to {opponent_identifier} in {game_id}. Reason: {e}")
                
                # Optionnel : Supprimer la connexion cassée du dictionnaire
                if game_id in ACTIVE_CONNECTIONS and opponent_identifier in ACTIVE_CONNECTIONS[game_id]:
                    ACTIVE_CONNECTIONS[game_id].pop(opponent_identifier, None)


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

    # # 1. Vérification de la Session de Jeu en DB
    # game = (await session.exec(
    #     select(GameSession).where(GameSession.game_id == game_id)
    # )).first()
    
    # if not game:
    #     print(f"WS Échec: Partie {game_id} introuvable.")
    #     await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Game Not Found")
    #     return

    # 3. Acceptation et Enregistrement de la Connexion
    await websocket.accept()
    
    # Initialisation de la salle de jeu
    if game_id not in ACTIVE_CONNECTIONS:
        ACTIVE_CONNECTIONS[game_id] = {}

    # Enregistre la connexion de manière sécurisée (Clé: ID, Valeur: Objet WebSocket)
    ACTIVE_CONNECTIONS[game_id][player_identifier] = websocket
    print(f"WS Connexion établie: Joueur {player_identifier} pour {game_id}")

    # 4. Logique de Matchmaking et de Démarrage (ATTENTE NON BLOQUANTE)
    
    # Détermination des joueurs actifs
    player_ids = list(ACTIVE_CONNECTIONS[game_id].keys())
    is_ready = len(player_ids) == 2
    
    if is_ready:
        # Si la partie est pleine, on identifie l'adversaire
        opponent_identifier = next(id for id in player_ids if id != player_identifier)
        
        # Envoi de la notification de démarrage aux deux joueurs
        await transfert_message(
             game_id,
             opponent_identifier, 
             {"type": GameMessageType.GAME_START, "opponent": opponent_identifier, "you_are": player_identifier}
        )
    else:
        # La partie n'est pas encore pleine, on notifie le joueur qu'il doit attendre
        await websocket.send_json({"type": GameMessageType.WAITING_FOR_OPPONENT, "message": "En attente du second joueur..."})

    try:
        # 5. Boucle de Réception (Moteur de Jeu)
        while True:
            # Reçoit le message (non bloquant)
            data = await websocket.receive_json() 
            
            # Traitement de la logique de jeu ici...
            
            # Exemple : Renvoyer à l'adversaire ou broadcaster
            if is_ready:
                await transfert_message(game_id,opponent_identifier, data)
            
    except WebSocketDisconnect:
        # 6. Gestion de la Déconnexion
        print(f"WS Déconnexion: Joueur {player_identifier} de la partie {game_id}")
        
        # Supprime la connexion de la liste active (Utilisation de .pop() pour la sécurité)
        ACTIVE_CONNECTIONS[game_id].pop(player_identifier, None)

        # Notifie l'adversaire
        if is_ready:
             await transfert_message(
                 game_id,
                 opponent_identifier,
                 {"type": "opponent_left", "player": player_identifier, "message": "L'adversaire a quitté la partie."}
             )
    
    except Exception as e:
        print(f"WS Erreur inattendue pour {player_identifier}: {e}")
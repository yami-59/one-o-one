# /backend/app/api/websocket.py

import asyncio
from uuid import uuid4
from typing import Annotated

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Query
from sqlmodel import select, SQLModel
from redis.asyncio import Redis as AsyncRedis
from app.models.tables import GameSession
from app.models.schemas import WordSearchState
from app.core.redis import RedisDep
from app.core.db import SessionDep
from app.games.gameRoom import GameRoom
from app.games.constants import GameStatus,GameMessages
from app.games.wordsearch.redis_keys import redis_state_key
from app.auth.lib import TokenDep, get_current_user_id
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter(tags=["websocket"])

# --- Stockage des parties actives ---
ACTIVE_GAMES: dict[str, GameRoom] = {}

# --- Constantes pour le Token Éphémère ---
WS_TOKEN_PREFIX = "ws_auth:"
WS_TOKEN_EXPIRE_SECONDS = 300  # 5 minutes


class WsTokenResponse(SQLModel):
    """Schéma de réponse pour l'échange de token WebSocket."""
    ws_token: str
    expires_in: int = WS_TOKEN_EXPIRE_SECONDS


# -----------------------------------------------------------------
# ENDPOINTS D'AUTHENTIFICATION WS
# -----------------------------------------------------------------


# @router.post("/ws-auth", response_model=WsTokenResponse, status_code=status.HTTP_200_OK)
# async def websocket_auth_exchange(
#     token: TokenDep,
#     redis_conn: RedisDep,
# ):
#     """Échange le JWT contre un token éphémère pour l'accès WebSocket."""
#     player_id = get_current_user_id(token)

#     # Générer un token aléatoire (uuid4 est plus sécurisé que uuid1)
#     ws_token = str(uuid1())

#     # Stocker l'association token -> player_id avec expiration
#     await redis_conn.set(
#         f"{WS_TOKEN_PREFIX}{ws_token}",
#         player_id,
#         ex=WS_TOKEN_EXPIRE_SECONDS,
#     )

#     return WsTokenResponse(ws_token=ws_token)


# @router.post("/ws-refresh", response_model=WsTokenResponse, status_code=status.HTTP_200_OK)
# async def refresh_ws_token(
#     token: TokenDep,
#     redis_conn: RedisDep,
# ):
#     """Génère un nouveau token WebSocket éphémère."""
#     player_id = get_current_user_id(token)

#     new_ws_token = str(uuid1())

#     await redis_conn.set(
#         f"{WS_TOKEN_PREFIX}{new_ws_token}",
#         player_id,
#         ex=WS_TOKEN_EXPIRE_SECONDS,
#     )

#     return WsTokenResponse(ws_token=new_ws_token)


# -----------------------------------------------------------------
# FONCTIONS UTILITAIRES
# -----------------------------------------------------------------


# async def validate_ws_token(redis_conn, ws_token: str) -> str | None:
#     """
#     Valide le token WebSocket et retourne le player_id.
#     Retourne None si le token est invalide ou expiré.
#     """
#     if not ws_token:
#         return None

#     player_id = await redis_conn.get(f"{WS_TOKEN_PREFIX}{ws_token}")

#     if not player_id:
#         return None

#     # Décoder si bytes
#     if isinstance(player_id, bytes):
#         player_id = player_id.decode("utf-8")

#     # Supprimer le token après utilisation (one-time use)
#     await redis_conn.delete(f"{WS_TOKEN_PREFIX}{ws_token}")

#     return player_id


async def get_game_session(session: SessionDep, game_id: str) -> GameSession | None:
    """Récupère une session de jeu depuis la DB."""
    query = select(GameSession).where(GameSession.game_id == game_id)
    result = await session.exec(query)
    return result.first()

def get_or_create_room(game_id: str,db_session:AsyncSession ,redis_conn: AsyncRedis) -> GameRoom:
    """Récupère ou crée une salle de jeu avec accès Redis."""
    if game_id not in ACTIVE_GAMES:
        ACTIVE_GAMES[game_id] = GameRoom(game_id=game_id,db_session=db_session, redis_conn=redis_conn)
    return ACTIVE_GAMES[game_id]



def cleanup_room_if_empty(game_id: str) -> None:
    """Supprime la salle si elle est vide."""
    room = ACTIVE_GAMES.get(game_id)
    if room and room.is_empty():
        del ACTIVE_GAMES[game_id]
        print(f"🗑️ Room {game_id} supprimée (vide)")


async def get_game_state_from_redis(
    redis_conn: AsyncRedis, 
    game_id: str
) -> WordSearchState | None:
    """
    Récupère l'état du jeu depuis Redis.
    Retourne None si l'état n'existe pas.
    """
    state_key = redis_state_key(game_id)
    json_state = await redis_conn.get(state_key)
    
    if not json_state:
        return None
    
    # Décoder si bytes
    if isinstance(json_state, bytes):
        json_state = json_state.decode("utf-8")
    
    return WordSearchState.model_validate_json(json_state)


async def send_game_state_to_player(
    room: GameRoom,
    player_id: str,
    redis_conn: AsyncRedis,
    game_id: str,
) -> bool:
    """
    Envoie l'état actuel du jeu (grille + mots à trouver) au joueur.
    Appelé lors de la connexion initiale du joueur.
    """
    game_state = await get_game_state_from_redis(redis_conn, game_id)
    
    if not game_state:
        await room.send_to_player(player_id, {
            "type": GameMessages.ERROR,
            "message": "État du jeu introuvable.",
        })
        return False
    
    await room.send_to_player(player_id, {
        "type": GameMessages.GAME_STATE,
        "game_state":{**game_state.model_dump()}
    })
    
    print(f"📤 [{game_id}] État du jeu envoyé à {player_id}")
    return True




# -----------------------------------------------------------------
# ROUTE WEBSOCKET PRINCIPALE
# -----------------------------------------------------------------


@router.websocket("/ws/game/wordsearch/{game_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    game_id: str,
    redis_conn: RedisDep,
    session: SessionDep,
    player_id: Annotated[str | None, Query(alias="playerId")] = None,
):
    """Gère la connexion WebSocket pour une partie de mots mêlés."""

    # # 1. Validation du token WebSocket
    # player_id = await validate_ws_token(redis_conn, token)

    if not player_id:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Token invalid or expired",
        )
        return
    from app.models.tables import User
    query = (select(User).where(User.user_id == player_id))

    user = (await session.exec(query)).first()

    if not user:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="no corresponding user in database"
        )
    

    # # 2. Vérification que la partie existe en DB
    # game_session = await get_game_session(session, game_id)

    # if not game_session:
    #     await websocket.close(
    #         code=status.WS_1008_POLICY_VIOLATION,
    #         reason="Game session not found",
    #     )
    #     return

    # # 3. Vérification que le joueur fait partie de cette partie
    # if player_id not in (game_session.player1_id, game_session.player2_id):
    #     await websocket.close(
    #         code=status.WS_1008_POLICY_VIOLATION,
    #         reason="Player not in this game",
    #     )
    #     return

    # 4. Gestion de la salle de jeu (avec accès Redis)
    room = get_or_create_room(game_id,session, redis_conn)

    # Refuser si la salle est pleine et que le joueur n'y est pas déjà
    if room.is_full() and player_id not in room.player_ids:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Room is full",
        )
        return

    # 5. Acceptation et enregistrement
    await websocket.accept()

    if not room.add_player(player_id, websocket,user.username):
        # Le joueur était peut-être déjà connecté, on met à jour son socket
        room.remove_player(player_id)
        room.add_player(player_id, websocket,user.username)

    # 6. 🎯 NOUVEAU: Envoyer l'état du jeu au joueur dès la connexion
    await send_game_state_to_player(room, player_id, redis_conn, game_id)

    print(f"✅ [{game_id}] Joueur {player_id} connecté ({room.player_count}/2)")


    # await room.handle_game_start()

    

    # 7. Boucle de réception des messages
    try:
        while True:
            data = await websocket.receive_json()
            await handle_player_message(room, player_id, data)

    except WebSocketDisconnect:
        print(f"🔌 [{game_id}] Joueur {player_id} déconnecté")
        await handle_player_disconnect(room, player_id, game_id)

    except Exception as e:
        print(f"❌ [{game_id}] Erreur pour {player_id}: {e}")
        room.remove_player(player_id)
        cleanup_room_if_empty(game_id)


async def handle_player_message(
    room: GameRoom, 
    player_id: str, 
    data: dict,
) -> None:
    """Traite un message reçu d'un joueur."""
    message_type = data.get("type")

    # # Permettre certains messages même si le jeu n'est pas en cours
    # allowed_before_start = ["player_ready", "selection_update"]
    
    # if room.state != GameStatus.GAME_IN_PROGRESS and message_type not in allowed_before_start:
    #     await room.send_to_player(player_id, {
    #         "type": "error",
    #         "message": "La partie n'est pas en cours.",
    #     })
    #     return

    # Gérer les différents types de messages
    if message_type == "selection_update":
        # Transmettre la sélection à l'adversaire (aperçu en temps réel)
        opponent_id = room.get_opponent_id(player_id)
        if opponent_id:
            await room.send_to_player(opponent_id, {
                **data,
                "from": room.get_username(player_id),
            })
    
    elif message_type == "submit_selection":
        solution = data.get("solution")
        result  = await room._controller.process_player_action(player_id,solution)


        if result.get("success"):
            # Récupérer l'état mis à jour pour calculer les mots restants

            await room.broadcast({
                "type":GameMessages.WORD_FOUND_SUCCESS,
                **result,
                "found_by":room.get_username(player_id)
            })
        
        else:
            await room.send_to_player(player_id,{**result,"from":room.get_username(player_id)})
        
        pass

    else:
        # Transmettre les autres messages à l'adversaire
        opponent_id = room.get_opponent_id(player_id)
        if opponent_id:
            await room.send_to_player(opponent_id, {
                **data,
                "from": room.get_username(player_id),
            })


async def handle_player_disconnect(room: GameRoom, player_id: str, game_id: str) -> None:
    """Gère la déconnexion d'un joueur."""
    room.remove_player(player_id)

    # Notifier l'adversaire
    opponent_id = room.get_opponent_id(player_id)
    if opponent_id:
        await room.send_to_player(opponent_id, {
            "type": "opponent_disconnected",
            "message": "Votre adversaire s'est déconnecté.",
        })

    # Si la partie était en cours, la terminer
    if room.state == GameStatus.GAME_IN_PROGRESS and opponent_id:
        await room.end_game(winner_id=opponent_id, reason="opponent_disconnected")

    cleanup_room_if_empty(game_id)





"""

## Résumé des changements

| Problème | Solution |
|----------|----------|
| `uuid1()` pas converti en str | `str(uuid4())` (uuid4 plus sécurisé) |
| Token WS jamais validé | Fonction `validate_ws_token()` |
| `return {...}` dans WS | `await websocket.close()` |
| `handle_game_start(room)` | `room.handle_game_start()` |
| `room.players[id] = ws` | `room.add_player(id, ws)` |
| `.value` manquant | Ajouté sur tous les enums dans JSON |
| `import *` | Import explicite |
| Pas de cleanup | `cleanup_room_if_empty()` |
| `playerId` | Renommé `player_id` (snake_case) |
| Pas de validation joueur/partie | Vérification `player_id in (p1, p2)` |
| Token réutilisable | Supprimé après usage (one-time) |

## Flow complet
```
1. Client POST /ws-auth avec JWT → reçoit ws_token
2. Client connecte ws://...?token=<ws_token>
3. Serveur valide token via Redis, supprime le token
4. Serveur vérifie que le joueur fait partie de la game
5. Joueur rejoint la room
6. Quand 2 joueurs → countdown → game start
7. Messages relayés entre joueurs
8. Déconnexion → notification adversaire → cleanup

"""

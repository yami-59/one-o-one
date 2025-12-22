# /backend/app/api/websocket.py

from typing import Annotated

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status, Query
from sqlmodel import select
from redis.asyncio import Redis as AsyncRedis
from app.models.tables import GameSession
from app.models.schemas import WordSearchState
from app.core.redis import RedisDep
from app.core.db import SessionDep
from app.games.wordsearch.gameRoom import GameRoom
from app.games.constants import GameMessages
from sqlmodel.ext.asyncio.session import AsyncSession
from app.games.constants import WS_TOKEN_PREFIX


router = APIRouter(prefix="/ws/game",tags=["websocket"])

# --- Stockage des parties actives ---
ACTIVE_GAMES: dict[str, GameRoom] = {}


# -----------------------------------------------------------------
# FONCTIONS UTILITAIRES
# -----------------------------------------------------------------


async def validate_ws_token(redis_conn, ws_token: str) -> str | None:
    """
    Valide le token WebSocket et retourne le player_id.
    Retourne None si le token est invalide ou expiré.
    """
    if not ws_token:
        print("ws_token inexistant")
        return None

    player_id = await redis_conn.get(f"{WS_TOKEN_PREFIX}{ws_token}")


    if not player_id:
        print("ws_token expiré")
        return None

    # Décoder si bytes
    if isinstance(player_id, bytes):
        player_id = player_id.decode("utf-8")

    return player_id


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
    game_state = await room._get_game_state(redis_conn, game_id)
    
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
# ROUTE WEBSOCKET PRINCIPALE Pour WordSearch
# -----------------------------------------------------------------


@router.websocket("/wordsearch/{game_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    game_id: str,
    redis_conn: RedisDep,
    session: SessionDep,
    ws_token: Annotated[str | None, Query(alias="ws_token")] = None,
):
    """Gère la connexion WebSocket pour une partie de mots mêlés."""

    # 1. Validation du token WebSocket
    player_id = await validate_ws_token(redis_conn, ws_token)

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
    

    # 2. Vérification que la partie existe en DB
    game_session = await get_game_session(session, game_id)

    if not game_session:
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Game session not found",
        )
        return

    # 3. Vérification que le joueur fait partie de cette partie
    if player_id not in (game_session.player1_id, game_session.player2_id):
        await websocket.close(
            code=status.WS_1008_POLICY_VIOLATION,
            reason="Player not in this game",
        )
        return

    # 4. Gestion de la salle de jeu (avec accès Redis)
    room = get_or_create_room(game_id,session, redis_conn)

    # 🎯 4. PROTECTION: Si le joueur est déjà connecté avec un autre socket, refuser
    existing_socket = room.get_player_socket(player_id)
    if existing_socket is not None:
        print(f"⚠️ [{game_id}] {user.username} déjà connecté, refus de la nouvelle connexion")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Already connected")
        return

    # 6. Vérifier si c'est une reconnexion AVANT d'ajouter le joueur
    is_reconnection = room.is_reconnection(player_id)

    # 7. Accepter la connexion WebSocket
    await websocket.accept()

    # 8. Ajouter/mettre à jour le joueur
    if not room.add_player(player_id, websocket, user.username):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Room full")
        return

    # # 9. 🎯 Déclencher le bon flow selon le type de connexion
    if is_reconnection:
        print(f"🔄 [{game_id}] Reconnexion de {user.username}")
        await room.on_player_reconnected(player_id)
    else:
        print(f"✅ [{game_id}] {user.username} connecté ({room.player_count}/2)")
        await room.on_player_connected(player_id)

    

    # 7. Boucle de réception des messages
    try:
        while True:

            print(f"[{player_id}] dans la boucle ")

            
            
            data = await websocket.receive_json()
            
            
            
            await room.handle_player_message( player_id, data)

    except WebSocketDisconnect:
        print(f"🔌 [{game_id}] Joueur {player_id} déconnecté")
        await room.handle_player_disconnect( player_id, game_id)

    except Exception as e:
        print(f"❌ [{game_id}] Erreur pour {player_id}: {e}")
        room.remove_player(player_id)
        cleanup_room_if_empty(game_id)





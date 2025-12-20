# /backend/app/api/websocket.py

from sqlmodel import select
from redis.asyncio import Redis as AsyncRedis
from app.models.tables import GameSession
from app.models.schemas import WordSearchState
from app.core.db import SessionDep
from app.games.wordsearch.gameRoom import GameRoom
from app.games.constants import GameMessages
from sqlmodel.ext.asyncio.session import AsyncSession
from app.games.constants import GAME_STATE_KEY_PREFIX
from app.games.constants import WS_TOKEN_PREFIX




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


async def get_game_session(session: SessionDep, game_id: str,ACTIVE_GAMES:dict) -> GameSession | None:
    """Récupère une session de jeu depuis la DB."""
    query = select(GameSession).where(GameSession.game_id == game_id)
    result = await session.exec(query)
    return result.first()

def get_or_create_room(game_id: str,db_session:AsyncSession ,redis_conn: AsyncRedis,ACTIVE_GAMES:dict) -> GameRoom:
    """Récupère ou crée une salle de jeu avec accès Redis."""
    if game_id not in ACTIVE_GAMES:
        ACTIVE_GAMES[game_id] = GameRoom(game_id=game_id,db_session=db_session, redis_conn=redis_conn)
    return ACTIVE_GAMES[game_id]



def cleanup_room_if_empty(game_id: str,ACTIVE_GAMES:dict) -> None:
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
    state_key = GAME_STATE_KEY_PREFIX + game_id
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


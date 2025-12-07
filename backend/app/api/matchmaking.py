# /backend/app/api/matchmaking.py
import json
from typing import Any, Dict

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.redis import RedisDep
from app.games.constants import Games
from app.auth.lib import TokenDep, get_current_user_id

router = APIRouter(prefix="/matchmaking", tags=["matchmaking"])

QUEUE_BASE_NAME = "matchmaking:queue:"
MATCH_NOTIFICATION_PREFIX = "match_notification:"


class QueueRequest(BaseModel):
    """Schéma pour les opérations sur la file d'attente."""
    game_name: Games


class QueueResponse(BaseModel):
    status: str
    player_id: str | None = None


class MatchResponse(BaseModel):
    status: str
    game_id: str | None = None
    game_name: str | None = None
    opponent_id: str | None = None
    initial_state: Dict[str, Any] | None = None


def _get_queue_key(game_name: Games) -> str:
    return f"{QUEUE_BASE_NAME}{game_name.value}"


def _decode_if_bytes(value: bytes | str) -> str:
    """Décode une valeur Redis si c'est des bytes."""
    if isinstance(value, bytes):
        return value.decode("utf-8")
    return value


@router.post("/join", status_code=status.HTTP_202_ACCEPTED, response_model=QueueResponse)
async def join_queue(
    request_data: QueueRequest,
    token: TokenDep,
    redis_conn: RedisDep,
):
    """Permet à un joueur de rejoindre la file d'attente."""
    player_id = get_current_user_id(token)
    queue_key = _get_queue_key(request_data.game_name)

    # Vérifier si le joueur est déjà en attente
    waiting_players = await redis_conn.lrange(queue_key, 0, -1)
    waiting_ids = [_decode_if_bytes(p) for p in waiting_players]

    if player_id in waiting_ids:
        return QueueResponse(status="already_waiting", player_id=player_id)

    # Ajouter le joueur à la file
    await redis_conn.rpush(queue_key, player_id)
    print(f"✅ Joueur {player_id} ajouté à la file {request_data.game_name.value}")

    return QueueResponse(status="waiting", player_id=player_id)


@router.post("/leave", status_code=status.HTTP_200_OK, response_model=QueueResponse)
async def leave_queue(
    request_data: QueueRequest,
    token: TokenDep,
    redis_conn: RedisDep,
):
    """Permet à un joueur de quitter la file d'attente."""
    player_id = get_current_user_id(token)
    queue_key = _get_queue_key(request_data.game_name)

    removed_count = await redis_conn.lrem(queue_key, 0, player_id)

    if removed_count == 0:
        return QueueResponse(status="not_in_queue", player_id=player_id)

    print(f"🚪 Joueur {player_id} a quitté la file {request_data.game_name.value}")
    return QueueResponse(status="left", player_id=player_id)


@router.get("/check-match", status_code=status.HTTP_200_OK)
async def check_match(
    token: TokenDep,
    redis_conn: RedisDep,
) -> MatchResponse | QueueResponse:
    """Vérifie si un match a été trouvé pour le joueur."""
    player_id = get_current_user_id(token)
    notification_key = f"{MATCH_NOTIFICATION_PREFIX}{player_id}"

    match_notification = await redis_conn.get(notification_key)

    if not match_notification:
        return QueueResponse(status="waiting")

    # Supprimer la notification pour éviter la réutilisation
    await redis_conn.delete(notification_key)

    # Désérialiser
    match_data = json.loads(_decode_if_bytes(match_notification))

    return MatchResponse(
        status="match_found",
        game_id=match_data.get("game_id"),
        game_name=match_data.get("game_name"),
        opponent_id=match_data.get("opponent_id"),
        initial_state=match_data.get("initial_state"),
    )


@router.post("/reset", status_code=status.HTTP_200_OK)
async def reset_queues(
    token: TokenDep,
    redis_conn: RedisDep,
):
    """
    Reset toutes les files d'attente.
    ⚠️ À protéger avec une vérification admin en production.
    """
    # TODO: Ajouter vérification admin
    # current_user = get_current_user(token)
    # if not current_user.is_admin:
    #     raise HTTPException(status_code=403, detail="Admin only")

    get_current_user_id(token)
    deleted_keys: list[str] = []

    async for key in redis_conn.scan_iter(f"{QUEUE_BASE_NAME}*"):
        await redis_conn.delete(key)
        deleted_keys.append(_decode_if_bytes(key))
        print(f"🗑️ Clé supprimée: {key}")

    return {
        "status": "reset",
        "deleted_count": len(deleted_keys),
        "deleted_keys": deleted_keys,
    }


@router.get("/status", status_code=status.HTTP_200_OK)
async def get_queue_status(
    redis_conn: RedisDep,
):
    """Retourne le nombre de joueurs en attente par type de jeu."""
    status_data = {}

    for game_name in Games:
        queue_key = _get_queue_key(game_name)
        count = await redis_conn.llen(queue_key)
        status_data[game_name.value] = count

    return {"queues": status_data}
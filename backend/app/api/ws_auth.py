

from fastapi import APIRouter,status, Query
from sqlmodel import SQLModel
from app.core.redis import RedisDep
from app.lib.auth import TokenDep, get_current_user_id
from app.games.constants import WS_TOKEN_PREFIX

router = APIRouter(tags=["websocket authentification"])


# --- Constantes pour le Token Éphémère ---
WS_TOKEN_EXPIRE_SECONDS = 600 # 5 minutes


class WsTokenResponse(SQLModel):
    """Schéma de réponse pour l'échange de token WebSocket."""
    ws_token: str
    expires_in: int = WS_TOKEN_EXPIRE_SECONDS


# -----------------------------------------------------------------
# ENDPOINTS D'AUTHENTIFICATION WS
# -----------------------------------------------------------------


@router.post("/ws-auth", response_model=WsTokenResponse, status_code=status.HTTP_200_OK)
async def websocket_auth_exchange(
    token: TokenDep,
    redis_conn: RedisDep,
):
    """Échange le JWT contre un token éphémère pour l'accès WebSocket."""
    player_id = get_current_user_id(token)

    from uuid import uuid1
    # Générer un token aléatoire (uuid4 est plus sécurisé que uuid1)
    ws_token = str(uuid1())

    # Stocker l'association token -> player_id avec expiration
    await redis_conn.set(
        f"{WS_TOKEN_PREFIX}{ws_token}",
        player_id,
        ex=WS_TOKEN_EXPIRE_SECONDS,
    )

    return WsTokenResponse(ws_token=ws_token)


@router.post("/ws-refresh", response_model=WsTokenResponse, status_code=status.HTTP_200_OK)
async def refresh_ws_token(
    token: TokenDep,
    redis_conn: RedisDep,
):
    """Génère un nouveau token WebSocket éphémère."""
    player_id = get_current_user_id(token)

    from uuid import uuid1

    new_ws_token = str(uuid1())

    await redis_conn.set(
        f"{WS_TOKEN_PREFIX}{new_ws_token}",
        player_id,
        ex=WS_TOKEN_EXPIRE_SECONDS,
    )

    return WsTokenResponse(ws_token=new_ws_token)

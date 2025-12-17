# /backend/app/core/matchmaker_service.py
import asyncio
import json
import uuid
from typing import Optional

from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.redis import get_redis_client
from app.core.db import get_db_session
from app.games.constants import Games
from app.games.wordsearch.wordsearch_controller import WordSearchController

QUEUE_BASE_NAME = "matchmaking:queue:"
MATCH_NOTIFICATION_TTL = 60  # secondes
STOP_EVENT = asyncio.Event()

async def try_match_players(
    queue_key: str,
    game_name: Games,
    db_session: AsyncSession,
    redis_client,
) -> bool:
    """
    Tente de matcher deux joueurs d'une file d'attente.
    Retourne True si un match a été créé.
    """
    queue_size = await redis_client.llen(queue_key)
    
    if queue_size < 2:
        if queue_size == 1:
            print(f"[{game_name.value}] Un joueur en attente...")
        return False

    async with redis_client.pipeline(transaction=True) as pipe:
        await pipe.lpop(queue_key)
        await pipe.lpop(queue_key)
        player1_id, player2_id = await pipe.execute()

    # Sécurité : remettre le joueur si l'autre est invalide
    if not player1_id or not player2_id:
        if player1_id:
            await redis_client.rpush(queue_key, player1_id)
        if player2_id:
            await redis_client.rpush(queue_key, player2_id)
        return False

    # Décoder si bytes (Redis renvoie des bytes par défaut)
    if isinstance(player1_id, bytes):
        player1_id = player1_id.decode()
    if isinstance(player2_id, bytes):
        player2_id = player2_id.decode()

    print(f"✅ Match trouvé [{game_name.value}]: {player1_id} vs {player2_id}")

    game_id = str(uuid.uuid4())

    # Initialisation de la partie
    init_state = await WordSearchController.initialize_game(
        game_id=game_id,
        game_name=game_name.value,
        p1_id=player1_id,
        p2_id=player2_id,
        db_session=db_session,
        redis_client=redis_client,
    )

    if init_state is None:
        print(f"❌ Échec d'initialisation du jeu {game_id}, remise en file")
        await redis_client.rpush(queue_key, player1_id, player2_id)
        return False

    # Notification des joueurs
    await notify_players(
        redis_client=redis_client,
        game_id=game_id,
        game_name=game_name,
        player1_id=player1_id,
        player2_id=player2_id,
    )

    return True


async def notify_players(
    redis_client,
    game_id: str,
    game_name: Games,
    player1_id: str,
    player2_id: str,
) -> None:
    """Envoie les notifications de match aux deux joueurs."""
    base_data = {
        "type": "match_found",
        "game_id": game_id,
        "game_name": game_name.value,  # Sérialiser l'enum en string
    }

    await asyncio.gather(
        redis_client.set(
            f"match_notification:{player1_id}",
            json.dumps({**base_data, "opponent_id": player2_id}),
            ex=MATCH_NOTIFICATION_TTL,
        ),
        redis_client.set(
            f"match_notification:{player2_id}",
            json.dumps({**base_data, "opponent_id": player1_id}),
            ex=MATCH_NOTIFICATION_TTL,
        ),
    )


async def process_all_queues(db_session: AsyncSession, redis_client) -> None:
    """Traite toutes les files d'attente de matchmaking."""
    for game_name in Games:
        queue_key = f"{QUEUE_BASE_NAME}{game_name.value}"
        try:
            await try_match_players(queue_key, game_name, db_session, redis_client)
        except Exception as e:
            print(f"❌ Erreur sur la queue {game_name.value}: {e}")


async def run_matchmaking_consumer() -> None:
    """
    Tâche d'arrière-plan qui vérifie les files d'attente et crée les matchs.
    """
    print("🚀 Démarrage du consumer matchmaking...")
    
    redis_client = get_redis_client()
    
    if redis_client is None:
        print("❌ Impossible de démarrer: Redis non disponible")
        return

    while not STOP_EVENT.is_set():
        #print("matchmaking service running...")
        db_session: Optional[AsyncSession] = None
        
        try:
            db_session = await get_db_session()
            await process_all_queues(db_session, redis_client)
            
        except Exception as e:
            print(f"❌ ERREUR MATCHMAKING: {e.__class__.__name__}: {e}")
            await asyncio.sleep(5)
            continue
            
        finally:
            if db_session:
                await db_session.close()

        await asyncio.sleep(1)
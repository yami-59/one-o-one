import datetime
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from sqlmodel import select, func, desc

from app.core.db import SessionDep
from app.models.tables import User
from app.lib.auth import TokenDep, get_current_user_id
from app.core.redis import RedisDep

router = APIRouter(tags=["statistiques"])

# =============================================================================
# SCHÉMAS DE RÉPONSE (DTO)
# =============================================================================

class UserStats(BaseModel):
    """Statistiques détaillées pour le profil du joueur connecté."""
    username: str
    victories: int
    defeats: int
    ratio: float
    rank: Optional[int] = None
    total_games: int

class GlobalLiveStats(BaseModel):
    """Compteurs en temps réel affichés dans le Lobby."""
    online_players: int
    active_games: int
    games_today: int

class LeaderboardEntry(BaseModel):
    """Entrée pour le Top 10 des joueurs."""
    username: str
    victories: int
    rank: int

# =============================================================================
# ENDPOINTS
# =============================================================================

@router.get("/stats/global", response_model=GlobalLiveStats)
async def get_global_stats(redis_conn: RedisDep):
    """
    Récupère les chiffres 'Live' de l'application via Redis.
    - Joueurs en ligne : basés sur les tokens WebSocket actifs.
    - Parties actives : basées sur les états de jeux stockés.
    """
    online_count = 0
    # On scanne les clés d'authentification WebSocket éphémères
    async for _ in redis_conn.scan_iter("ws_auth:*"):
        online_count += 1
    
    active_count = 0
    # On scanne les préfixes d'état de jeu
    async for _ in redis_conn.scan_iter("game_state:*"):
        active_count += 1

    # Récupération du compteur de parties créées aujourd'hui
    today = datetime.date.today().isoformat()
    games_today_raw = await redis_conn.get(f"stats:games_count:{today}")
    games_today = int(games_today_raw) if games_today_raw else 0

    return GlobalLiveStats(
        online_players=online_count,
        active_games=active_count,
        games_today=games_today
    )

@router.get("/stats/me", response_model=UserStats)
async def get_my_stats(token: TokenDep, session: SessionDep):
    """
    Récupère les statistiques personnelles du joueur et calcule son rang mondial.
    """
    user_id = get_current_user_id(token)

     # 2. Vérification de l'existence de l'utilisateur en DB
    statement = select(User).where(User.user_id == user_id)
    user : User = (await session.exec(statement)).first()


    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Calcul dynamique du rang : compte les joueurs ayant strictement plus de victoires
    rank_query = select(func.count(User.user_id)).where(User.victories > user.victories)
    better_players_count = (await session.exec(rank_query)).one()
    
    total = user.victories + user.defeats
    ratio = round((user.victories / total), 2) if total > 0 else 0.0
    
    # Un joueur n'est classé que s'il a au moins une victoire ou une défaite
    rank = better_players_count + 1 if total > 0 else None

    return UserStats(
        username=user.username,
        victories=user.victories,
        defeats=user.defeats,
        ratio=ratio,
        rank=rank,
        total_games=total
    )

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(session: SessionDep):
    """
    Retourne les 10 meilleurs joueurs de la plateforme triés par victoires.
    """
    # Sélection des utilisateurs triés par victoires de façon décroissante
    query = select(User).order_by(desc(User.victories)).limit(10)
    result = await session.exec(query)
    top_users = result.all()
    
    return [
        LeaderboardEntry(
            username=u.username, 
            victories=u.victories, 
            rank=i + 1
        ) for i, u in enumerate(top_users)
    ]
from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.core.db import SessionDep
from app.models.schemas import UserStats
from app.models.tables import User
from app.auth.lib import TokenDep, get_current_user_id

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me/stats", response_model=UserStats, status_code=status.HTTP_200_OK)
async def get_my_stats(token: TokenDep, session: SessionDep):
    """Récupère les statistiques de l'utilisateur connecté."""
    user_id = get_current_user_id(token)

    statement = select(User).where(User.user_id == user_id)
    result = await session.exec(statement)
    user = result.first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    return UserStats(
        victories=user.victories,
        defeats=user.defeats,
    )


@router.get("/{player_id}/stats", response_model=UserStats, status_code=status.HTTP_200_OK)
async def get_player_stats(player_id: str, session: SessionDep):
    """Récupère les statistiques d'un joueur par son ID (public)."""
    statement = select(User).where(User.user_id == player_id)
    result = await session.exec(statement)
    user = result.first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Joueur {player_id} introuvable.",
        )

    return UserStats(
        victories=user.victories,
        defeats=user.defeats,
    )


from app.models.schemas import UserProfile  # À créer

@router.get("/me", response_model=UserProfile, status_code=status.HTTP_200_OK)
async def get_my_profile(token: TokenDep, session: SessionDep):
    """Récupère le profil complet de l'utilisateur connecté."""
    user_id = get_current_user_id(token)

    statement = select(User).where(User.user_id == user_id)
    result = await session.exec(statement)
    user = result.first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable.",
        )

    return user  # Retourne l'objet User complet
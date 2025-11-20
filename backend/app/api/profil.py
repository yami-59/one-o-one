from sqlmodel import  select
from fastapi import APIRouter, HTTPException, status
from app.core.db import SessionDep
from app.models.schemas import UserStats
from app.models.tables import User
from app.utils.auth import get_current_player_id,TokenDep




# Créez l'objet router (assurez-vous qu'il est défini dans votre application principale)
router = APIRouter(tags=["Profile"])

@router.get("/api/v1/profile/{player_identifier}", response_model=UserStats)
def read_Stats(
    token:TokenDep,
    session: SessionDep 
):
    """
    Récupère les informations et statistiques d'un utilisateur par son identifiant.
    """

    player_identifier=get_current_player_id(token)
    # 1. Requête SELECT pour trouver l'utilisateur par son identifiant unique
    statement = select(User.victories,User.defeats).where(User.identifier == player_identifier)
    stats = session.exec(statement).first()

    # 2. Vérification de l'existence
    if not stats:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Utilisateur (token: {player_identifier}) introuvable."
        )

    # 3. Retourne l'objet User (FastAPI le sérialisera en JSON)
    return stats
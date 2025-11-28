# /backend/app/api/matchmaking.py (Nouveau fichier)

import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.db import get_session # Dépendance Session DB
from app.models.user import User, UserCreate
from app.models.game import GameSession, GameSessionCreate
from app.models.game_schemas import BoardState # Pour initialiser l'état du jeu

router = APIRouter()

# Variable simple en mémoire pour simuler la file d'attente pour le MVP
# Attention : ceci ne fonctionne que si vous n'avez qu'un seul processus FastAPI !
WAITING_PLAYER_ID: str | None = None


# /backend/app/api/matchmaking.py (suite)

@router.post("/join-queue")
async def join_queue(
    user_data: UserCreate, 
    session: Annotated[Session, Depends(get_session)]
):
    """
    Permet à un joueur (identifié par 'identifier') de rejoindre la file d d'attente.
    Crée le joueur en DB s'il n'existe pas (mode Invité).
    """
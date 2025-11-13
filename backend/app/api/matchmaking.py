# /backend/app/api/matchmaking.py (Nouveau fichier)

import uuid
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from .dependencies import PlayerIdentifierDep,SessionDep
from app.core.db import get_session # Dépendance Session DB
from app.models.user import User, UserCreate
from app.models.gameSession import GameSession, GameSessionCreate
from app.models.gameSchemas import BoardState # Pour initialiser l'état du jeu
from crud.user import createGuest
from utils.enums import Status


router = APIRouter()

# Variable simple en mémoire pour simuler la file d'attente pour le MVP
# Attention : ceci ne fonctionne que si vous n'avez qu'un seul processus FastAPI !
WAITING_PLAYER_ID: str | None = None


# /backend/app/api/matchmaking.py 

@router.post("/join-queue")
async def join_queue(
    current_identifier: PlayerIdentifierDep,
    session: SessionDep
):
    """
    Permet à un joueur (identifié par 'identifier') de rejoindre la file d d'attente.
    Crée le joueur en DB s'il n'existe pas (mode Invité).
    """
    global WAITING_PLAYER_ID

    # --- 1. Déterminer l'Identifiant (Création si Nouvel Invité) ---
    player_id = current_identifier

    if player_id is None : 
        player_id=createGuest(session)

    if WAITING_PLAYER_ID is None:
        WAITING_PLAYER_ID = player_id
        return {"status": Status.waiting, "message": "En attente d'un adversaire...", "identifier": player_id}


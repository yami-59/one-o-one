# /backend/app/api/matchmaking.py (Nouveau fichier)


from fastapi import APIRouter
from .dependencies import SessionDep
from app.utils.enums import Status


router = APIRouter()

# Variable simple en mémoire pour simuler la file d'attente pour le MVP
# Attention : ceci ne fonctionne que si vous n'avez qu'un seul processus FastAPI !
WAITING_PLAYER_ID: str | None = None


# /backend/app/api/matchmaking.py 

@router.post("/join-queue")
async def join_queue(
    identifier: str,
    session: SessionDep
):
    """
    Permet à un joueur (identifié par 'identifier') de rejoindre la file d d'attente.
    Crée le joueur en DB s'il n'existe pas (mode Invité).
    """
    global WAITING_PLAYER_ID



    if WAITING_PLAYER_ID is None:
        WAITING_PLAYER_ID = identifier
        return {"status": Status.waiting, "message": "En attente d'un adversaire...", "identifier": identifier}


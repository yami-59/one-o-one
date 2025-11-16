# /backend/app/api/matchmaking.py (Nouveau fichier)


from fastapi import APIRouter,status
from .dependencies import SessionDep
from app.utils.utils import Status
from app.models.schemas import PlayerIdentifier
import uuid

router = APIRouter()

# Variable simple en mémoire pour simuler la file d'attente pour le MVP
# Attention : ceci ne fonctionne que si vous n'avez qu'un seul processus FastAPI !
WAITING_PLAYER_ID: str | None = None


# /backend/app/api/matchmaking.py 

@router.post("/join-queue",status_code=status.HTTP_202_ACCEPTED)
async def join_queue(
    identifier: PlayerIdentifier,
    session: SessionDep
):
    """
    Permet à un joueur (identifié par 'identifier') de rejoindre la file d d'attente.
    """
    global WAITING_PLAYER_ID



    if WAITING_PLAYER_ID is None:
        WAITING_PLAYER_ID = identifier
        return {"PlayerStatus": Status.waiting, "message": "En attente d'un adversaire...", "identifier": identifier}

    if identifier != WAITING_PLAYER_ID:
    # Match trouvé !
    # ...
    # SCÉNARIO 2 : Match trouvé
        # Récupération des deux identifiants de joueurs :
        player_a_id = WAITING_PLAYER_ID
        player_b_id = identifier


        # 🎯 Création de l'ID unique de la partie
        game_id = str(uuid.uuid4())

        pass
    else:
        # Erreur : Le joueur est déjà en file d'attente
        return {"status": "error", "message": "Vous êtes déjà en attente de match."}

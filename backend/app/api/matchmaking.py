# /backend/app/api/matchmaking.py 


from fastapi import APIRouter,status
from app.core.db import SessionDep
from app.utils.enums import Status
from app.models.schemas import GameStateBase
import uuid
from app.models.tables import GameSession
from app.utils.auth import get_current_player_id,TokenDep





router = APIRouter()

# Variable simple en mémoire pour simuler la file d'attente pour le MVP
# Attention : ceci ne fonctionne que si vous n'avez qu'un seul processus FastAPI !
WAITING_PLAYER_ID: str | None = None



@router.post("/matchmaking/join",status_code=status.HTTP_200_OK)
async def join_queue(
    token:TokenDep,
    session: SessionDep
):
    """
    Permet à un joueur (identifié par 'identifier') de rejoindre la file d d'attente.
    """
    global WAITING_PLAYER_ID

    player_id=get_current_player_id(token)
    if WAITING_PLAYER_ID is None:
        WAITING_PLAYER_ID = player_id
        return {"status": Status.waiting, "message": "En attente d'un adversaire..."}

    elif player_id != WAITING_PLAYER_ID:

        
    # Match trouvé 
        # Récupération des deux identifiants de joueurs :
        first_in_queue = WAITING_PLAYER_ID
        second_in_queue= player_id

        # Création de l'ID unique de la partie
        g_id = str(uuid.uuid4())

        WAITING_PLAYER_ID=None

        new_game = GameSession (
            game_id=g_id, 
            player1_identifier=first_in_queue, 
            player2_identifier=second_in_queue,
            game_name="WORDSEARCH",
            game_data=GameStateBase().model_dump_json(indent=2)
        )
        
        session.add(new_game)
        await session.commit()
        await session.refresh(new_game)
        
        

        # Envoi de la réponse finale au Joueur B
        return {
            "status": Status.matched,
            # "game_id": new_game.game_id, # 🎯 La clé pour la connexion WebSocket
            "opponent_identifier": first_in_queue,
            "message": "Match trouvé ! Début de la session de jeu."
        }
    
    else:
        # 200 OK est plus approprié que 202 ACCEPTED pour signaler que rien n'a changé
        return {"status": Status.alreadyWaiting, "message": "Vous êtes déjà en file d'attente."}



@router.post("/matchmaking/reset",status_code=status.HTTP_200_OK)
def reset():


    global WAITING_PLAYER_ID
    
    WAITING_PLAYER_ID=None

    return {"message": "tous les joueurs on quitté la file"}
    
    


from pydantic import BaseModel
from typing import List, Dict

class GameStateBase(BaseModel):
    """
    État générique de la partie (Parent de tous les schémas de jeu).
    Contient les données partagées par tous les types de jeux.
    """
    
    # Score en temps réel : Commun à tous les jeux
    realtime_score: Dict[str, int] = {} # {identifier_joueur: score_actuel}

    pass



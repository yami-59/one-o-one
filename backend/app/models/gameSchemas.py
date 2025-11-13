

from pydantic import BaseModel
from typing import Dict, List, Any, Literal


class GameStateBase(BaseModel):
    """
    Classe parent agnostique au tour. Définit l'état commun à tous les jeux.
    """
    
    # Indique le type de jeu (Crucial pour le routage)
    game_type: Literal["mot_mele", "quiz", "reflexe"] # Utilise Literal pour valider les types
    
    
    # Score en temps réel (toujours nécessaire)
    realtime_score: Dict[str, int] = {} # {identifier_joueur: score_actuel}
    
    # Données Spécifiques au Joueur (ex: prêt à jouer, vies restantes, etc.)
    player_data: Dict[str, Dict[str, Any]] = {} # {identifier_joueur: {statut_specifique}}


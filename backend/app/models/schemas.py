from typing import Dict, Any
from sqlmodel import SQLModel 

class GameStateBase(SQLModel):
    """
    Classe parent agnostique au tour. Définit l'état commun à tous les jeux.
    """    
    # Score en temps réel (toujours nécessaire)
    realtime_score: Dict[str, int] = {} # {identifier_joueur: score_actuel}
    
    # Données Spécifiques au Joueur (ex: prêt à jouer, vies restantes, etc.)
    player_data: Dict[str, Any] = {} # {identifier_joueur: {statut_specifique}}

class PlayerIdentifier(SQLModel):
    identifier: str


class UserStats(SQLModel):
    victories:int
    defeats:int

# Schéma de réponse pour la connexion
class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    player_identifier: str

# Schéma de réponse pour la connexion
class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "bearer"
    player_identifier: str

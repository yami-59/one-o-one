from typing import Any, Dict, List, Tuple

from sqlmodel import Field, SQLModel
from sqlalchemy.dialects.postgresql import JSON
from pydantic import EmailStr



class Index(SQLModel):
    row: int
    col: int


class WordSolution(SQLModel):
    """Schéma de la solution d'un mot."""

    word: str
    start_index: Index
    end_index: Index



# Nouveau Modèle : Stockage Sécurisé
class WordSearchSolutionData(SQLModel):
    """Contient toutes les coordonnées de la solution (DONNÉE PRIVÉE)."""
    
    # Stocke le mot et ses coordonnées de placement (start/end)
    solutions: List[WordSolution] = Field(default_factory=JSON)
    
    # ⚠️ Ce modèle n'est JAMAIS envoyé au frontend.

class GameBaseState(SQLModel):
    """
    Classe parent agnostique au tour. Définit l'état commun à tous les jeux.
    """

    # Score en temps réel (toujours nécessaire)
    realtime_score: Dict[str, int] = {}  # {player_id: score_actuel}

    game_duration:int 
    


class WordSearchState(GameBaseState):
    theme: str
    grid_data: List[List[str]] = Field(default_factory=list)
    
    # 🎯 CORRECTION : Remplace solution_words par les mots à trouver (strings)
    # Le frontend a juste besoin de la liste des chaînes pour l'affichage (liste latérale).
    words_to_find: List[str] = Field(default_factory=list) 
    
    words_found: Dict[str, List[WordSolution]] = Field(default_factory=dict)


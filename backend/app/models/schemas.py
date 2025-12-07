from typing import Any, Dict, List, Tuple

from sqlmodel import Field, SQLModel
from sqlalchemy.dialects.postgresql import JSON


class UserStats(SQLModel):
    victories: int
    defeats: int


class GameStateBase(SQLModel):
    """
    Classe parent agnostique au tour. Définit l'état commun à tous les jeux.
    """

    # Score en temps réel (toujours nécessaire)
    realtime_score: Dict[str, int] = {}  # {player_id: score_actuel}

    # Données Spécifiques au Joueur (ex: prêt à jouer, vies restantes, etc.)
    player_data: Dict[str, Any] = {}  # {player_id: {statut_specifique}}


# -----------------------------------------------------------------
# CLASSE ENFANT : MOT-MÊLÉ
# -----------------------------------------------------------------

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



class WordSearchState(GameStateBase):
    theme: str
    grid_data: List[List[str]] = Field(default_factory=list)
    
    # 🎯 CORRECTION : Remplace solution_words par les mots à trouver (strings)
    # Le frontend a juste besoin de la liste des chaînes pour l'affichage (liste latérale).
    words_to_find: List[str] = Field(default_factory=list) 
    
    words_found: Dict[str, List[WordSolution]] = Field(default_factory=dict)


# -----------------------------------------------------------------
# SCHÉMAS DE MESSAGES WEBSOCKET
# -----------------------------------------------------------------

class GameStateMessage(SQLModel):
    """Message envoyé au client avec l'état du jeu."""
    type: str = "game_state"
    game_id: str
    theme: str
    grid_data: List[List[str]]
    words_to_find: List[str]
    words_found: Dict[str, List[str]]
    realtime_score: Dict[str, int]



class SelectionUpdate(SQLModel):
    """Message de mise à jour de sélection (aperçu en temps réel)."""
    type: str = "selection_update"
    position: Dict[str, Any]  # {start_point: {x, y}, end_point: {x, y}}
    color: str


class SubmitSelection(SQLModel):
    """Message de soumission d'un mot."""
    type: str = "submit_selection"
    word: str
    start_index: Index
    end_index: Index


class WordFoundResponse(SQLModel):
    """Réponse quand un mot est trouvé."""
    type: str = "word_found_success"
    word: str
    player_id: str
    score_update: int
    new_score: int


class ScoreUpdate(SQLModel):
    """Mise à jour des scores."""
    type: str = "score_update"
    scores: Dict[str, int]
from typing import Dict, Any
from sqlmodel import SQLModel 
from sqlmodel import SQLModel ,Field
from typing import Dict, List, Any, Tuple




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


class WordSolution(SQLModel):
    """Schéma de la solution d'un mot."""
    word: str
    start_index :Dict[str,int]
    end_index:Dict[str,int]




class GameStateBase(SQLModel):
    """
    Classe parent agnostique au tour. Définit l'état commun à tous les jeux.
    """    
    # Score en temps réel (toujours nécessaire)
    realtime_score: Dict[str, int] = {} # {identifier_joueur: score_actuel}
    
    # Données Spécifiques au Joueur (ex: prêt à jouer, vies restantes, etc.)
    player_data: Dict[str, Any] = {} # {identifier_joueur: {statut_specifique}}

   
        
        




# -----------------------------------------------------------------
# CLASSE ENFANT : MOT-MÊLÉ
# -----------------------------------------------------------------
class WordSearchState(GameStateBase):
    """
    État spécifique au jeu de Mot-Mêlé.
    """

    # 1. Structure de la Grille
    # La grille 10*10 avec les lettres à afficher
    grid_data: List[List[str]]
    
    # 2. La Solution (la vérité de ce qui est caché)
    # Liste des mots que les joueurs doivent trouver
    solution_words: List[WordSolution] 
    
    # 3. Le Suivi de la Progression
    # Stocke les mots déjà trouvés (pour empêcher la double validation)
    words_found: Dict[str, List[str]] = {}
    # Format: {player_identifier: [word1, word2, ...]}

    



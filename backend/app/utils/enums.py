from enum import Enum

class Status(str, Enum):
    waiting = "waiting"
    alreadyWaiting="already waiting"
    ready="ready"
    matched="matched"
    active = "active"
    paused = "paused"
    timeout = "timeout"
    finished = "finished"
    abandoned = "abandoned"



class GameName (str,Enum):
    wordsearch="WORDSEARCH"



class GameMessageType(str, Enum):
    """Types de messages pour la communication WebSocket."""
    
    # ----------------------------------------------------
    # MESSAGES ENVOYÉS PAR LE CLIENT (Action/Demande)
    # ----------------------------------------------------
    SUBMIT_SELECTION = "submit_selection"     # Soumission du mot final (validation)
    SELECTION_UPDATE = "selection_update"     # Mise à jour des coordonnées (aperçu en temps réel)
    PLAYER_JOINED = "player_joined"             # Le client a chargé la grille
    
    # ----------------------------------------------------
    # MESSAGES ENVOYÉS PAR LE SERVEUR (Événements/Mises à jour)
    # ----------------------------------------------------
    GAME_START = "game_start"                 # Début du chronomètre
    GAME_OVER = "game_over"                   # Fin de partie (score final)
    WORD_FOUND_SUCCESS = "word_found_success" # Mot trouvé, rayer la liste
    REMOTE_SELECTION = "remote_selection"     # Aperçu de la sélection de l'adversaire
    SCORE_UPDATE = "score_update"             # Mise à jour des scores
    WAITING_FOR_OPPONENT="waiting_for_opponent"
    
    # Statuts d'Erreur
    ERROR = "error"
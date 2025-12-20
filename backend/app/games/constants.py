from enum import Enum


QUEUE_KEY_PREFIX = "matchmaking:queue:"

GAME_STATE_KEY_PREFIX = "game:state:"

SOLUTION_KEY_PREFIX = "game:solution:"

MATCH_NOTIFICATION_PREFIX = "match_notification:"

WS_TOKEN_PREFIX = "ws_auth:"


class GameStatus(str, Enum):
    WAITING_FOR_PLAYERS = "waiting_for_players"
    GAME_START = "game_start"
    GAME_IN_PROGRESS = "game_in_progress"
    GAME_INITIALIZED = "game_initialized"
    GAME_FINISHED = "game_finished"
    GAME_CLOSED = "game_closed"
    STARTING_COUNTDOWN = "starting_countdown"
    PREPARING="prepare_game"


class Games(str, Enum):
    wordsearch = "wordsearch"



class GameMessages(str, Enum):
    """Types de messages pour la communication WebSocket."""

    # ----------------------------------------------------
    # MESSAGES ENVOYÉS PAR LE CLIENT (Action/Demande)
    # ----------------------------------------------------
    SUBMIT_SELECTION = "submit_selection"  # Soumission du mot final (validation)
    SELECTION_UPDATE = "selection_update"  # Mise à jour des coordonnées (aperçu en temps réel)
    WORD_FOUND_SUCCESS = "word_found_success"  # Mot trouvé, rayer la liste
    GAME_STATE="game_state"
    SCORE_UPDATE="score_update"

    # Statuts d'Erreur
    ERROR = "error"



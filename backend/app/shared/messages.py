# /backend/app/games/messages.py
"""
Constantes centralisées pour les messages WebSocket et statuts de jeu.
Ce fichier définit le contrat de communication entre le backend et le frontend.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from app.models.schemas import GameBaseData

# =============================================================================
# ÉNUMÉRATIONS - STATUTS ET TYPES DE MESSAGES
# =============================================================================


class GameStatus(str, Enum):
    """Statuts possibles d'une partie."""
    
    # Initialisation
    INITIALIZED = "initialized"
    WAITING_FOR_PLAYERS = "waiting_for_players"
    
    # Démarrage
    STARTING_COUNTDOWN = "starting_countdown"
    
    # En cours
    IN_PROGRESS = "in_progress"
    
    # Fin
    FINISHED = "finished"
    CANCELLED = "cancelled"
    
    # Erreur
    ERROR = "error"


class MessageType(str, Enum):
    """Types de messages WebSocket échangés."""
    
    # ─────────────────────────────────────────────────────────────────────────
    # MESSAGES SERVEUR → CLIENT
    # ─────────────────────────────────────────────────────────────────────────
    
    # Connexion et état du jeu
    GAME_STATE = "GAME_STATE"                    # État complet du jeu envoyé à la connexion
    GAME_STATUS_UPDATE = "game_status_update"    # Mise à jour du statut uniquement
    
    # Phases de jeu
    WAITING_FOR_PLAYERS = "waiting_for_players"  # En attente d'un autre joueur
    STARTING_COUNTDOWN = "starting_countdown"    # Compte à rebours avant démarrage
    GAME_START = "game_start"                    # La partie démarre
    GAME_FINISHED = "game_finished"              # La partie est terminée
    
    # Événements de jeu
    WORD_FOUND = "word_found"                    # Un mot a été trouvé (par n'importe quel joueur)
    WORD_INVALID = "word_invalid"                # Le mot soumis est invalide
    WORD_ALREADY_FOUND = "word_already_found"    # Le mot a déjà été trouvé
    SCORE_UPDATE = "score_update"                # Mise à jour des scores
    TIME_UPDATE = "time_update"                  # Mise à jour du temps restant
    
    # Événements joueur
    PLAYER_JOINED = "player_joined"              # Un joueur a rejoint
    PLAYER_LEFT = "player_left"                  # Un joueur a quitté
    PLAYER_DISCONNECTED = "player_disconnected"  # Un joueur s'est déconnecté
    PLAYER_RECONNECTED = "player_reconnected"    # Un joueur s'est reconnecté
    OPPONENT_SELECTION = "opponent_selection"    # Sélection de l'adversaire (aperçu)
    
    # Erreurs
    ERROR = "error"                              # Message d'erreur générique
    
    # ─────────────────────────────────────────────────────────────────────────
    # MESSAGES CLIENT → SERVEUR
    # ─────────────────────────────────────────────────────────────────────────
    
    # Actions joueur
    PLAYER_READY = "player_ready"                # Le joueur est prêt
    SELECTION_UPDATE = "selection_update"        # Mise à jour de la sélection (aperçu temps réel)
    SELECTION_RESET = "selection_reset"          # Reset de la sélection
    SUBMIT_WORD = "submit_word"                  # Soumission d'un mot
    
    # Requêtes
    REQUEST_STATE = "request_state"              # Demande l'état actuel du jeu
    PING = "ping"                                # Heartbeat
    PONG = "pong"                                # Réponse heartbeat


class GameEndReason(str, Enum):
    """Raisons de fin de partie."""
    
    TIME_UP = "time_up"                          # Temps écoulé
    ALL_WORDS_FOUND = "all_words_found"          # Tous les mots trouvés
    PLAYER_DISCONNECTED = "player_disconnected"  # Adversaire déconnecté
    PLAYER_FORFEIT = "player_forfeit"            # Abandon
    ERROR = "error"                              # Erreur technique


class ErrorCode(str, Enum):
    """Codes d'erreur standardisés."""
    
    # Authentification
    AUTH_INVALID_TOKEN = "auth_invalid_token"
    AUTH_EXPIRED_TOKEN = "auth_expired_token"
    
    # Jeu
    GAME_NOT_FOUND = "game_not_found"
    GAME_ALREADY_STARTED = "game_already_started"
    GAME_NOT_IN_PROGRESS = "game_not_in_progress"
    PLAYER_NOT_IN_GAME = "player_not_in_game"
    
    # Sélection
    INVALID_SELECTION = "invalid_selection"
    WORD_NOT_IN_GRID = "word_not_in_grid"
    
    # Technique
    INTERNAL_ERROR = "internal_error"
    RATE_LIMITED = "rate_limited"


# =============================================================================
# MODÈLES DE MESSAGES - SERVEUR → CLIENT
# =============================================================================


class BaseMessage(BaseModel):
    """Message de base avec type obligatoire."""
    type: MessageType


class GameStateMessage(BaseMessage):
    """État complet du jeu envoyé à la connexion."""
    type: MessageType = MessageType.GAME_STATE
    
    # Identifiants
    game_id: str
    player_id: str
    opponent_id: Optional[str] = None
    
    # État du jeu
    status: GameStatus
    GAME_STATE:GameBaseData            # {player_id: score}
    
    # Timing
    time_remaining: Optional[int] = None
    game_duration: int = 180


class WaitingForPlayersMessage(BaseMessage):
    """En attente d'un autre joueur."""
    type: MessageType = MessageType.WAITING_FOR_PLAYERS
    message: str = "En attente d'un autre joueur..."
    players_connected: int = 1
    players_required: int = 2


class StartingCountdownMessage(BaseMessage):
    """Compte à rebours avant le début."""
    type: MessageType = MessageType.STARTING_COUNTDOWN
    countdown: int
    message: str = "La partie va commencer..."


class GameStartMessage(BaseMessage):
    """La partie commence."""
    type: MessageType = MessageType.GAME_START
    message: str = "C'est parti !"
    time_remaining: int
    

class GameFinishedMessage(BaseMessage):
    """La partie est terminée."""
    type: MessageType = MessageType.GAME_FINISHED
    reason: GameEndReason
    winner_id: Optional[str] = None
    is_draw: bool = False
    final_scores: Dict[str, int]
    message: str = "Partie terminée"


class WordFoundMessage(BaseMessage):
    """Un mot a été trouvé."""
    type: MessageType = MessageType.WORD_FOUND
    word: str
    player_id: str
    points_earned: int
    new_score: int
    words_remaining: int


class WordInvalidMessage(BaseMessage):
    """Le mot soumis est invalide."""
    type: MessageType = MessageType.WORD_INVALID
    word: str
    reason: str  # "not_in_list", "wrong_path", "already_found"


class ScoreUpdateMessage(BaseMessage):
    """Mise à jour des scores."""
    type: MessageType = MessageType.SCORE_UPDATE
    scores: Dict[str, int]


class TimeUpdateMessage(BaseMessage):
    """Mise à jour du temps restant."""
    type: MessageType = MessageType.TIME_UPDATE
    time_remaining: int


class OpponentSelectionMessage(BaseMessage):
    """Sélection de l'adversaire (aperçu temps réel)."""
    type: MessageType = MessageType.OPPONENT_SELECTION
    position: Optional[Dict[str, Any]] = None  # {start_point, end_point}
    color: Optional[str] = None
    word_preview: Optional[str] = None


class PlayerEventMessage(BaseMessage):
    """Événement lié à un joueur."""
    type: MessageType  # PLAYER_JOINED, PLAYER_LEFT, etc.
    player_id: str
    message: str


class ErrorMessage(BaseMessage):
    """Message d'erreur."""
    type: MessageType = MessageType.ERROR
    code: ErrorCode
    message: str
    details: Optional[Dict[str, Any]] = None


# =============================================================================
# MODÈLES DE MESSAGES - CLIENT → SERVEUR
# =============================================================================


class PlayerReadyMessage(BaseMessage):
    """Le joueur est prêt."""
    type: MessageType = MessageType.PLAYER_READY


class SelectionUpdateMessage(BaseMessage):
    """Mise à jour de la sélection en temps réel."""
    type: MessageType = MessageType.SELECTION_UPDATE
    position: Dict[str, Any]  # {start_point: {x, y}, end_point: {x, y}}
    color: str


class SelectionResetMessage(BaseMessage):
    """Reset de la sélection."""
    type: MessageType = MessageType.SELECTION_RESET


class SubmitWordMessage(BaseMessage):
    """Soumission d'un mot."""
    type: MessageType = MessageType.SUBMIT_WORD
    word: str
    start_index: Dict[str, int]  # {row, col}
    end_index: Dict[str, int]    # {row, col}


class PingMessage(BaseMessage):
    """Heartbeat ping."""
    type: MessageType = MessageType.PING
    timestamp: int


# =============================================================================
# FACTORY FUNCTIONS - Création simplifiée de messages
# =============================================================================


class MessageFactory:
    """Factory pour créer des messages standardisés."""
    
    @staticmethod
    def game_state(
        game_id: str,
        player_id: str,
        status: GameStatus,
        theme: str,
        grid: List[List[str]],
        words_to_find: List[str],
        words_found: Dict[str, List[str]],
        scores: Dict[str, int],
        opponent_id: Optional[str] = None,
        time_remaining: Optional[int] = None,
    ) -> dict:
        """Crée un message d'état du jeu."""
        return GameStateMessage(
            game_id=game_id,
            player_id=player_id,
            opponent_id=opponent_id,
            status=status,
            theme=theme,
            grid=grid,
            words_to_find=words_to_find,
            words_found=words_found,
            scores=scores,
            time_remaining=time_remaining,
        ).model_dump()
    
    @staticmethod
    def waiting_for_players(players_connected: int = 1) -> dict:
        """Crée un message d'attente de joueurs."""
        return WaitingForPlayersMessage(
            players_connected=players_connected
        ).model_dump()
    
    @staticmethod
    def starting_countdown(countdown: int) -> dict:
        """Crée un message de compte à rebours."""
        return StartingCountdownMessage(
            countdown=countdown,
            message=f"La partie commence dans {countdown}..."
        ).model_dump()
    
    @staticmethod
    def game_start(time_remaining: int) -> dict:
        """Crée un message de démarrage de partie."""
        return GameStartMessage(
            time_remaining=time_remaining
        ).model_dump()
    
    @staticmethod
    def game_finished(
        reason: GameEndReason,
        final_scores: Dict[str, int],
        winner_id: Optional[str] = None,
    ) -> dict:
        """Crée un message de fin de partie."""
        is_draw = winner_id is None and reason != GameEndReason.ERROR
        return GameFinishedMessage(
            reason=reason,
            winner_id=winner_id,
            is_draw=is_draw,
            final_scores=final_scores,
        ).model_dump()
    
    @staticmethod
    def word_found(
        word: str,
        player_id: str,
        points_earned: int,
        new_score: int,
        words_remaining: int,
    ) -> dict:
        """Crée un message de mot trouvé."""
        return WordFoundMessage(
            word=word,
            player_id=player_id,
            points_earned=points_earned,
            new_score=new_score,
            words_remaining=words_remaining,
        ).model_dump()
    
    @staticmethod
    def word_invalid(word: str, reason: str) -> dict:
        """Crée un message de mot invalide."""
        return WordInvalidMessage(
            word=word,
            reason=reason,
        ).model_dump()
    
    @staticmethod
    def score_update(scores: Dict[str, int]) -> dict:
        """Crée un message de mise à jour des scores."""
        return ScoreUpdateMessage(scores=scores).model_dump()
    
    @staticmethod
    def time_update(time_remaining: int) -> dict:
        """Crée un message de mise à jour du temps."""
        return TimeUpdateMessage(time_remaining=time_remaining).model_dump()
    
    @staticmethod
    def opponent_selection(
        position: Optional[Dict[str, Any]] = None,
        color: Optional[str] = None,
        word_preview: Optional[str] = None,
    ) -> dict:
        """Crée un message de sélection adversaire."""
        return OpponentSelectionMessage(
            position=position,
            color=color,
            word_preview=word_preview,
        ).model_dump()
    
    @staticmethod
    def player_disconnected(player_id: str) -> dict:
        """Crée un message de déconnexion joueur."""
        return PlayerEventMessage(
            type=MessageType.PLAYER_DISCONNECTED,
            player_id=player_id,
            message="Votre adversaire s'est déconnecté.",
        ).model_dump()
    
    @staticmethod
    def error(code: ErrorCode, message: str, details: Optional[dict] = None) -> dict:
        """Crée un message d'erreur."""
        return ErrorMessage(
            code=code,
            message=message,
            details=details,
        ).model_dump()
// /frontend/src/shared/gameMessages.ts

import { type Position ,type GridIndex} from "../wordsearch/types";
/**
 * Constantes centralisées pour les messages WebSocket et statuts de jeu.
 * Ce fichier doit rester synchronisé avec le backend (backend/app/games/messages.py)
 */

// =============================================================================
// ÉNUMÉRATIONS - STATUTS ET TYPES DE MESSAGES
// =============================================================================

/**
 * Statuts possibles d'une partie.
 */
export enum GameStatus {
    // Initialisation
    INITIALIZED = 'initialized',
    CONNECTING = 'connecting',
    WAITING_FOR_PLAYERS = 'waiting_for_players',
    WAITING_FOR_OPPONENT = 'waiting_for_opponent',


    // Démarrage
    STARTING_COUNTDOWN = 'starting_countdown',

    PREPARING = 'preparing',


    // En cours
    IN_PROGRESS = 'game_in_progress',

    // Fin
    FINISHED = 'finished',
    CANCELLED = 'cancelled',

    // Erreur
    ERROR = 'error',
}

export type GameStatusType = GameStatus



/**
 * Types de messages WebSocket échangés.
 */
export enum MessageType {
    // ─────────────────────────────────────────────────────────────────────────
    // MESSAGES SERVEUR → CLIENT
    // ─────────────────────────────────────────────────────────────────────────

    // Connexion et état du jeu
    GAME_STATE = 'game_state',
    GAME_STATUS_UPDATE = 'game_status_update',

    // Phases de jeu
    WAITING_FOR_PLAYERS = 'waiting_for_players',
    STARTING_COUNTDOWN = 'starting_countdown',
    GAME_START = 'game_start',
    GAME_FINISHED = 'game_finished',

    // Événements de jeu
    WORD_FOUND = 'word_found',
    WORD_INVALID = 'word_invalid',
    WORD_ALREADY_FOUND = 'word_already_found',
    SCORE_UPDATE = 'score_update',
    TIME_UPDATE = 'time_update',

    // Événements joueur
    PLAYER_JOINED = 'player_joined',
    PLAYER_LEFT = 'player_left',
    PLAYER_DISCONNECTED = 'player_disconnected',
    PLAYER_RECONNECTED = 'player_reconnected',
    OPPONENT_SELECTION = 'opponent_selection',

    CHAT_MESSAGE = 'chat_message',


    // Erreurs
    ERROR = 'error',

    // ─────────────────────────────────────────────────────────────────────────
    // MESSAGES CLIENT → SERVEUR
    // ─────────────────────────────────────────────────────────────────────────

    // Actions joueur
    PLAYER_READY = 'player_ready',
    SELECTION_UPDATE = 'selection_update',
    SELECTION_RESET = 'selection_reset',
    SUBMIT_WORD = 'submit_word',

    CHAT = 'chat',

    // Requêtes
    REQUEST_STATE = 'request_state',
    PING = 'ping',
    PONG = 'pong',
}

/**
 * Raisons de fin de partie.
 */
export enum GameEndReason {
    TIME_UP = 'time_up',
    ALL_WORDS_FOUND = 'all_words_found',
    PLAYER_DISCONNECTED = 'player_disconnected',
    PLAYER_FORFEIT = 'player_forfeit',
    ERROR = 'error',
}

/**
 * Codes d'erreur standardisés.
 */
export enum ErrorCode {
    // Authentification
    AUTH_INVALID_TOKEN = 'auth_invalid_token',
    AUTH_EXPIRED_TOKEN = 'auth_expired_token',

    // Jeu
    GAME_NOT_FOUND = 'game_not_found',
    GAME_ALREADY_STARTED = 'game_already_started',
    GAME_NOT_IN_PROGRESS = 'game_not_in_progress',
    PLAYER_NOT_IN_GAME = 'player_not_in_game',

    // Sélection
    INVALID_SELECTION = 'invalid_selection',
    WORD_NOT_IN_GRID = 'word_not_in_grid',

    // Technique
    INTERNAL_ERROR = 'internal_error',
    RATE_LIMITED = 'rate_limited',
}



// =============================================================================
// TYPES - MESSAGES SERVEUR → CLIENT
// =============================================================================

export interface BaseMessage {
    type: MessageType;
}

export interface GameStateMessage extends BaseMessage {
    type: MessageType.GAME_STATE;
    game_id: string;
    player_id: string;
    opponent_id: string | null;
    status: GameStatus;
    theme: string;
    grid: string[][];
    words_to_find: string[];
    words_found: Record<string, string[]>;
    scores: Record<string, number>;
    time_remaining: number | null;
    game_duration: number;
}

export interface WaitingForPlayersMessage extends BaseMessage {
    type: MessageType.WAITING_FOR_PLAYERS;
    message: string;
    players_connected: number;
    players_required: number;
}

export interface StartingCountdownMessage extends BaseMessage {
    type: MessageType.STARTING_COUNTDOWN;
    countdown: number;
    message: string;
}

export interface GameStartMessage extends BaseMessage {
    type: MessageType.GAME_START;
    message: string;
    time_remaining: number;
}

export interface GameFinishedMessage extends BaseMessage {
    type: MessageType.GAME_FINISHED;
    reason: GameEndReason;
    winner_id: string | null;
    is_draw: boolean;
    final_scores: Record<string, number>;
    message: string;
}

export interface WordFoundMessage extends BaseMessage {
    type: MessageType.WORD_FOUND;
    word: string;
    player_id: string;
    points_earned: number;
    new_score: number;
    words_remaining: number;
}

export interface WordInvalidMessage extends BaseMessage {
    type: MessageType.WORD_INVALID;
    word: string;
    reason: string;
}

export interface ScoreUpdateMessage extends BaseMessage {
    type: MessageType.SCORE_UPDATE;
    scores: Record<string, number>;
}

export interface TimeUpdateMessage extends BaseMessage {
    type: MessageType.TIME_UPDATE;
    time_remaining: number;
}

export interface OpponentSelectionMessage extends BaseMessage {
    type: MessageType.OPPONENT_SELECTION;
    position: Position | null;
    color: string | null;
    word_preview: string | null;
}

export interface ChatMessage extends BaseMessage {
    type: MessageType.CHAT_MESSAGE; 
    sender: string;                 
    content: string;                
    player_id: string;              
}


export interface ChatSendMessage extends BaseMessage {
    type: MessageType.CHAT;         
    content: string;                
}

export interface PlayerEventMessage extends BaseMessage {
    type:
        | MessageType.PLAYER_JOINED
        | MessageType.PLAYER_LEFT
        | MessageType.PLAYER_DISCONNECTED
        | MessageType.PLAYER_RECONNECTED;
    player_id: string;
    message: string;
}

export interface ErrorMessage extends BaseMessage {
    type: MessageType.ERROR;
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

export interface ChatBroadcastMessage extends BaseMessage {
    type: MessageType.CHAT_MESSAGE;
    sender: string;
    content: string;
    player_id: string;
}

// =============================================================================
// TYPES - MESSAGES CLIENT → SERVEUR
// =============================================================================

export interface PlayerReadyMessage extends BaseMessage {
    type: MessageType.PLAYER_READY;
}

export interface SelectionUpdateMessage extends BaseMessage {
    type: MessageType.SELECTION_UPDATE;
    position: Position;
    color: string;
}

export interface SelectionResetMessage extends BaseMessage {
    type: MessageType.SELECTION_RESET;
}

export interface SubmitWordMessage extends BaseMessage {
    type: MessageType.SUBMIT_WORD;
    word: string;
    start_index: GridIndex;
    end_index: GridIndex;
}

export interface PingMessage extends BaseMessage {
    type: MessageType.PING;
    timestamp: number;
}

export interface ChatSendMessage extends BaseMessage {
    type: MessageType.CHAT;
    content: string;
}
// =============================================================================
// TYPE UNION - TOUS LES MESSAGES
// =============================================================================

export type ServerMessage =
    | ChatBroadcastMessage
    | GameStateMessage
    | WaitingForPlayersMessage
    | StartingCountdownMessage
    | GameStartMessage
    | GameFinishedMessage
    | WordFoundMessage
    | WordInvalidMessage
    | ScoreUpdateMessage
    | TimeUpdateMessage
    | OpponentSelectionMessage
    | PlayerEventMessage
    | ErrorMessage;

export type ClientMessage =
    | ChatSendMessage
    | PlayerReadyMessage
    | SelectionUpdateMessage
    | SelectionResetMessage
    | SubmitWordMessage
    | PingMessage;

// =============================================================================
// FACTORY - Création simplifiée de messages
// =============================================================================

export const createMessage = {
    // Messages Client → Serveur

    playerReady: (): PlayerReadyMessage => ({
        type: MessageType.PLAYER_READY,
    }),

    selectionUpdate: (position: Position, color: string): SelectionUpdateMessage => ({
        type: MessageType.SELECTION_UPDATE,
        position,
        color,
    }),

    selectionReset: (): SelectionResetMessage => ({
        type: MessageType.SELECTION_RESET,
    }),

    submitWord: (word: string, startIndex: GridIndex, endIndex: GridIndex): SubmitWordMessage => ({
        type: MessageType.SUBMIT_WORD,
        word,
        start_index: startIndex,
        end_index: endIndex,
    }),

    ping: (): PingMessage => ({
        type: MessageType.PING,
        timestamp: Date.now(),
    }),
};

// =============================================================================
// TYPE GUARDS - Vérification de type des messages
// =============================================================================

export const isMessageType = {
    gameState: (msg: ServerMessage): msg is GameStateMessage =>
        msg.type === MessageType.GAME_STATE,

    waitingForPlayers: (msg: ServerMessage): msg is WaitingForPlayersMessage =>
        msg.type === MessageType.WAITING_FOR_PLAYERS,

    startingCountdown: (msg: ServerMessage): msg is StartingCountdownMessage =>
        msg.type === MessageType.STARTING_COUNTDOWN,

    gameStart: (msg: ServerMessage): msg is GameStartMessage =>
        msg.type === MessageType.GAME_START,

    gameFinished: (msg: ServerMessage): msg is GameFinishedMessage =>
        msg.type === MessageType.GAME_FINISHED,

    wordFound: (msg: ServerMessage): msg is WordFoundMessage =>
        msg.type === MessageType.WORD_FOUND,

    wordInvalid: (msg: ServerMessage): msg is WordInvalidMessage =>
        msg.type === MessageType.WORD_INVALID,

    scoreUpdate: (msg: ServerMessage): msg is ScoreUpdateMessage =>
        msg.type === MessageType.SCORE_UPDATE,

    timeUpdate: (msg: ServerMessage): msg is TimeUpdateMessage =>
        msg.type === MessageType.TIME_UPDATE,

    opponentSelection: (msg: ServerMessage): msg is OpponentSelectionMessage =>
        msg.type === MessageType.OPPONENT_SELECTION,

    chatMessage: (msg: ServerMessage): msg is ChatBroadcastMessage =>
        msg.type === MessageType.CHAT_MESSAGE,
    
    playerEvent: (msg: ServerMessage): msg is PlayerEventMessage =>
        [
            MessageType.PLAYER_JOINED,
            MessageType.PLAYER_LEFT,
            MessageType.PLAYER_DISCONNECTED,
            MessageType.PLAYER_RECONNECTED,
        ].includes(msg.type),

    error: (msg: ServerMessage): msg is ErrorMessage =>
        msg.type === MessageType.ERROR,
};

// =============================================================================
// HELPERS - Utilitaires
// =============================================================================

/**
 * Parse un message JSON en ServerMessage avec validation du type.
 */
export function parseServerMessage(data: string): ServerMessage | null {
    try {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null && 'type' in parsed) {
            return parsed as ServerMessage;
        }
        console.warn('[WS] Message sans type:', parsed);
        return null;
    } catch (error) {
        console.error('[WS] Erreur parsing message:', error);
        return null;
    }
}

/**
 * Sérialise un message client pour envoi.
 */
export function stringifyClientMessage(message: ClientMessage): string {
    return JSON.stringify(message);
}

/**
 * Vérifie si le jeu est dans un état jouable.
 */
export function isGamePlayable(status: GameStatus): boolean {
    return status === GameStatus.IN_PROGRESS;
}

/**
 * Vérifie si le jeu est terminé.
 */
export function isGameOver(status: GameStatus): boolean {
    return [GameStatus.FINISHED, GameStatus.CANCELLED, GameStatus.ERROR].includes(status);
}

/**
 * Obtient un message lisible pour un statut de jeu.
 */
export function getStatusMessage(status: GameStatus): string {
    const messages: Record<GameStatus, string> = {
        [GameStatus.INITIALIZED]: 'Partie initialisée',
        [GameStatus.WAITING_FOR_OPPONENT]:'En attente de l\'adversaire',
        [GameStatus.WAITING_FOR_PLAYERS]: 'En attente de joueurs...',
        [GameStatus.STARTING_COUNTDOWN]: 'La partie va commencer...',
        [GameStatus.IN_PROGRESS]: 'Partie en cours',
        [GameStatus.FINISHED]: 'Partie terminée',
        [GameStatus.CANCELLED]: 'Partie annulée',
        [GameStatus.CONNECTING]: 'connection ...',
        [GameStatus.PREPARING]: 'Préparation ...',
        [GameStatus.ERROR]: 'Erreur',
    };
    return messages[status] || 'Statut inconnu';
}

/**
 * Obtient un message lisible pour une raison de fin de partie.
 */
export function getEndReasonMessage(reason: GameEndReason): string {
    const messages: Record<GameEndReason, string> = {
        [GameEndReason.TIME_UP]: 'Temps écoulé !',
        [GameEndReason.ALL_WORDS_FOUND]: 'Tous les mots ont été trouvés !',
        [GameEndReason.PLAYER_DISCONNECTED]: 'Adversaire déconnecté',
        [GameEndReason.PLAYER_FORFEIT]: 'Abandon',
        [GameEndReason.ERROR]: 'Erreur technique',
    };
    return messages[reason] || 'Partie terminée';
}
// /frontend/src/wordsearch/websocket.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { type User} from '../../auth/AuthContext';
import type { WordSolution } from '../types';
import { GameMessages, GameStatus } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

export const WebSocketStatus = {
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    ERROR: 'error',
} as const;

export type WebSocketStatusType = (typeof WebSocketStatus)[keyof typeof WebSocketStatus];

// Interface de base commune à tous les jeux
export interface GameBaseData {
  // Score en temps réel (toujours nécessaire)
  realtime_score: Record<string, number>; // {player_id: score_actuel}

  // Données spécifiques au joueur (ex: prêt à jouer, vies restantes, etc.)
  player_data: Record<string, object>; // {player_id: {statut_specifique}}

  game_duration?: number;   // durée totale du jeu (en secondes)
  time_remaining?: number;  // temps restant
}

// Interface spécifique au jeu de mots mêlés
export interface WordSearchData extends GameBaseData {
  theme: string;

  // Grille de lettres
  grid_data: string[][]; // tableau 2D de lettres

  // Liste des mots à trouver
  words_to_find: string[];

  // Mots trouvés par joueur
  words_found: Record<string, WordSolution[]>; 
}


export interface UseWebSocketReturn {
    ws: WebSocket | null;
    status: WebSocketStatusType;
    isConnected: boolean;
    gameState: WordSearchData | null;
    sendMessage: (message: object) => boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_RECONNECT_ATTEMPTS = 3;

// =============================================================================
// HOOK
// =============================================================================

export const useWebSocket = (user: User, gameId: string): UseWebSocketReturn => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [status, setStatus] = useState<WebSocketStatusType>(WebSocketStatus.DISCONNECTED);
    const [gameState, setGameState] = useState<WordSearchData | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);

    // ─────────────────────────────────────────────────────────────────────────
    // SEND MESSAGE
    // ─────────────────────────────────────────────────────────────────────────

    const sendMessage = useCallback((message: object): boolean => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        }
        console.warn("[WS] ⚠️ Cannot send: WebSocket not connected");
        return false;
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // MESSAGE HANDLER
    // ─────────────────────────────────────────────────────────────────────────

    const handleMessage = useCallback((event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            console.log('[WS] 📩 Message received:', data);

            let current_state : WordSearchData

            switch (data.type) {
                // ─────────────────────────────────────────────────────────────
                // GAME STATE
                // ─────────────────────────────────────────────────────────────
                case 'game_data':
                case 'game_state':
                case GameMessages.GAME_DATA:

                    current_state = data.game_state 

                    console.log('[WS] 🎮 Game state received');
                    setGameState(current_state);    
                    break;

                // ─────────────────────────────────────────────────────────────
                // WORD FOUND
                // ─────────────────────────────────────────────────────────────
                case 'word_found':
                case GameMessages.WORD_FOUND_SUCCESS:
                    console.log('[WS] ✅ Word found:', data.new_solution.word, 'by', data.found_by);    
                    setGameState((prev) => {
                        if (!prev) return null;

                        // Créer la solution à ajouter
                        const newSolution: WordSolution = data.new_solution

                        // Mettre à jour words_found
                        const updatedWordsFound = { ...prev.words_found };
                        const playerWords = updatedWordsFound[data.found_by] || [];
                        updatedWordsFound[data.found_by] = [...playerWords, newSolution];

                        // Mettre à jour les scores
                        const updatedScores = { ...prev.realtime_score };
                        if (data.new_score !== undefined) {
                            updatedScores[data.found_by] = data.new_score;
                        }

                        console.log(updatedScores)
                        console.log(updatedWordsFound)

                        return {
                            ...prev,
                            words_found: updatedWordsFound,
                            realtime_score: updatedScores,
                        };
                    });
                    break;

                // // ─────────────────────────────────────────────────────────────
                // // WORD INVALID / ALREADY FOUND
                // // ─────────────────────────────────────────────────────────────
                // case 'word_invalid':
                // case MessageType.WORD_INVALID:
                //     console.log('[WS] ❌ Invalid word:', data.word, '-', data.reason);
                //     // Optionnel: afficher une notification
                //     break;

                // case 'word_already_found':
                // case MessageType.WORD_ALREADY_FOUND:
                //     console.log('[WS] ⚠️ Word already found:', data.word);
                //     break;

                // ─────────────────────────────────────────────────────────────
                // GAME EVENTS
                // ─────────────────────────────────────────────────────────────
                case 'game_finished':
                case GameStatus.GAME_FINISHED:
                    console.log('[WS] 🏆 Game finished! Winner:', data.winner_id);
                    // TODO: Handle game end UI
                    break;

                case 'opponent_disconnected':
                    console.log('[WS] 🚪 Opponent disconnected');
                    break;

                // ─────────────────────────────────────────────────────────────
                // ERRORS
                // ─────────────────────────────────────────────────────────────
                case 'error':
                case GameMessages.ERROR:
                    console.error('[WS] ❌ Server error:', data.message);
                    break;

                // ─────────────────────────────────────────────────────────────
                // SELECTION UPDATES (handled by canvas hook)
                // ─────────────────────────────────────────────────────────────
                case 'selection_update':
                case 'selection_reset':
                case 'opponent_selection':
                case GameMessages.SELECTION_UPDATE:
                case GameMessages.SELECTION_RESET:
                    // Ces messages sont gérés par le hook useCanvasDrawing
                    break;

                default:
                    console.log('[WS] 📨 Unhandled message:', data);
            }
        } catch (error) {
            console.error('[WS] ❌ Error parsing message:', error);
        }
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // CONNECTION
    // ─────────────────────────────────────────────────────────────────────────

    const connect = useCallback(() => {
        // Close existing connection
        if (wsRef.current) {
            wsRef.current.close();
        }

        setStatus(WebSocketStatus.CONNECTING);

        const baseUrl = import.meta.env.VITE_WS_BASE_URL;
        if (!baseUrl) {
            console.error('[WS] ❌ VITE_WS_BASE_URL not defined');
            setStatus(WebSocketStatus.ERROR);
            return;
        }

        const wsUrl = `${baseUrl}/wordsearch/${gameId}?playerId=${user.user_id}`;
        console.log(`[WS] 🔄 Connecting to ${wsUrl}...`);

        try {
            const newWs = new WebSocket(wsUrl);
            wsRef.current = newWs;

            newWs.onopen = () => {
                console.log(`[WS] ✅ Connected to game ${gameId}`);
                setStatus(WebSocketStatus.CONNECTED);
                setWs(newWs);
                reconnectAttempts.current = 0;

                // Send player ready
                newWs.send(
                    JSON.stringify({
                        type: "ready",
                        player_id: user.user_id,
                    })
                );
            };

            newWs.addEventListener('message',handleMessage)

            newWs.onerror = (error) => {
                console.error('[WS] ❌ Error:', error);
                setStatus(WebSocketStatus.ERROR);
            };

            newWs.onclose = (event) => {
                wsRef.current = null;
                setWs(null);

                if (event.wasClean) {
                    console.log(`[WS] 🔌 Clean disconnect (code=${event.code})`);
                    setStatus(WebSocketStatus.DISCONNECTED);
                } else {
                    console.warn(`[WS] 🚨 Abnormal disconnect (code=${event.code})`);
                    setStatus(WebSocketStatus.ERROR);

                    // Auto reconnect
                    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                        reconnectAttempts.current += 1;
                        const delay = Math.min(1000 * reconnectAttempts.current, 5000);
                        console.log(
                            `[WS] 🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`
                        );
                        setTimeout(connect, delay);
                    }
                }
            };
        } catch (error) {
            console.error('[WS] ❌ WebSocket creation error:', error);
            setStatus(WebSocketStatus.ERROR);
        }
    }, [user, gameId, handleMessage]);

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECT
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        connect();

        return () => {
            if (wsRef.current) {
                console.log('[WS] 🧹 Cleanup: closing connection');
                reconnectAttempts.current = MAX_RECONNECT_ATTEMPTS;
                wsRef.current.close(1000, 'Component unmounted');
                wsRef.current = null;
            }
        };
    }, [connect]);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return {
        ws,
        status,
        isConnected: status === WebSocketStatus.CONNECTED,
        gameState,
        sendMessage,
    };
};


import {  useState, useCallback, type ReactNode,useEffect } from 'react';
import { type GameStatusType,GameStatus } from '../../shared/GameMessages';
import { type GameContextValue ,type Player,GameContext} from './GameContext';
import { type GameFinishedMessage } from '../types/GameInterface';
// =============================================================================
// PROVIDER
// =============================================================================

interface GameProviderProps {
    children: ReactNode;
    gameId: string;
    gameName: string;
    userId: string;
    username: string;
}

export default function GameProvider({ children, gameId, gameName, userId, username }: GameProviderProps) {
    // STATE
    // ─────────────────────────────────────────────────────────────────────────
    
    const [status, setStatus] = useState<GameStatusType>(GameStatus.CONNECTING);
    const [startTimeStamp, setStartTimeStamp] = useState<number|null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [me, setMe] = useState<Player>({ id: userId, username, score: 0 });
    const [opponent, setOpponent] = useState<Player | null>(null);
    const [gameData, setGameData] = useState<unknown>(null);
    const [finishedData,setGameFinishedData] = useState<GameFinishedMessage|null>(null)
    // Actions
    const updateScore = useCallback((playerId: string, score: number) => {
        if (playerId === userId) {
            setMe(prev => ({ ...prev, score }));
        } else {
            setOpponent(prev => prev ? { ...prev, score } : null);
        }
    }, [userId]);

    const setGameOver = useCallback(() => {
        setStatus(GameStatus.FINISHED);
    }, []);

    const sendMessage = useCallback((message: object) => {
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }, [ws]);

    const value: GameContextValue = {
        // Identifiants
        gameId,
        gameName,
        
        // État (lecture)
        status,
        startTimeStamp,
        countdown,
        me,
        opponent,
        ws,
        gameData,
        finishedData,
        
        // Actions (écriture)
        sendMessage,
        updateScore,
        setGameOver,
        
        // Setters exposés pour useGameWebSocket
        setStatus,
        setStartTimeStamp,
        setCountdown,
        setWs,
        setMe,
        setOpponent,
        setGameData,
        setGameFinishedData,
    };

    // 🎯 DEBUG
    useEffect(() => {
        console.log(`🌐 [GameProvider] ws state changé:`, ws ? `readyState=${ws.readyState}` : 'null');
    }, [ws]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}
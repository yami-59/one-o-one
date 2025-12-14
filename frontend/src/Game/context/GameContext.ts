// /frontend/src/game/context/GameContext.tsx

import { type GameStatusType} from '../../shared/GameMessages';
import { useContext,createContext } from "react";

// =============================================================================
// TYPES
// =============================================================================

export interface Player {
    id: string;
    username: string;
    score: number;
}

export interface GameContextValue {
    // ─────────────────────────────────────────────────────────────────────────
    // IDENTIFIANTS
    // ─────────────────────────────────────────────────────────────────────────
    gameId: string;
    gameName: string;

    // ─────────────────────────────────────────────────────────────────────────
    // ÉTAT (lecture)
    // ─────────────────────────────────────────────────────────────────────────
    status: GameStatusType;
    startTimeStamp:number|null;
    countdown: number | null;
    me: Player;
    opponent: Player | null;
    ws: WebSocket | null;
    gameData: unknown;

    // ─────────────────────────────────────────────────────────────────────────
    // ACTIONS
    // ─────────────────────────────────────────────────────────────────────────
    sendMessage: (message: object) => void;
    updateScore: (playerId: string, score: number) => void;
    setGameOver: () => void;

    // ─────────────────────────────────────────────────────────────────────────
    // SETTERS (pour useGameWebSocket)
    // ─────────────────────────────────────────────────────────────────────────
    setStatus: React.Dispatch<React.SetStateAction<GameStatusType>>;
    setCountdown: React.Dispatch<React.SetStateAction<number | null>>;
    setWs: React.Dispatch<React.SetStateAction<WebSocket | null>>;
    setMe: React.Dispatch<React.SetStateAction<Player>>;
    setOpponent: React.Dispatch<React.SetStateAction<Player | null>>;
    setGameData: React.Dispatch<React.SetStateAction<unknown>>;
    setStartTimeStamp:React.Dispatch<React.SetStateAction<number|null>>;
}




// =============================================================================
// CONTEXT
// =============================================================================

export const GameContext = createContext<GameContextValue | null>(null);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};


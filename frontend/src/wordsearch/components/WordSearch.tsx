// /frontend/src/wordsearch/components/mainComponent.tsx

import { useMemo } from 'react';
import SidePanel from './SidePanel';
import GameGrid from './GameGrid';
import { useCanvasDrawing } from '../hooks/canvas';
import { useWebSocket, WebSocketStatus } from '../hooks/websocket';
import { type UserProps } from '../../auth/AuthContext';
import type { WordSolution } from '../types';

// =============================================================================
// TYPES
// =============================================================================

interface WordSearchProps {
    user: UserProps;
    gameId: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

const WordSearch = ({ user, gameId }: WordSearchProps) => {
    // ─────────────────────────────────────────────────────────────────────────
    // HOOKS
    // ─────────────────────────────────────────────────────────────────────────

    const { ws, status, gameState } = useWebSocket(user, gameId);

    const solutionsFound: WordSolution[] = useMemo(() => {
        if (!gameState?.words_found) return [];
        return Object.values(gameState.words_found).flat();
    }, [gameState?.words_found]);

    const canvasProps = useCanvasDrawing(
        gameState?.grid_data || [],
        solutionsFound,
        ws,
        user.user_id
    );

    const allWordsFound = useMemo(() => {
        return solutionsFound.map((sol) => sol.word);
    }, [solutionsFound]);

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATES
    // ─────────────────────────────────────────────────────────────────────────

    if (status === WebSocketStatus.CONNECTING) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-pink border-t-transparent" />
                    <p className="text-gray-400">Connexion à la partie...</p>
                </div>
            </div>
        );
    }

    if (status === WebSocketStatus.ERROR) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4 text-red-400">
                    <p className="text-xl">❌ Erreur de connexion</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-lg bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (!gameState) {
        return (
            <div className="flex min-h-[60vh] w-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-pink border-t-transparent" />
                    <p className="text-gray-400">Chargement de la partie...</p>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────



    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          

            {/* ─────────────────────────────────────────────────────────────────
                MAIN : Grille + Panel
            ───────────────────────────────────────────────────────────────── */}
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                {/* Grille de jeu (centre) */}
                <div className="order-2 lg:order-1">
                    {gameState.grid_data.length > 0 && (
                        <GameGrid gridData={gameState.grid_data} {...canvasProps} />
                    )}
                </div>

                {/* Panel latéral (droite sur desktop, bas sur mobile) */}
                <div className="order-1 lg:order-2 w-full lg:w-72">
                    <SidePanel
                        wordsToFind={gameState.words_to_find}
                        wordsFound={allWordsFound}
                    />
                </div>
            </div>

           
        </div>
    );
};

export default WordSearch;
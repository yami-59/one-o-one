// /frontend/src/wordsearch/components/mainComponent.tsx

import { useMemo } from 'react';
import NameListTable from './nameListTable';
import WordSearchTable from './wordSearchTable';
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

    // WebSocket avec gestion de l'état du jeu
    const { ws, status, gameState } = useWebSocket(user, gameId);

    // Extraire les solutions trouvées de tous les joueurs
    const solutionsFound: WordSolution[] = useMemo(() => {
        if (!gameState?.words_found) return [];

        // Flatten all solutions from all players
        return Object.values(gameState.words_found).flat();
    }, [gameState?.words_found]);

    // Hook de dessin Canvas avec persistance des mots trouvés
    const canvasProps = useCanvasDrawing(
        gameState?.grid_data || [],
        solutionsFound,
        ws,
        user.user_id
    );

    // Liste des mots trouvés (juste les strings pour l'affichage)
    const allWordsFound = useMemo(() => {
        return solutionsFound.map((sol) => sol.word);
    }, [solutionsFound]);

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATES
    // ─────────────────────────────────────────────────────────────────────────

    if (status === WebSocketStatus.CONNECTING) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
                    <p className="text-gray-400">Connexion à la partie...</p>
                </div>
            </div>
        );
    }

    if (status === WebSocketStatus.ERROR) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4 text-red-400">
                    <p>❌ Erreur de connexion</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (!gameState) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
                    <p className="text-gray-400">Chargement de la partie...</p>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col items-center">
            {/* Header avec thème et progression */}
            <div className="mb-4 flex w-full items-center justify-between px-4">
                <div className="text-lg text-gray-300">
                    Thème: <span className="font-bold text-white">{gameState.theme}</span>
                </div>

                {/* Progression */}
                <div className="text-sm text-gray-400">
                    {allWordsFound.length} / {gameState.words_to_find.length} mots trouvés
                </div>
            </div>

            {/* Zone de jeu */}
            <div className="flex h-fit w-fit flex-row items-end gap-6">
                {/* Liste des mots à trouver */}
                <NameListTable
                    wordsToFind={gameState.words_to_find}
                    wordsFound={allWordsFound}
                />

                {/* Grille de mot-mêlé avec canvas */}
                {gameState.grid_data.length > 0 && (
                    <WordSearchTable gridData={gameState.grid_data} {...canvasProps} />
                )}
            </div>

            {/* Affichage du mot en cours de sélection */}
            {canvasProps.myWord && (
                <div className="mt-4 text-center">
                    <span className="rounded bg-indigo-600 px-4 py-2 text-lg font-bold text-white">
                        {canvasProps.myWord}
                    </span>
                </div>
            )}
        </div>
    );
};

export default WordSearch;
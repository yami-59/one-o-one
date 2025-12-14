// /frontend/src/pages/GamePage.tsx

import { Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Scoreboard from '../components/Scoreboard';
import Loading from './Loading';
import { useAuth, type AuthContextValue } from '../auth/AuthContext';
import GameOverlay from '../Game/components/GameOverlay';
import { GameStatus } from '../shared/GameMessages';
import { useGame } from '../Game/context/GameContext';
import GameProvider from '../Game/context/GameProvider';
import { getGameConfig, isValidGame } from '../Game/registry/gameRegistry';
import { useGameWebSocket } from '../Game/hooks/useGameWebSocket';
import { type GameBaseData } from '../Game/types/GameInterface';
import { useGameTimer } from '../Game/hooks/useGameTimer';

// Helper pour formater le nom
const formatPlayerName = (username: string | undefined, fallback: string): string => {
    if (!username) return fallback;
    return username.startsWith('guest-') ? 'guest' : username;
};

// =============================================================================
// INNER COMPONENT (avec accès au contexte)
// =============================================================================

function GamePageInner({ auth }: { auth: AuthContextValue }) {
    const navigate = useNavigate();
    const game = useGame();
    const duration = game.gameData ? (game.gameData as GameBaseData).game_duration : null;

    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);  // 🎯 Pour MatchmakingButton
    
    const { formattedTime } = useGameTimer(game.startTimeStamp, duration);

    // Récupérer la config du jeu
    const gameConfig = getGameConfig(game.gameName!);

    if (!gameConfig) {
        return (
            <div className="flex h-screen items-center justify-center text-red-400">
                Jeu inconnu: {game.gameName}
            </div>
        );
    }

    const GameComponent = gameConfig.component;

    return (
        <div className="min-h-screen flex flex-col relative">
            <Navbar {...auth} />

            {/* Overlay Countdown */}
            {game.status === GameStatus.STARTING_COUNTDOWN && game.countdown !== null && (
                <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center">
                    <div className="text-9xl font-bold text-brand-yellow animate-pulse">
                        {game.countdown}
                    </div>
                </div>
            )}

            {/* Overlay Game Over */}
            {game.status === GameStatus.FINISHED && (
                <GameOverlay
                    myScore={game.me?.score ?? 0}
                    opponentScore={game.opponent?.score ?? 0}
                    myName={formatPlayerName(game.me?.username, 'Moi')}
                    opponentName={formatPlayerName(game.opponent?.username, 'Adversaire')}
                    gameName={game.gameName!}
                    token={auth.token}
                    isAuthenticated={auth.isAuthenticated}
                    setShowLoginModal={setShowLoginModal}
                    onLobby={() => navigate('/lobby')}
                />
            )}

            {/* Overlay Waiting */}
            {game.status === GameStatus.WAITING_FOR_OPPONENT && (
                <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-pink border-t-transparent" />
                        <p className="text-white text-xl">En attente de l'adversaire...</p>
                    </div>
                </div>
            )}

            {/* Overlay Preparing */}
            {game.status === GameStatus.PREPARING && (
                <div className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-yellow border-t-transparent" />
                        <p className="text-white text-xl">Préparation de la partie...</p>
                    </div>
                </div>
            )}

            <main className="grow p-4 md:p-6 max-w-7xl mx-auto w-full">
                {/* Header : Scores + Timer + Sound */}
                <div className="flex justify-between items-center mb-4">
                    <Scoreboard
                        p1Name={formatPlayerName(game.me?.username, 'Moi')}
                        p2Name={formatPlayerName(game.opponent?.username, 'Adversaire')}
                        p1Score={game.me?.score ?? 0}
                        p2Score={game.opponent?.score ?? 0}
                        timer={formattedTime}
                    />
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="ml-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
                    >
                        {soundEnabled ? <Volume2 /> : <VolumeX />}
                    </button>
                </div>

                {/* Zone de jeu dynamique */}
                <div className="grow">
                    {game.status === GameStatus.IN_PROGRESS && <GameComponent />}
                </div>
                {/* 🚀 Bouton retour lobby */}
                <button
                    onClick={() => navigate('/lobby')}
                    className="mt-20 px-4 py-2 bg-brand-yellow text-gray-900 rounded-lg hover:bg-yellow-400 transition"
                >
                    Retour au lobby
                </button>

            </main>

            {/* 🎯 Modal de login si nécessaire (optionnel) */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <p className="text-white mb-4">Vous devez être connecté pour jouer.</p>
                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="px-4 py-2 bg-brand-yellow text-gray-900 rounded-lg"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// MAIN COMPONENT (avec Provider)
// =============================================================================

export default function GamePage() {
    const auth = useAuth();
    const { gameName, gameId } = useParams();
    const navigate = useNavigate();

    // Validation des paramètres
    useEffect(() => {
        if (!auth.isLoading && !auth.isAuthenticated) {
            console.log('non authentifié');
            navigate('/lobby');
        }
        if (gameName && !isValidGame(gameName)) {
            console.log("le jeu n'existe pas");
            navigate('/lobby');
        }
    }, [auth, gameName, navigate]);

    if (auth.isLoading) {
        return <Loading />;
    }

    if (!auth.isAuthenticated || !gameId || !gameName || !auth.userInfo) {
        return (
            <div className="flex h-screen items-center justify-center text-red-400 bg-gray-900">
                Erreur: Données de session manquantes.
            </div>
        );
    }

    return (
        <GameProvider
            key={gameId}
            gameId={gameId}
            gameName={gameName}
            userId={auth.userInfo.user_id}
            username={auth.userInfo.username}
        >
            <GameWebSocketHandler />
            <GamePageInner auth={auth} />
        </GameProvider>
    );
}

// =============================================================================
// WEBSOCKET HANDLER (séparé pour clarté)
// =============================================================================

function GameWebSocketHandler() {
    const game = useGame();
    useGameWebSocket(game);
    return null;
}
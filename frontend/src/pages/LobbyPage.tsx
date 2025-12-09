// /frontend/src/pages/LobbyPage.tsx

import { useState } from 'react';
import { Search, Trophy, Users, Gamepad2, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Login from '../components/Login';
// import { useAuth } from '../auth/AuthContext';

// =============================================================================
// TYPES
// =============================================================================

interface GameMode {
    id: string;
    name: string;
    description: string;
    duration: string;
    difficulty: 'easy' | 'medium' | 'hard';
    playersOnline: number;
    icon: React.ReactNode;
}

// =============================================================================
// DATA
// =============================================================================

const AVAILABLE_GAMES: GameMode[] = [
    {
        id: 'wordsearch_quick',
        name: 'Mots Mêlés - Rapide',
        description: 'Partie rapide de 2 minutes',
        duration: '2 min',
        difficulty: 'easy',
        playersOnline: 124,
        icon: <Zap size={20} className="text-brand-yellow" />,
    },
    {
        id: 'wordsearch_classic',
        name: 'Mots Mêlés - Classique',
        description: 'Partie standard de 3 minutes',
        duration: '3 min',
        difficulty: 'medium',
        playersOnline: 89,
        icon: <Clock size={20} className="text-brand-blue" />,
    },
    {
        id: 'wordsearch_expert',
        name: 'Mots Mêlés - Expert',
        description: 'Grille plus grande, mots plus difficiles',
        duration: '5 min',
        difficulty: 'hard',
        playersOnline: 45,
        icon: <Gamepad2 size={20} className="text-brand-pink" />,
    },
];

const TOP_PLAYERS = [
    { name: 'AlphaWolf', score: 2400 },
    { name: 'Yami.59', score: 2150 },
    { name: 'WordMaster', score: 1980 },
    { name: 'Pixel', score: 1800 },
];

// =============================================================================
// HELPERS
// =============================================================================

const getDifficultyColor = (difficulty: GameMode['difficulty']) => {
    switch (difficulty) {
        case 'easy':
            return 'text-green-400 bg-green-400/10';
        case 'medium':
            return 'text-yellow-400 bg-yellow-400/10';
        case 'hard':
            return 'text-red-400 bg-red-400/10';
    }
};

const getDifficultyLabel = (difficulty: GameMode['difficulty']) => {
    switch (difficulty) {
        case 'easy':
            return 'Facile';
        case 'medium':
            return 'Normal';
        case 'hard':
            return 'Difficile';
    }
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function LobbyPage() {
    const navigate = useNavigate();
    // const { isAuthenticated } = useAuth();

    const isAuthenticated = true

    // État pour le jeu sélectionné
    const [selectedGame, setSelectedGame] = useState<GameMode>(AVAILABLE_GAMES[0]);

    // État pour afficher le modal de connexion
    const [showLoginModal, setShowLoginModal] = useState(false);

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleSearchGame = (gameName: string) => {
        if (!isAuthenticated) {
            // Afficher le modal de connexion si non connecté
            setShowLoginModal(true);
            return;
        }

        // Naviguer vers la recherche de partie avec le jeu sélectionné
        console.log(`🎮 Recherche d'une partie: ${gameName}`);
        navigate(`/game/12`);
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        // Après connexion, lancer la recherche
        handleSearchGame(selectedGame.name);
    };

    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen relative">
            <Navbar setShowLoginModal = {setShowLoginModal} />

            <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ─────────────────────────────────────────────────────────────
                    Section Gauche : Sélection de jeu + Recherche
                ───────────────────────────────────────────────────────────── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Liste des jeux disponibles (EN HAUT) */}
                    <div>
                        <h3 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <Users size={20} /> Jeux disponibles
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {AVAILABLE_GAMES.map((game) => {
                                const isSelected = selectedGame.id === game.id;

                                return (
                                    <div
                                        key={game.id}
                                        onClick={() => setSelectedGame(game)}
                                        className={`
                                            bg-gray-800 p-4 rounded-xl border-2 transition-all cursor-pointer group
                                            ${isSelected
                                                ? 'border-brand-pink shadow-lg shadow-brand-pink/20'
                                                : 'border-gray-700 hover:border-gray-600'
                                            }
                                        `}
                                    >
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                {game.icon}
                                                <span
                                                    className={`text-xs font-bold px-2 py-1 rounded ${getDifficultyColor(game.difficulty)}`}
                                                >
                                                    {getDifficultyLabel(game.difficulty)}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <span className="text-brand-pink text-xs font-bold">
                                                    ✓ Sélectionné
                                                </span>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h4
                                            className={`font-bold text-lg mb-1 transition-colors ${
                                                isSelected ? 'text-brand-pink' : 'text-white group-hover:text-brand-pink'
                                            }`}
                                        >
                                            {game.name}
                                        </h4>

                                        {/* Description */}
                                        <p className="text-gray-400 text-sm mb-3">{game.description}</p>

                                        {/* Footer */}
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {game.duration}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                {game.playersOnline} en ligne
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bouton de recherche (EN BAS) */}
                    <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-lg text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Prêt à combattre ?</h2>
                        <p className="text-gray-400 mb-2">
                            Mode sélectionné :{' '}
                            <span className="text-brand-pink font-bold">{selectedGame.name}</span>
                        </p>
                        <p className="text-gray-500 text-sm mb-6">{selectedGame.description}</p>

                        <button
                            onClick={() => handleSearchGame(selectedGame.name)}
                            className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-xl px-12 py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
                        >
                            <Search size={24} />
                            Rechercher une partie
                        </button>

                        {!isAuthenticated && (
                            <p className="text-gray-500 text-sm mt-4">
                                Vous devez être connecté pour jouer
                            </p>
                        )}
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    Section Droite : Classement
                ───────────────────────────────────────────────────────────── */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <Trophy className="text-brand-yellow" />
                        <h2 className="text-xl font-bold">Top Joueurs</h2>
                    </div>

                    <div className="space-y-3">
                        {TOP_PLAYERS.map((player, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`font-mono font-bold w-6 ${
                                            index === 0 ? 'text-brand-yellow' : 'text-gray-500'
                                        }`}
                                    >
                                        #{index + 1}
                                    </span>
                                    <span className="font-medium text-gray-200">{player.name}</span>
                                </div>
                                <span className="text-brand-pink font-bold">{player.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* ─────────────────────────────────────────────────────────────────
                Modal de connexion (Overlay)
            ───────────────────────────────────────────────────────────────── */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop avec blur */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleCloseLoginModal}
                    />

                    {/* Modal */}
                    <div className="relative z-10 w-full max-w-md mx-4">
                        <Login
                            onSuccess={handleLoginSuccess}
                            onClose={handleCloseLoginModal}
                            isModal={true}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
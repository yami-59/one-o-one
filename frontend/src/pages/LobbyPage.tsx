// /frontend/src/pages/LobbyPage.tsx

import { useState } from 'react';
import {  Trophy, Users, Gamepad2, Clock, Zap } from 'lucide-react';
import MatchMakingButton from '../components/MatchmakingButton'
import Navbar from '../components/Navbar';
import Login from '../components/Login';
import { useAuth } from '../auth/AuthContext';
import GamePick,{type GameMode} from '../components/GamePick';

// =============================================================================
// TYPES
// =============================================================================



// =============================================================================
// DATA
// =============================================================================

const AVAILABLE_GAMES: GameMode[] = [
    {
        id: 'wordsearch_quick',
        alias: 'Mots Mêlés - Rapide',
        name:'wordsearch',
        description: 'Partie rapide de 3 minutes',
        duration: '3 min',
        difficulty: 'easy',
        playersOnline: 124,
        icon: <Zap size={20} className="text-brand-yellow" />,
    },
    {
        id: 'wordsearch_classic',
        alias: 'Mots Mêlés - Classique',
        name:'wordsearch',
        description: 'Partie standard de 3 minutes',
        duration: '3 min',
        difficulty: 'medium',
        playersOnline: 89,
        icon: <Clock size={20} className="text-brand-blue" />,
    },
    {
        id: 'wordsearch_expert',
        alias: 'Mots Mêlés - Expert',
        name:'wordsearch',
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
// COMPONENT
// =============================================================================

export default function LobbyPage() {
    const { isAuthenticated,token} = useAuth();


    // État pour le jeu sélectionné
    const [selectedGame, setSelectedGame] = useState<GameMode>(AVAILABLE_GAMES[0]);

    // État pour afficher le modal de connexion
    const [showLoginModal, setShowLoginModal] = useState(false);

   
    const handleLoginSuccess = () => {
        setShowLoginModal(false);

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
                                return <GamePick setSelectedGame={setSelectedGame} isSelected={isSelected} {...game} ></GamePick>
                            })}
                        </div>
                    </div>

                    {/* Bouton de recherche (EN BAS) */}
                    <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-lg text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Prêt à combattre ?</h2>
                        <p className="text-gray-400 mb-2">
                            Jeux Sélectionné :{' '}
                            <span className="text-brand-pink font-bold">{selectedGame.alias}</span>
                        </p>
                        <p className="text-gray-500 text-sm mb-6">{selectedGame.description}</p>

                        <MatchMakingButton token={token} isAuthenticated={isAuthenticated} game_name={selectedGame.name} setShowLoginModal={setShowLoginModal} />
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
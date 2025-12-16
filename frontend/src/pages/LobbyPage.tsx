// /frontend/src/pages/LobbyPage.tsx

import { useState } from 'react';
import {  Trophy, Users } from 'lucide-react';
import {MatchmakingLobby} from '../components/MatchmakingButton'
import Navbar from '../components/Navbar';
import Login from '../components/Login';
import { useAuth } from '../auth/AuthContext';
import GamePick from '../Game/components/GamePick';
import { GAME_REGISTRY } from '../Game/registry/gameRegistry';
import { type GameConfig } from '../Game/types/GameInterface';
// =============================================================================
// TYPES
// =============================================================================



// =============================================================================
// DATA
// =============================================================================

const AVAILABLE_GAMES: GameConfig[] = [
    GAME_REGISTRY['wordsearch'],
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
    const auth = useAuth();


    // État pour le jeu sélectionné
    const [selectedGame, setSelectedGame] = useState<GameConfig>(AVAILABLE_GAMES[0]);

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
            <Navbar {...auth} setShowLoginModal={setShowLoginModal}/>

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
                                return <GamePick key={game.id} setSelectedGame={setSelectedGame} isSelected={isSelected} {...game} ></GamePick>
                            })}
                        </div>
                    </div>

                    {/* Bouton de recherche (EN BAS) */}
                    <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-lg text-center items-center flex flex-col">
                        <h2 className="text-3xl font-bold text-white mb-2">Prêt à combattre ?</h2>
                        <p className="text-gray-400 mb-2">
                            Jeux Sélectionné :{' '}
                            <span className="text-brand-pink font-bold">{selectedGame.displayName}</span>
                        </p>
                        <p className="text-gray-500 text-sm mb-6">{selectedGame.description}</p>

                        <MatchmakingLobby token={auth.token} isAuthenticated={auth.isAuthenticated} gameName={selectedGame.id} onAuthRequired={() => setShowLoginModal(true)} />
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
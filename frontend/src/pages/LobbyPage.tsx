import { useState } from 'react';
import { Trophy, Users, Gamepad2, Zap, Crown, Medal, Star, ChevronRight, Play, Lock, Search, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import Login from '../components/Login';

import  { type MatchMakingProps,useMatchmaking } from '../Game/hooks/useMatchMaking';

// =============================================================================
// DEMO DATA
// =============================================================================

const AVAILABLE_GAMES = [
  {
    id: 'wordsearch',
    displayName: 'Word Search',
    description: 'Trouvez des mots cachés avant votre adversaire',
    icon: '🔤',
    players: 234,
    difficulty: 'Facile',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'puzzle',
    displayName: 'Speed Puzzle',
    description: 'Résolvez des puzzles le plus rapidement possible',
    icon: '🧩',
    players: 156,
    difficulty: 'Moyen',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'memory',
    displayName: 'Memory Master',
    description: 'Testez votre mémoire dans des défis rapides',
    icon: '🧠',
    players: 89,
    difficulty: 'Difficile',
    color: 'from-orange-500 to-red-500',
    locked: true,
  },
];

const TOP_PLAYERS = [
  { name: 'AlphaWolf', score: 2400, avatar: '🐺', rank: 1 },
  { name: 'Yami.59', score: 2150, avatar: '⚡', rank: 2 },
  { name: 'WordMaster', score: 1980, avatar: '📚', rank: 3 },
  { name: 'Pixel', score: 1800, avatar: '🎮', rank: 4 },
  { name: 'NinjaCode', score: 1650, avatar: '🥷', rank: 5 },
];

const STATS = [
  { label: 'Joueurs en ligne', value: '1,234', icon: Users, color: 'text-green-400' },
  { label: 'Parties en cours', value: '89', icon: Gamepad2, color: 'text-blue-400' },
  { label: 'Parties du jour', value: '3,456', icon: Zap, color: 'text-yellow-400' },
];


function MatchMakingLobby({
    token,
    gameName,
    isAuthenticated,
    onAuthRequired,
}: MatchMakingProps) {

  const {
            isSearching,
            isLoading,
            startSearch,
            cancelSearch,
        } = useMatchmaking({
            token,
            gameName,
            isAuthenticated,
            onAuthRequired,
        });
    return (


        <div className="flex flex-row gap-3 justify-center pt-4">
           
           <button className="flex gap-x-3 flex-row px-8 py-4 rounded-xl bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 font-bold text-lg"
           onClick={startSearch}
           disabled={isLoading}
           
           >
                {isSearching ? <Loader2 size={24} className="animate-spin" />:<Search size={24} />}

                {isSearching ? (
                  <>
                    <span className="text-sm">En attente d'un Joueur ...</span>
                  </>
              ) : (
                <span className="text-sm"> {'Trouver un adversaire'} </span>
              )}
          </button>
          {/* Bouton Annuler */}
          {isSearching && (

            <button className="px-8 py-4 rounded-xl bg-linear-to-r from-red-500 to-pink-600 hover:from-red-700 hover:to-pink-800 transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 font-bold text-lg"
              onClick={cancelSearch}
            >

              Annuler
            </button>
          )}
        
        </div>



    )

}
// =============================================================================
// COMPONENT
// =============================================================================

export default function LobbyPage() {
  const [selectedGame, setSelectedGame] = useState(AVAILABLE_GAMES[0]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginSuccess = () => {
        setShowLoginModal(false);

    };

    const handleCloseLoginModal = () => {
        setShowLoginModal(false);
    };

  const auth = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Header with modern navbar */}
        <Navbar {...auth} setShowLoginModal={setShowLoginModal}/>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {STATS.map((stat, index) => (
              <div
                key={index}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 shadow-lg hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left section: Games */}
            <div className="lg:col-span-2 space-y-8">
              {/* Available games */}
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-400" />
                  <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Jeux disponibles
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_GAMES.map((game) => {
                    const isSelected = selectedGame.id === game.id;
                    const isLocked = game.locked;

                    return (
                      <button
                        key={game.id}
                        onClick={() => !isLocked && setSelectedGame(game)}
                        disabled={isLocked}
                        className={`group relative backdrop-blur-xl rounded-2xl border p-6 transition-all duration-300 text-left overflow-hidden ${
                          isSelected
                            ? 'bg-white/10 border-purple-400/50 shadow-xl shadow-purple-500/30 scale-105'
                            : isLocked
                            ? 'bg-white/5 border-white/10 cursor-not-allowed opacity-50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105'
                        }`}
                      >
                        {/* Background gradient */}
                        <div className={`absolute inset-0 bg-linear-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        {/* Lock overlay */}
                        {isLocked && (
                          <div className="absolute top-4 right-4 w-10 h-10 bg-gray-700/80 rounded-full flex items-center justify-center">
                            <Lock className="w-5 h-5 text-gray-400" />
                          </div>
                        )}

                        {/* Content */}
                        <div className="relative z-10">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-16 h-16 bg-linear-to-br ${game.color} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
                              {game.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-1">{game.displayName}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/20">
                                  {game.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-400 mb-4">{game.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Users className="w-4 h-4" />
                              <span>{game.players} en ligne</span>
                            </div>
                            {isSelected && !isLocked && (
                              <div className="flex items-center gap-1 text-purple-400">
                                <span className="text-sm font-medium">Sélectionné</span>
                                <ChevronRight className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Matchmaking section */}
              <div className="backdrop-blur-xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-8 shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/50 mb-2">
                    <Play className="w-10 h-10" />
                  </div>
                  
                  <h2 className="text-3xl font-bold bg-linear-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Prêt à combattre ?
                  </h2>
                  
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      Jeu sélectionné :{' '}
                      <span className="font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {selectedGame.displayName}
                      </span>
                    </p>
                    <p className="text-sm text-gray-400 max-w-md mx-auto">
                      {selectedGame.description}
                    </p>
                  </div>

                  <MatchMakingLobby {...auth} gameName={selectedGame.id}></MatchMakingLobby>

                  <p className="text-xs text-gray-500 pt-2">
                    Vous serez associé à un joueur de niveau similaire
                  </p>
                </div>
              </div>
            </div>

            {/* Right section: Leaderboard */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl h-fit">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-linear-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/50">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold bg-linear-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Top Joueurs
                </h2>
              </div>

              <div className="space-y-3">
                {TOP_PLAYERS.map((player, index) => {
                  const isTop3 = index < 3;
                  const medalColors = [
                    'from-yellow-400 to-orange-500',
                    'from-gray-300 to-gray-500',
                    'from-amber-600 to-amber-800',
                  ];

                  return (
                    <div
                      key={index}
                      className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        isTop3
                          ? 'bg-linear-to-r from-white/10 to-white/5 border border-white/20 hover:border-white/30'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {/* Rank badge */}
                      <div className="relative">
                        {isTop3 ? (
                          <div className={`w-10 h-10 bg-linear-to-br ${medalColors[index]} rounded-full flex items-center justify-center shadow-lg`}>
                            {index === 0 ? (
                              <Crown className="w-5 h-5 text-white" />
                            ) : index === 1 ? (
                              <Medal className="w-5 h-5 text-white" />
                            ) : (
                              <Star className="w-5 h-5 text-white" />
                            )}
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
                        {player.avatar}
                      </div>

                      {/* Player info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-200 truncate">{player.name}</p>
                        <p className="text-xs text-gray-500">Rang #{player.rank}</p>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <p className={`font-bold ${isTop3 ? 'text-yellow-400' : 'text-purple-400'}`}>
                          {player.score}
                        </p>
                        <p className="text-xs text-gray-500">pts</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View all button */}
              <button className="w-full mt-4 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 text-sm flex items-center justify-center gap-2 group">
                <span>Voir le classement complet</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </main>
      </div>

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

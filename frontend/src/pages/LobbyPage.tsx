import { useState, useEffect } from 'react';
import { Trophy, Users, Gamepad2, Zap, Crown, Medal, Star, ChevronRight, Play, Lock, Search, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../auth/AuthContext';
import Login from '../components/Login';
import { GAME_REGISTRY } from '../Game/registry/gameRegistry';
import { type MatchMakingProps, useMatchmaking } from '../Game/hooks/useMatchMaking';
import Loader from '../components/Loader';
import apiService from '../services/apiService'; // On utilise ton nouveau service

const AVAILABLE_GAMES = Object.values(GAME_REGISTRY);

// =============================================================================
// SUB-COMPONENT: MatchMaking (Ta logique originale)
// =============================================================================

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

  const handleSearchClick = () => {
    if (!isAuthenticated || !token) {
      onAuthRequired?.();
    } else {
      startSearch();
    }
  };

  return (
    <div className="flex flex-row gap-3 justify-center pt-4">
      <button 
        className="flex gap-x-3 flex-row px-8 py-4 rounded-xl bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:scale-105 active:scale-95 font-bold text-lg items-center"
        onClick={handleSearchClick}
        disabled={isLoading}
      >
        {isSearching ? <Loader size='sm' variant='spinner' /> : <Search size={24} />}
        <span className="text-sm"> {isSearching ? "En attente d'un Joueur ..." : "Trouver un adversaire"} </span>
      </button>
      
      {isSearching && (
        <button 
          className="px-8 py-4 rounded-xl bg-linear-to-r from-red-500 to-pink-600 hover:from-red-700 hover:to-pink-800 transition-all duration-200 shadow-lg font-bold text-lg"
          onClick={cancelSearch}
        >
          Annuler
        </button>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT: LobbyPage
// =============================================================================

export default function LobbyPage() {
  const auth = useAuth();
  const [selectedGame, setSelectedGame] = useState(AVAILABLE_GAMES[0]);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // --- NOUVEAUX ÉTATS POUR LES VRAIES DONNÉES ---
  const [personalStats, setPersonalStats] = useState<any>(null);
  const [globalLive, setGlobalLive] = useState({ online_players: 0, active_games: 0, games_today: 0 });
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // --- CHARGEMENT DES DONNÉES DEPUIS LE BACKEND ---
  useEffect(() => {
    const fetchLobbyData = async () => {
      try {
        // 1. Récupérer les stats globales et le classement (public)
        const [globalRes, leaderRes] = await Promise.all([
          apiService.get('/stats/global'),
          apiService.get('/leaderboard')
        ]);
        
        setGlobalLive(globalRes.data);
        setLeaderboard(leaderRes.data);

        // 2. Récupérer tes stats perso (rang calculé) si tu es connecté
        if (auth.isAuthenticated) {
          const meRes = await apiService.get('/stats/me');
          setPersonalStats(meRes.data);
        }
      } catch (err) {
        console.error("Erreur de synchronisation Lobby:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchLobbyData();
    // Rafraîchir les compteurs toutes les 30 secondes pour le "temps réel"
    const interval = setInterval(fetchLobbyData, 30000);
    return () => clearInterval(interval);
  }, [auth.isAuthenticated]);

  const handleLoginSuccess = () => setShowLoginModal(false);
  const handleCloseLoginModal = () => setShowLoginModal(false);

  // On transforme tes compteurs en haut pour utiliser globalLive
  const dynamicStats = [
    { label: 'Joueurs en ligne', value: globalLive.online_players.toLocaleString(), icon: Users, color: 'text-green-400' },
    { label: 'Parties en cours', value: globalLive.active_games.toLocaleString(), icon: Gamepad2, color: 'text-blue-400' },
    { label: 'Parties du jour', value: globalLive.games_today.toLocaleString(), icon: Zap, color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-950 to-slate-900 text-white font-sans">
      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10">
        <Navbar {...auth} setShowLoginModal={setShowLoginModal}/>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* 1. BARRE DE STATS DYNAMIQUE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {dynamicStats.map((stat, index) => (
              <div
                key={index}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 shadow-lg hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                        {isInitialLoading ? '...' : stat.value}
                    </p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-50`} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              
              {/* 2. CARTE PROFIL (Tes stats réelles de useAuth + API Rang) */}
              {auth.isAuthenticated && (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-xl animate-in slide-in-from-left-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-linear-to-tr from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl font-black">
                            {auth.userInfo?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{auth.userInfo?.username}</h2>
                            <p className="text-xs text-yellow-500 font-black uppercase tracking-widest flex items-center gap-1">
                                <Star size={12} fill="currentColor"/> 
                                {personalStats?.rank ? `RANG #${personalStats.rank}` : 'NON CLASSÉ'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-8 text-right px-4 border-l border-white/5">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Victoires</p>
                            <p className="text-xl font-black text-green-400">{auth.userInfo?.victories || 0}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Ratio V/D</p>
                            <p className="text-xl font-black text-pink-500">{personalStats?.ratio || '0.00'}</p>
                        </div>
                    </div>
                </div>
              )}

              {/* Available games (Tes jeux originaux) */}
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-400" />
                  <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent italic">
                    Jeux disponibles
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_GAMES.map((game) => {
                    const isSelected = selectedGame.id === game.id;
                    const isLocked = game.component === undefined;

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
                        <div className={`absolute inset-0 bg-linear-to-br ${game.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        {isLocked && (
                          <div className="absolute top-4 right-4 w-10 h-10 bg-gray-700/80 rounded-full flex items-center justify-center">
                            <Lock className="w-5 h-5 text-gray-400" />
                          </div>
                        )}

                        <div className="relative z-10">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-16 h-16 bg-linear-to-br ${game.color} rounded-xl flex items-center justify-center text-3xl shadow-lg`}>
                              {game.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg mb-1">{game.displayName}</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/20 uppercase font-bold">
                                  {game.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{game.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tight">
                              <Users size={14} />
                              <span>{game.players} en ligne</span>
                              <div className="flex items-center gap-2 ml-2">
                                <Clock size={14}></Clock>
                                <span>{game.duration}</span>
                              </div>
                            </div>
                            {isSelected && !isLocked && (
                              <div className="flex items-center gap-1 text-purple-400">
                                <span className="text-xs font-bold uppercase italic">Sélectionné</span>
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

              {/* Matchmaking section (Design original) */}
              <div className="backdrop-blur-xl bg-linear-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-2xl p-8 shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl shadow-purple-500/50 mb-2">
                    <Play className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold bg-linear-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent italic tracking-tighter uppercase">
                    Prêt pour le duel ?
                  </h2>
                  <div className="space-y-1">
                    <p className="text-gray-300 text-sm">
                      Défie un adversaire sur : <span className="font-bold text-white">{selectedGame.displayName}</span>
                    </p>
                  </div>
                  <MatchMakingLobby {...auth} gameName={selectedGame.id} onAuthRequired={() => setShowLoginModal(true) } />
                </div>
              </div>
            </div>

            {/* 3. SECTION CLASSEMENT (Vrai Leaderboard de la base de données) */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl h-fit">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <div className="w-10 h-10 bg-linear-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-black bg-linear-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent uppercase tracking-tighter italic">
                  Leaderboard
                </h2>
              </div>

              <div className="space-y-3">
                {leaderboard.map((player, index) => {
                  const isTop3 = index < 3;
                  const isMe = player.username === auth.userInfo?.username;
                  const medalColors = ['from-yellow-400 to-orange-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-800'];

                  return (
                    <div
                      key={index}
                      className={`group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border ${
                        isMe ? 'bg-pink-500/20 border-pink-500/50 shadow-lg scale-105' : 'bg-white/5 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="relative">
                        {isTop3 ? (
                          <div className={`w-10 h-10 bg-linear-to-br ${medalColors[index]} rounded-full flex items-center justify-center shadow-lg`}>
                            {index === 0 ? <Crown className="w-5 h-5 text-white" /> : 
                             index === 1 ? <Medal className="w-5 h-5 text-white" /> : <Star className="w-5 h-5 text-white" />}
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center font-black text-xs text-gray-400">
                            #{index + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-200 truncate text-sm">{player.username}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-black">Global Rank</p>
                      </div>

                      <div className="text-right">
                        <p className={`font-black ${isTop3 ? 'text-yellow-400' : 'text-pink-500'} text-lg leading-none`}>
                          {player.victories}
                        </p>
                        <p className="text-[8px] text-gray-500 uppercase font-bold">Vics</p>
                      </div>
                    </div>
                  );
                })}
                {leaderboard.length === 0 && !isInitialLoading && (
                    <div className="text-center py-20 text-gray-600 italic text-sm">Arène vide...</div>
                )}
              </div>

              <button className="w-full mt-6 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center justify-center gap-2 group">
                <span>Voir le classement complet</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseLoginModal} />
            <div className="relative z-10 w-full max-w-md mx-4 shadow-2xl">
                <Login onSuccess={handleLoginSuccess} onClose={handleCloseLoginModal} isModal={true} />
            </div>
        </div>
      )}
    </div>
  );
}
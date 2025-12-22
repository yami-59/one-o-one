import { Volume2, VolumeX, Clock, User, Crown, Medal } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useState, useEffect,useCallback} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import GameOverlay from '../Game/components/GameOverlay';
import { GameStatus } from '../shared/GameMessages';
import { useGame } from '../Game/context/GameContext';
import GameProvider from '../Game/context/GameProvider';
import { getGameConfig, isValidGame } from '../Game/registry/GameRegistry';
import { useGameWebSocket } from '../Game/hooks/useGameWebSocket';
import { type GameBaseData } from '../Game/types/GameInterface';
import { useGameTimer } from '../Game/hooks/useGameTimer';
// import { type SoundType } from '../Game/types/GameInterface';
import Loader from '../components/Loader';

// Helper pour formater le nom
const formatPlayerName = (username: string | undefined, fallback: string): string => {
    if (!username) return fallback;
    return username.startsWith('guest-') ? 'guest' : username;
};

// =============================================================================
// UTILITAIRE AUDIO
// =============================================================================

/**
 * Crée une fonction playSound réutilisable.
 * Peut être utilisée dans n'importe quel composant.
 */
// const playSound = (() => {
//   // Cache pour stocker les instances audio
//   const audioCache: Record<string, HTMLAudioElement> = {};

//   return (type: SoundType, soundEnabled: boolean) => {
//     if (!soundEnabled) return;

//     // Si le son n'est pas encore dans le cache, on le crée
//     if (!audioCache[type]) {
//       audioCache[type] = new Audio(`/sounds/${type}.mp3`);
//     }

//     const audio = audioCache[type];
    
//     // Reset du son au début (si on clique vite, le son redémarre)
//     audio.currentTime = 0; 
//     audio.play().catch(e => console.warn("Audio play failed", e));
//   };
// })();

// Demo data
const DEMO_DATA = {
  player1: { name: 'TechMaster', score: 1250, avatar: '🎮' },
  player2: { name: 'ProGamer', score: 980, avatar: '🏆' },
  timeRemaining: '2:34',
  status: 'in-progress', // 'waiting', 'countdown', 'in-progress', 'finished'
  countdown: null,
  gameType: 'Speed Challenge'
};



function GamePageInner() {
    const auth = useAuth();
    const navigate = useNavigate();
    const game = useGame();
    const duration = game.gameData ? (game.gameData as GameBaseData).game_duration : null;
    const [soundEnabled, setSoundEnabled] = useState(true);
    const { formattedTime } = useGameTimer(game.startTimeStamp, duration);
    // 🎯 Crée la fonction playSound une seule fois
    const handleQuitButton = useCallback(() => {
        if (!game.ws || game.ws.readyState !== WebSocket.OPEN) {
            console.warn('WebSocket non connecté');

            return;
        }

        // Confirmation avant abandon
        const confirmed = window.confirm(
            'Es-tu sûr de vouloir abandonner ? Tu perdras la partie.'
        );

        if (confirmed) {
            game.ws.send(JSON.stringify({ type: 'abandon' }));
        }
    }, [game]);

    // Récupérer la config du jeu
    const gameConfig = getGameConfig(game.gameName!);
    const GameComponent = gameConfig?.component;

    useEffect(()=>{console.log("compte à rebours : ",game.countdown)},[game])
    if (!gameConfig || !GameComponent) {
        navigate('/')
        return 
    }



    


  return (



    <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-950 to-slate-900 text-white">
      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <Navbar {...auth }></Navbar>

   


  
        {/* Game area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Modern Scoreboard */}
          <div className="mb-8">
            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 shadow-2xl">
              {/* Timer in center */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                  <Clock className="w-5 h-5 text-purple-300" />
                  <span className="text-2xl font-mono tabular-nums tracking-wider text-purple-200">
                    {formattedTime}
                  </span>
                </div>
              </div>

              {/* Players */}
              <div className="grid grid-cols-3 gap-6 items-center">
                {/* Player 1 */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/50 ring-4 ring-blue-400/20">
                      {DEMO_DATA.player1.avatar}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-300">{formatPlayerName(game.me?.username, 'Moi')}</span>
                    </div>
                    <div className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {game.me?.score ?? 0}
                    </div>
                  </div>
                </div>

                {/* VS Badge */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-xl shadow-purple-500/50">
                      <span className="text-xl font-bold">VS</span>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-600 to-pink-600 animate-ping opacity-20" />
                  </div>
                </div>

                {/* Player 2 */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-pink-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-pink-500/50 ring-4 ring-pink-400/20">
                      {DEMO_DATA.player2.avatar}
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-linear-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-lg">
                      <Medal className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center mb-1">
                      <User className="w-4 h-4 text-pink-400" />
                      <span className="text-pink-300">{formatPlayerName(game.opponent?.username, 'Moi')}</span>
                    </div>
                    <div className="text-3xl font-bold bg-linear-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                      {game.opponent?.score ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Canvas Area */}
          <GameComponent />

          {/* Action buttons */}
          <div className="flex gap-4 justify-center mt-3">
            <button 
            onClick={handleQuitButton}
            className="px-6 py-3 rounded-xl bg-linear-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 border border-red-400/20">
              Abandonner
            </button>
            <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="ml-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
              >
                {soundEnabled ? <Volume2 /> : <VolumeX />}
            </button>
      
          </div>
        </main>
      </div>

      {/* Countdown Overlay */}
      {game.status === GameStatus.STARTING_COUNTDOWN && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="text-9xl font-bold bg-linear-to-br from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent   animate-pulse drop-shadow-2xl">
              {game.countdown}
            </div>
            <p className="mt-8 text-2xl text-gray-300">Préparez-vous...</p>
          </div>
        </div>
      )}

      {/* Waiting Overlay */}
      {game.status === GameStatus.WAITING_FOR_PLAYERS && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
                <Loader  variant='dots' size='xl' fullscreen></Loader>
                <div className="absolute inset-0 flex items-center justify-center">
                <User className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <p className="text-xl text-gray-200">En attente de l'adversaire...</p>
            <p className="text-sm text-gray-400">Recherche d'un joueur de niveau similaire</p>
          </div>
        </div>
      )}

      {/* Overlay Game Over */}
        {game.status === GameStatus.FINISHED && game.finishedData !== null && (
            <GameOverlay
                myScore={game.me?.score ?? 0}
                opponentScore={game.opponent?.score ?? 0}
                myName={formatPlayerName(game.me?.username, 'Moi')}
                opponentName={formatPlayerName(game.opponent?.username, 'Adversaire')}
                gameName={game.gameName!}
                token={auth.token}
                finishedData={game.finishedData}
                myId={game.me.id}
                isAuthenticated={auth.isAuthenticated}
                onLobby={() => navigate('/lobby')}
            />
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
        return <Loader variant="dots" size="lg" fullscreen />;
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
            <GamePageInner />
        </GameProvider>
    );
}


// =============================================================================
// WEBSOCKET HANDLER (séparé pour clarté)
// =============================================================================

function GameWebSocketHandler() {

  const game = useGame()
  useGameWebSocket(game);
  return null;
}

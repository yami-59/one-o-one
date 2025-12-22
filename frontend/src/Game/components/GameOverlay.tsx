import { useEffect, useMemo } from 'react';
import { Crown, Frown, Handshake, Flag, Trophy, Home, Play, Sparkles, Zap, Clock, Target } from 'lucide-react';
import { type GameFinishedMessage } from '../types/GameInterface';
import type { SoundType } from '../types/GameInterface';
import  { type MatchMakingProps,useMatchmaking } from '../hooks/useMatchMaking';
import Loader from '../../components/Loader';
// =============================================================================
// TYPES
// =============================================================================

interface GameOverlayProps {
    myScore: number;
    opponentScore: number;
    myName?: string;
    opponentName?: string;
    gameName: string;
    token: string | null;
    isAuthenticated: boolean;
    finishedData:GameFinishedMessage;
    myId:string;
    playSound?:((type: SoundType) => void) 
    onLobby: () => void;
}

type GameResult = 'win' | 'lose' | 'draw' | 'abandon';

// Helper function (mock)
const determineGameResult = (
    finishedData: GameFinishedMessage,
    myPlayerId: string,
): GameResult => {
    const { reason, winner_id, abandon_player_id } = finishedData;
    

    // Cas égalité
    if (!winner_id) {
        return 'draw';
    }

    // Cas abandon
    if (reason === 'abandon') {
        // Si c'est moi qui ai abandonné → lose
        // Si c'est l'adversaire → abandon (victoire par abandon)
        if (abandon_player_id === myPlayerId) {
            return 'lose';
        }
        return 'abandon';
    }

    return winner_id === myPlayerId ? 'win' : 'lose';
};


// =============================================================================
// CONFIGURATION
// =============================================================================

const resultConfig: Record<GameResult, {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    gradientFrom: string;
    gradientTo: string;
    iconBg: string;
    shadowColor: string;
}> = {
    win: {
        title: 'VICTOIRE !',
        subtitle: 'Félicitations, tu as dominé cette partie !',
        icon: <Crown className="text-white" size={48} />,
        gradientFrom: 'from-yellow-400',
        gradientTo: 'to-orange-500',
        iconBg: 'from-yellow-400 to-orange-500',
        shadowColor: 'shadow-yellow-500/50',
    },
    lose: {
        title: 'DÉFAITE',
        subtitle: 'Pas de chance, tu feras mieux la prochaine fois !',
        icon: <Frown className="text-white" size={48} />,
        gradientFrom: 'from-red-400',
        gradientTo: 'to-rose-600',
        iconBg: 'from-red-500 to-rose-600',
        shadowColor: 'shadow-red-500/50',
    },
    draw: {
        title: 'ÉGALITÉ !',
        subtitle: 'Match très serré !',
        icon: <Handshake className="text-white" size={48} />,
        gradientFrom: 'from-blue-400',
        gradientTo: 'to-cyan-500',
        iconBg: 'from-blue-500 to-cyan-500',
        shadowColor: 'shadow-blue-500/50',
    },
    abandon: {
        title: 'VICTOIRE PAR ABANDON',
        subtitle: 'Ton adversaire a quitté la partie.',
        icon: <Flag className="text-white" size={48} />,
        gradientFrom: 'from-orange-400',
        gradientTo: 'to-amber-500',
        iconBg: 'from-orange-500 to-amber-600',
        shadowColor: 'shadow-orange-500/50',
    },
};

// =============================================================================
// MOCK COMPONENTS
// =============================================================================

function MatchMakingOverlay({
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


        <button 
        onClick={isSearching ? cancelSearch : startSearch}
        disabled={isLoading}
        className="w-full py-3.5 bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
        {isLoading || isSearching ? 
                <Loader size='sm' variant='spinner' />
              : <Play size={20} />}

        {
            isSearching ? 
            <>Annuler</>
                : 
            <>Rejouer </>

        }
        </button>
    );
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function GameOverlay({
    myScore,
    opponentScore,
    myName = 'Moi',
    opponentName = 'Adversaire',
    gameName,
    token,
    isAuthenticated,
    finishedData,
    playSound,
    myId,
    onLobby,
}: GameOverlayProps)  {
    
    const result = determineGameResult(finishedData, myId || '');
    const config = resultConfig[result];
    // --- CALCUL DES STATS RÉELLES ---
    const stats = useMemo(() => {
        // Extraction des données brutes depuis l'état final
        console.log('FinishedData duration:', finishedData.duration);

        const dataAny = finishedData as any;
        const gameData = dataAny.game_data || {};
        const wordsToFind = gameData.words_to_find || [];
        const wordsFound = gameData.words_found || [];

        // 1. Calcul de la précision
        const foundByMe = wordsFound.filter((w: any) => w.found_by === myId).length;
        const totalWords = wordsToFind.length || 1;
        const precision = Math.round((foundByMe / totalWords) * 100);

        // 2. Calcul de la durée (MM:SS)
        // Note: Le backend renvoie souvent 'duration' en secondes dans finishedData
        const totalSeconds = finishedData.game_data?.game_duration ?? finishedData.duration ?? 0;
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const durationStr = `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;

        return {
            points: myScore,
            duration: durationStr,
            precision: precision
        };
    }, [finishedData, myId, myScore]);

    useEffect(() => {
        console.log(result);
        if ((result === 'win' || result === 'abandon')&& playSound) playSound('win');
    }, [playSound, result]);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            {/* Particles effect (optional) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {result === 'win' && (
                    <>
                        <Sparkles className="absolute top-1/4 left-1/4 w-8 h-8 text-yellow-400 animate-pulse" />
                        <Sparkles className="absolute top-1/3 right-1/4 w-6 h-6 text-yellow-300 animate-pulse delay-300" />
                        <Sparkles className="absolute bottom-1/3 left-1/3 w-7 h-7 text-orange-400 animate-pulse delay-500" />
                    </>
                )}
            </div>

            {/* Modal */}
            <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-scale-in">
                {/* Icon with glow */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        {/* Glow effect */}
                        <div className={`absolute inset-0 rounded-full bg-linear-to-br ${config.iconBg} blur-2xl opacity-60 animate-pulse`} />
                        {/* Icon container */}
                        <div className={`relative w-24 h-24 bg-linear-to-br ${config.iconBg} rounded-full flex items-center justify-center shadow-2xl ${config.shadowColor}`}>
                            {config.icon}
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2 className={`text-4xl font-black text-center mb-2 bg-linear-to-r ${config.gradientFrom} ${config.gradientTo} bg-clip-text text-transparent`}>
                    {config.title}
                </h2>

                {/* Subtitle */}
                <p className="text-gray-300 text-center mb-8">
                    {config.subtitle}
                </p>

                {/* Scores */}
                <div className="mb-8">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
                        <div className="flex justify-center items-center gap-8">
                            {/* My score */}
                            <div className="flex-1 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <div className="w-10 h-10 bg-linear-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-xl shadow-lg shadow-pink-500/50">
                                        😊
                                    </div>
                                    {result === 'win' && (
                                        <Trophy className="text-yellow-400 animate-bounce" size={20} />
                                    )}
                                </div>
                                <p className="text-pink-400 font-bold text-sm uppercase tracking-wider mb-2">
                                    {myName}
                                </p>
                                <div className={`text-5xl font-black ${result === 'win' ? 'bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent' : 'text-white'}`}>
                                    {myScore}
                                </div>
                            </div>

                            {/* VS Divider */}
                            <div className="relative">
                                <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-500/50">
                                    <span className="text-xl font-black text-white">VS</span>
                                </div>
                                <div className="absolute inset-0 rounded-full bg-linear-to-br from-purple-600 to-pink-600 animate-ping opacity-20" />
                            </div>

                            {/* Opponent score */}
                            <div className="flex-1 text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    {result === 'lose' && (
                                        <Trophy className="text-yellow-400 animate-bounce" size={20} />
                                    )}
                                    <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-xl shadow-lg shadow-blue-500/50">
                                        🎮
                                    </div>
                                </div>
                                <p className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-2">
                                    {opponentName}
                                </p>
                                <div className={`text-5xl font-black ${result === 'lose' ? 'bg-linear-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent' : 'text-white'}`}>
                                    {opponentScore}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats (optional) */}
                 <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3 text-center transition-all hover:bg-white/10">
                    <Zap size={14} className="text-yellow-500 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-tighter">Points</p>
                    <p className="text-lg font-bold text-green-400">+{stats.points}</p>
                </div>
                
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3 text-center transition-all hover:bg-white/10">
                    <Clock size={14} className="text-purple-400 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-tighter">Durée</p>
                    <p className="text-lg font-bold text-purple-400">{stats.duration}</p>
                </div>
                
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3 text-center transition-all hover:bg-white/10">
                    <Target size={14} className="text-blue-400 mx-auto mb-1" />
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-tighter">Précision</p>
                    <p className="text-lg font-bold text-blue-400">{stats.precision}%</p>
                </div>
            </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    {/* Rematch button */}
                    <MatchMakingOverlay
                        token={token}
                        gameName={gameName}
                        isAuthenticated={isAuthenticated}
                    />

                    {/* Lobby button */}
                    <button
                        onClick={onLobby}
                        className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <Home size={20} />
                        Retour au Lobby
                    </button>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
                
                .delay-300 {
                    animation-delay: 0.3s;
                }
                
                .delay-500 {
                    animation-delay: 0.5s;
                }
            `}</style>
        </div>
    );
}


// /frontend/src/game/components/GameOverlay.tsx

import { Trophy, Home, Crown, Frown, Handshake,Flag } from 'lucide-react';
import {MatchMakingOverlay} from '../../components/MatchmakingButton';
import { type GameFinishedMessage } from '../types/GameInterface';
import type { SoundType } from '../types/GameInterface';
import { useEffect } from 'react';
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
    setShowLoginModal: React.Dispatch<React.SetStateAction<boolean>>;
    finishedData:GameFinishedMessage;
    myId:string;
    playSound:((type: SoundType) => void) 
    onLobby: () => void;
}

type GameResult = 'win' | 'lose' | 'draw' | 'abandon';

// =============================================================================
// HELPERS
// =============================================================================


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



const resultConfig: Record<GameResult, {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    borderColor: string;
    titleColor: string;
}> = {
    win: {
        title: 'VICTOIRE !',
        subtitle: 'Félicitations, tu as dominé cette partie !',
        icon: <Crown className="text-brand-yellow" size={48} />,
        borderColor: 'border-brand-yellow',
        titleColor: 'text-brand-yellow',
    },
    lose: {
        title: 'DÉFAITE',
        subtitle: 'Pas de chance, tu feras mieux la prochaine fois !',
        icon: <Frown className="text-red-400" size={48} />,
        borderColor: 'border-red-500',
        titleColor: 'text-red-400',
    },
    draw: {
        title: 'ÉGALITÉ !',
        subtitle: 'Match très serré !',
        icon: <Handshake className="text-brand-blue" size={48} />,
        borderColor: 'border-brand-blue',
        titleColor: 'text-brand-blue',
    },
   abandon: {
        title: 'VICTOIRE PAR ABANDON',
        subtitle: 'Ton adversaire a quitté la partie.',
        icon: <Flag className="text-orange-400" size={48} />,
        borderColor: 'border-orange-500',
        titleColor: 'text-orange-400',
    },
};

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
    setShowLoginModal,
    finishedData,
    playSound,
    myId,
    onLobby,
}: GameOverlayProps) {
    
    const result = determineGameResult(finishedData, myId);
    const config = resultConfig[result];


    useEffect(() =>{

        console.log(result)

        if(result === 'win' || result === 'abandon') playSound('win')
    
    },[playSound,result])

    return (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div
                className={`bg-gray-800 border-2 ${config.borderColor} rounded-2xl p-8 max-w-1/3 w-full min-w-md text-center shadow-2xl animate-bounce-in`}
            >
                {/* Icône */}
                <div className="flex justify-center mb-4">
                    {config.icon}
                </div>

                {/* Titre */}
                <h2 className={`text-4xl font-black ${config.titleColor} mb-2`}>
                    {config.title}
                </h2>

                {/* Sous-titre */}
                <p className="text-gray-300 mb-6">
                    {config.subtitle}
                </p>

                {/* Scores */}
                <div className="flex justify-center gap-8 mb-8">
                    {/* Mon score */}
                    <div className="text-center">
                        <p className="text-brand-pink font-bold text-sm uppercase tracking-wider mb-1">
                            {myName}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            {result === 'win' && <Trophy className="text-brand-yellow" size={20} />}
                            <p className={`text-4xl font-bold ${result === 'win' ? 'text-brand-yellow' : 'text-white'}`}>
                                {myScore}
                            </p>
                        </div>
                    </div>

                    {/* Séparateur */}
                    <div className="flex items-center">
                        <span className="text-gray-500 text-2xl font-bold">-</span>
                    </div>

                    {/* Score adversaire */}
                    <div className="text-center">
                        <p className="text-brand-blue font-bold text-sm uppercase tracking-wider mb-1">
                            {opponentName}
                        </p>
                        <div className="flex items-center justify-center gap-2">
                            {result === 'lose' && <Trophy className="text-brand-yellow" size={20} />}
                            <p className={`text-4xl font-bold ${result === 'lose' ? 'text-brand-yellow' : 'text-white'}`}>
                                {opponentScore}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Boutons */}
                <div className="flex flex-col items-center gap-3">
                    {/* 🎯 MatchmakingButton pour rejouer */}
                    <MatchMakingOverlay

                        token={token}
                        gameName={gameName}
                        isAuthenticated={isAuthenticated}
                        onAuthRequired={() => setShowLoginModal(true)}
                    />

                    <button
                        onClick={onLobby}
                        className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition flex items-center justify-center gap-2"
                    >
                        <Home size={20} />
                        Retour au Lobby
                    </button>
                </div>
            </div>
        </div>
    );
}
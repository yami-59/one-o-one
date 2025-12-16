import React from 'react'
import { Clock } from 'lucide-react';
import type { GameConfig } from '../types/GameInterface';



const getDifficultyColor = (difficulty: GameConfig['difficulty']) => {
    switch (difficulty) {
        case 'easy':
            return 'text-green-400 bg-green-400/10';
        case 'medium':
            return 'text-yellow-400 bg-yellow-400/10';
        case 'hard':
            return 'text-red-400 bg-red-400/10';
    }
};

const GamePick = ({setSelectedGame,isSelected,...game} :
     GameConfig & {
        setSelectedGame:React.Dispatch<React.SetStateAction<GameConfig>>;
        isSelected:boolean;
    }) => {


        
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
                        {game.difficulty}
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
                {game.displayName}
            </h4>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-3">{game.description}</p>

            {/* Footer */}
            <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {game.durationString}
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    {/* {game.playersOnline} en ligne */}
                </span>
            </div>
        </div>
    );
}

export default GamePick
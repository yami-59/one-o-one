// /frontend/src/game/registry/gameRegistry.tsx
import type { GameConfig } from '../types/GameInterface';
import { WordSearchScreen } from '../../wordsearch/components/WordSearchScreen';
import {  Zap } from 'lucide-react';

// import { MemoryGameScreen } from '../../memorygame/components/MemoryGameScreen';

/**
 * Registre de tous les jeux disponibles.
 * Pour ajouter un nouveau jeu :
 * 1. Créer le composant dans son propre dossier
 * 2. L'ajouter ici avec sa configuration
 */


export const GAME_REGISTRY: Record<string, GameConfig> = {
    wordsearch: {
        id:'wordsearch',
        displayName: 'Mots Mêlés',
        component: WordSearchScreen,
        duration: 300,
        durationString:'5 min',
        difficulty: 'easy',
        description: 'Partie rapide de 5 minutes',
        icon: <Zap size={20} className="text-brand-yellow" />,
    },
    // memory: {
    //     displayName: 'Memory',
    //     component: MemoryGameScreen,
    //     defaultDuration: 120,
    //     playerCount: 2,
    //     icon: '🧠',
    // },
};

export function getGameConfig(gameName: string): GameConfig | null {
    return GAME_REGISTRY[gameName] ?? null;
}

export function isValidGame(gameName: string): boolean {
    return gameName in GAME_REGISTRY;
}
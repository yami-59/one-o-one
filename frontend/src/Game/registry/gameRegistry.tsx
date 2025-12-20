// /frontend/src/game/registry/gameRegistry.tsx
import type { GameConfig } from '../types/GameInterface';
import { WordSearchScreen } from '../../wordsearch/components/WordSearchScreen';
import WordSearchIcon from '../../wordsearch/components/WordSearchIcon';

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
        duration:'5 min',
        difficulty: 'easy',
        players: 89,
        description: 'Partie rapide de 5 minutes',
        icon: <WordSearchIcon size={64} animated  variant='gradient'/>,
    },
    memory:{
        id: 'memory',
        displayName: 'Memory Master',
        description: 'Testez votre mémoire dans des défis rapides',
        icon: '🧠',
        duration:'5 min',
        players: 89,
        difficulty: 'hard',
        color: 'from-orange-500 to-red-500',
    }

};

export function getGameConfig(gameName: string): GameConfig | null {
    return GAME_REGISTRY[gameName] ?? null;
}

export function isValidGame(gameName: string): boolean {
    return gameName in GAME_REGISTRY;
}
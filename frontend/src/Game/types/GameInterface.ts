// /frontend/src/game/types/GameInterface.ts


/**
 * Interface que tous les écrans de jeu doivent implémenter.
 * Cela garantit une cohérence entre les différents jeux.
 */
export interface GameScreenProps {
    /** Données spécifiques au jeu (grille, mots, etc.) */
    gameData: unknown;
}

/**
 * Configuration d'un jeu pour le registre.
 */
export interface GameConfig {

    id:string

    /** Nom affiché */
    displayName: string;
    
    /** Composant React du jeu */
    component: React.ComponentType;
    
    /** Durée par défaut en secondes */
    duration: number;

    durationString:string;

    difficulty:'easy'|'medium'|'hard';

    description: string;

    
    /** Icône (optionnel) */
    icon?: React.ReactNode;
}


// Interface de base commune à tous les jeux
export interface GameBaseData {
  // Score en temps réel (toujours nécessaire)
  realtime_score: Record<string, number>; // {player_id: score_actuel}

  game_duration: number;   // durée totale du jeu (en secondes)
}
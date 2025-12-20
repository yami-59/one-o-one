// /frontend/src/game/types/GameInterface.ts


// =============================================================================
// TYPES
// =============================================================================

/** Types de sons disponibles */
export type SoundType = 'pop' | 'win' | 'success' ;

/**
 * Interface que tous les écrans de jeu doivent implémenter.
 */
export interface GameComponentProps {
    /** Fonction pour jouer un son */
    playSound?: (type: SoundType) => void;
}

/**
 * Configuration d'un jeu pour le registre.
 */
export interface GameConfig {
    id: string;
    displayName: string;
    component?: React.ComponentType<GameComponentProps>;
    players?:number
    duration: string;
    color?:string
    difficulty: 'easy' | 'medium' | 'hard';
    description: string;
    icon?: React.ReactNode;
}



// Interface de base commune à tous les jeux
export interface GameBaseData {
  // Score en temps réel (toujours nécessaire)
  realtime_score: Record<string, number>; // {player_id: score_actuel}

  game_duration: number;   // durée totale du jeu (en secondes)
}


export interface GameFinishedMessage {
    type: 'game_finished';
    reason: 'timeout' | 'abandon' | 'completed';
    winner_id: string | null;
    winner_username: string | null;
    loser_id: string | null;
    scores: Record<string, number>;
    abandon_player_id?: string;
    abandon_username?: string;
}
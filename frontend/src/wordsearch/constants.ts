
// Constantes minimales pour définir la zone de dessin
export const LINE_THICKNESS = 30; // Épaisseur de la ligne en pixels
export const CELL_SIZE = 50;
export const GAP_SIZE = 4
export const RAINBOW_COLORS = [
    'rgba(255, 0, 0, 0.5)', // Rouge
    'rgba(255, 165, 0, 0.5)', // Orange
    'rgba(255, 255, 0, 0.5)', // Jaune
    'rgba(0, 128, 0, 0.5)', // Vert
    'rgba(0, 0, 255, 0.5)', // Bleu
    'rgba(75, 0, 130, 0.5)', // Indigo
    'rgba(238, 130, 238, 0.5)', // Violet
];


export const GameMessages = {
    // ----------------------------------------------------
    // MESSAGES CLIENT
    // ----------------------------------------------------
    SUBMIT_SELECTION: 'submit_selection',
    SELECTION_UPDATE: 'selection_update',
    SELECTION_RESET:'selection_reset',
    WORD_FOUND_SUCCESS: 'word_found_success',
    GAME_DATA:"game_data",
    SCORE_UPDATE:"score_update",

    ERROR : "error"

};


export const GameStatus = {
    STARTING_COUNTDOWN : "starting_coutdown",
    GAME_START : "game_start",
    GAME_FINISHED : "game_finished",
    GAME_CLOSED : "game_closed",
    GAME_IN_PROGRESS : "game_in_progress",
    WAITING_FOR_PLAYERS : "waiting_for_players"

}

export const Games = {
    WORDSEARCH:"wordsearch"
}






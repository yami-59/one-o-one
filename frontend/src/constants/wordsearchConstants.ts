// Constantes minimales pour définir la zone de dessin
export const LINE_THICKNESS = 30; // Épaisseur de la ligne en pixels
export const CELL_SIZE=50
export const GRID_SIZE=10
export const CANVAS_SIZE=CELL_SIZE*GRID_SIZE

export const RAINBOW_COLORS = [
    'rgba(255, 0, 0, 0.5)',     // Rouge
    'rgba(255, 165, 0, 0.5)',   // Orange
    'rgba(255, 255, 0, 0.5)',   // Jaune
    'rgba(0, 128, 0, 0.5)',     // Vert
    'rgba(0, 0, 255, 0.5)',     // Bleu
    'rgba(75, 0, 130, 0.5)',    // Indigo
    'rgba(238, 130, 238, 0.5)'  // Violet
];


export const GAME_ID = "game_de_test"

export const GameMessageType  = {
    // ----------------------------------------------------
    // MESSAGES CLIENT
    // ----------------------------------------------------
    SUBMIT_SELECTION : "submit_selection",
    SELECTION_UPDATE : "selection_update",
    PLAYER_READY : "player_ready",
    PLAYER_JOINED:"player_joined",
    
    // ----------------------------------------------------
    // MESSAGES SERVEUR
    // ----------------------------------------------------
    GAME_START : "game_start",
    GAME_OVER : "game_over",
    WORD_FOUND_SUCCESS : "word_found_success",
    REMOTE_SELECTION : "remote_selection", // 🎯 Nouveau type pour l'aperçu adverse
    SCORE_UPDATE : "score_update",
    
    ERROR : "error",
}
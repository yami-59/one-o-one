// /frontend/src/wordsearch/components/GameScreen.tsx
// import GameGrid from "./GameGrid";
// import SidePanel from "./SidePanel";
import { useGameSync } from "../hooks/useGameSync";

export function GameScreen({ ws }: { ws: WebSocket }) {
    const { gameData, countdown, isGameStarted, timeRemaining } = useGameSync(ws);

    // ─────────────────────────────────────────────────────────────────────────
    // État : Chargement
    // ─────────────────────────────────────────────────────────────────────────
    if (!gameData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin h-12 w-12 border-4 border-brand-pink border-t-transparent rounded-full" />
                <p className="ml-4">Chargement de la partie...</p>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // État : Countdown
    // ─────────────────────────────────────────────────────────────────────────
    if (countdown !== null) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                {/* Grille floue en arrière-plan */}
                <div className="absolute inset-0 blur-md opacity-50">
                    {/* <GameGrid gridData={gameData.grid_data} disabled /> */}
                </div>
                
                {/* Countdown au centre */}
                <div className="relative z-10 text-9xl font-bold text-brand-yellow animate-pulse">
                    {countdown}
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // État : Jeu en cours
    // ─────────────────────────────────────────────────────────────────────────
    if (isGameStarted) {
        return (
            <div>
                {/* Timer */}
                <div className="text-center text-2xl font-mono mb-4">
                    ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
                
                {/* Grille de jeu */}
                {/* <GameGrid gridData={gameData.grid_data} /> */}
                
                {/* Liste des mots */}
                {/* <SidePanel wordsToFind={gameData.words_to_find} /> */}
            </div>
        );
    }

    // État : En attente du signal de départ
    return (
        <div className="flex items-center justify-center h-screen">
            <p>Prêt ! En attente du départ...</p>
        </div>
    );
}



/*
    Serveur              Joueur 1              Joueur 2
       │                    │                     │
       │   prepare_game     │                     │
       │ ─────────────────► │                     │
       │ ─────────────────────────────────────► │
       │                    │                     │
       │                    │ (charge la grille)  │ (charge la grille)
       │                    │                     │
       │   player_ready     │                     │
       │ ◄───────────────── │                     │
       │ ◄─────────────────────────────────────  │
       │                    │                     │
       │     countdown: 3   │                     │
       │ ─────────────────► │                     │
       │ ─────────────────────────────────────► │
       │                    │                     │
       │     countdown: 2   │                     │
       │ ─────────────────► │                     │
       │ ─────────────────────────────────────► │
       │                    │                     │
       │     countdown: 1   │                     │
       │ ─────────────────► │                     │
       │ ─────────────────────────────────────► │
       │                    │                     │
       │  game_start +      │                     │
       │  timestamp         │                     │
       │ ─────────────────► │                     │
       │ ─────────────────────────────────────► │
       │                    │                     │
       │                    │◄─── MÊME MOMENT ──►│
       │                    │    (GO!)            │


*/
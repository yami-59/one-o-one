// /frontend/src/hooks/useGameSync.ts

import { useState, useEffect } from 'react';

interface GameData {
    grid_data: string[][];
    words_to_find: string[];
    theme: string;
}

interface UseGameSyncResult {
    gameData: GameData | null;
    countdown: number | null;
    isGameStarted: boolean;
    timeRemaining: number;
}

export function useGameSync(ws: WebSocket | null): UseGameSyncResult {
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isGameStarted] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
    const [duration, setDuration] = useState(180);

    useEffect(() => {
        if (!ws) return;

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                // ─────────────────────────────────────────────────────────────
                // PHASE 1 : Réception des données
                // ─────────────────────────────────────────────────────────────
                case 'prepare_game':
                    console.log('📦 Données de jeu reçues, chargement...');
                    setGameData(data.game_data);
                    
                    // Simuler un temps de chargement (rendu de la grille)
                    // Puis signaler qu'on est prêt
                    requestAnimationFrame(() => {
                        // Attendre que React ait rendu la grille
                        setTimeout(() => {
                            ws.send(JSON.stringify({ type: 'player_ready' }));
                            console.log('✅ Prêt envoyé au serveur');
                        }, 100);
                    });
                    break;

                // ─────────────────────────────────────────────────────────────
                // PHASE 2 : Countdown
                // ─────────────────────────────────────────────────────────────
                case 'countdown':
                    setCountdown(data.seconds);
                    break;

                // ─────────────────────────────────────────────────────────────
                // PHASE 3 : Démarrage synchronisé
                // ─────────────────────────────────────────────────────────────
                case 'game_start':
                    setCountdown(null);
                    setStartTimestamp(data.start_timestamp);
                    setDuration(data.duration_seconds);
                    
                    // Calculer le délai avant démarrage
                    // const now = Date.now() / 1000;
                    // const delay = Math.max(0, (data.start_timestamp - now) * 1000);
                    
                    // Démarrer exactement au timestamp prévu
                    // setTimeout(() => {
                    //     setIsGameStarted(true);
                    //     console.log('🚀 GO!');
                    // }, delay);
                    break;
            }
        };

        ws.addEventListener('message', handleMessage);
        return () => ws.removeEventListener('message', handleMessage);
    }, [ws]);

    // ─────────────────────────────────────────────────────────────────────────
    // Timer synchronisé
    // ─────────────────────────────────────────────────────────────────────────
    
    useEffect(() => {
        if (!isGameStarted || !startTimestamp) return;

        const interval = setInterval(() => {
            const now = Date.now() / 1000;
            const elapsed = now - startTimestamp;
            const remaining = Math.max(0, duration - elapsed);
            
            setTimeRemaining(Math.ceil(remaining));

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 100); // Mise à jour toutes les 100ms pour fluidité

        return () => clearInterval(interval);
    }, [isGameStarted, startTimestamp, duration]);

    return {
        gameData,
        countdown,
        isGameStarted,
        timeRemaining,
    };
}
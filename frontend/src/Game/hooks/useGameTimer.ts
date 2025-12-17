// /frontend/src/game/hooks/useGameTimer.ts

import { useState, useEffect } from 'react';

interface UseGameTimerResult {
    timeRemaining: number | null;  // 🎯 null = pas encore prêt
    isTimeUp: boolean;
    formattedTime: string | null;  // 🎯 null = pas encore prêt
    isReady: boolean;              // 🎯 Pour vérifier si le timer est prêt
}

export function useGameTimer(
    startTimestamp: number | null,
    durationSeconds: number | null
): UseGameTimerResult {
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [isTimeUp, setIsTimeUp] = useState(false);

    useEffect(() => {
        // 🎯 Pas de timer si données manquantes
        if (startTimestamp === null || durationSeconds === null) {
            setTimeRemaining(null);
            setIsTimeUp(false);
            return;
        }

        const calculateRemaining = () => {
            const now = Date.now() / 1000;
            const elapsed = now - startTimestamp;
            const remaining = Math.max(0, durationSeconds - elapsed);

            setTimeRemaining(Math.ceil(remaining));

            if (remaining <= 0) {
                setIsTimeUp(true);
            }
        };

        calculateRemaining();
        const interval = setInterval(calculateRemaining, 100);

        return () => clearInterval(interval);
    }, [startTimestamp, durationSeconds]);

    // 🎯 Formatage seulement si timeRemaining existe
    const formattedTime = timeRemaining !== null
        ? `${Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:${(timeRemaining % 60).toString().padStart(2, '0')}`
        : null;

    return {
        timeRemaining,
        isTimeUp,
        formattedTime,
        isReady: timeRemaining !== null,
    };
}
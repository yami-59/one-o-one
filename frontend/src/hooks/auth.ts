import { useState, useEffect } from 'react';
import { fetchGuestToken, TOKEN_KEY, PLAYER_ID_KEY } from '../lib/auth';

export const useAuth = () => {
    const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
    const [playerId, setPlayerId] = useState(localStorage.getItem(PLAYER_ID_KEY));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Si aucun token n'est présent, appeler l'API
        if (!token) {
            fetchGuestToken().then(({ token, playerId }) => {
                setToken(token);
                setPlayerId(playerId);
                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            });
        } else {
            setIsLoading(false);
        }
    }, [token]);

    // Retourne le token, l'ID, et l'état de chargement
    return { token, playerId, isLoading };
};
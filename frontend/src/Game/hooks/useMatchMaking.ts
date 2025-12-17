// /frontend/src/hooks/useMatchmaking.ts

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_BASE_URL;

// =============================================================================
// TYPES
// =============================================================================

interface MatchmakingResponse {
    status: string;
    player_id?: string;
}

interface MatchFoundResponse {
    status: string;
    game_id?: string;
    game_name?: string;
    opponent_id?: string;
    initial_state?: Record<string, unknown>;
}

export type MatchmakingStatus = 
    | 'idle'           // Pas de recherche en cours
    | 'searching'      // Recherche en cours
    | 'found'          // Match trouvé
    | 'error';         // Erreur

interface UseMatchmakingOptions {
    token: string | null;
    gameName: string;
    isAuthenticated: boolean;
    onAuthRequired?: () => void;
    pollingInterval?: number;
}

interface UseMatchmakingReturn {
    status: MatchmakingStatus;
    isSearching: boolean;
    isLoading: boolean;
    error: string | null;
    matchData: MatchFoundResponse | null;
    startSearch: () => Promise<void>;
    cancelSearch: () => Promise<void>;
    reset: () => void;
}

export interface MatchMakingProps {
    token: string | null;
    gameName: string;
    isAuthenticated: boolean;
    onAuthRequired?: () => void;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function apiRequest<T>(
    endpoint: string,
    token: string,
    method: "GET" | "POST" = "POST",
    body?: Record<string, unknown>
): Promise<T | null> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} ${response.statusText}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Fetch error for ${endpoint}:`, error);
        return null;
    }
}

// =============================================================================
// HOOK
// =============================================================================

export function useMatchmaking({
    token,
    gameName,
    isAuthenticated,
    onAuthRequired,
    pollingInterval = 1000,
}: UseMatchmakingOptions): UseMatchmakingReturn {
    const [status, setStatus] = useState<MatchmakingStatus>('idle');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [matchData, setMatchData] = useState<MatchFoundResponse | null>(null);

    const navigate = useNavigate();
    const intervalRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Démarrer la recherche
    const startSearch = useCallback(async () => {
        if (isLoading || status === 'searching') return;

        if (!isAuthenticated || !token) {
            onAuthRequired?.();
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiRequest<MatchmakingResponse>(
                "/matchmaking/join",
                token,
                "POST",
                { game_name: gameName }
            );

            console.log(response)

            if (!isMountedRef.current) return;

            if (!response) {
                setError("Erreur de connexion au serveur");
                setStatus('error');
                return;
            }

            if (response.status === "waiting" || response.status === "already_waiting") {
                setStatus('searching');
            } else {
                setError(`Statut inattendu: ${response.status}`);
                setStatus('error');
            }
        } catch  {
            if (isMountedRef.current) {
                setError("Erreur lors de la recherche");
                setStatus('error');
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [token, gameName, isAuthenticated, isLoading, status, onAuthRequired]);

    // Annuler la recherche
    const cancelSearch = useCallback(async () => {
        if (isLoading || status !== 'searching') return;

        if (!token) return;

        setIsLoading(true);

        try {
            const response = await apiRequest<MatchmakingResponse>(
                "/matchmaking/leave",
                token,
                "POST",
                { game_name: gameName }
            );

            console.log(response)

            if (isMountedRef.current) {
                setStatus('idle');
                setMatchData(null);
            }
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [token, gameName, isLoading, status]);

    // Reset complet
    const reset = useCallback(() => {
        setStatus('idle');
        setError(null);
        setMatchData(null);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Polling pour vérifier si un match est trouvé
    useEffect(() => {
        if (status !== 'searching' || !token) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        const checkMatch = async () => {
            const response = await apiRequest<MatchFoundResponse>(
                "/matchmaking/check-match",
                token,
                "GET"
            );

            console.log(response)

            if (!isMountedRef.current) return;

            if (!response) {
                console.warn("Erreur lors du check match");
                return;
            }

            if (response.status === "match_found" && response.game_id) {
                // Match trouvé !
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }

                setStatus('found');
                setMatchData(response);

                console.log("✅ Match trouvé:", response);

                // Navigation après un court délai
                setTimeout(() => {
                    if (isMountedRef.current) {
                        navigate(`/game/${gameName}/${response.game_id}/`);
                    }
                }, 500);
            }
        };

        // Premier check immédiat
        checkMatch();

        // Puis polling régulier
        intervalRef.current = setInterval(checkMatch, pollingInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            console.log("🧹 Polling arrêté");
        };
    }, [status, token, gameName, navigate, pollingInterval]);

    return {
        status,
        isSearching: status === 'searching',
        isLoading,
        error,
        matchData,
        startSearch,
        cancelSearch,
        reset,
    };
}
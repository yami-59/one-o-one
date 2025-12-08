// /frontend/src/components/matchmakingButton.tsx

import { useState, useEffect, useCallback } from "react";
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
  game_type?: string;
  opponent_id?: string;
  initial_state?: Record<string, unknown>;
}

interface MatchmakingButtonProps {
  token: string;
  game_name:string;
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

const matchmakingApi = {
  join: (token: string) =>
    apiRequest<MatchmakingResponse>("/matchmaking/join", token, "POST", {
      game_name: "wordsearch",
    }),

  leave: (token: string) =>
    apiRequest<MatchmakingResponse>("/matchmaking/leave", token, "POST", {
      game_name: "wordsearch",
    }),

  checkMatch: (token: string) =>
    apiRequest<MatchFoundResponse>("/matchmaking/check-match", token, "GET"),

  reset: (token: string) =>
    apiRequest<{ status: string }>("/matchmaking/reset", token, "POST"),
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function MatchmakingButton({ token,game_name }: MatchmakingButtonProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("En attente d'un joueur...");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Handler pour rejoindre/quitter la file
  const handlePlayClick = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (!isSearching) {
        // Rejoindre la file d'attente
        const response = await matchmakingApi.join(token);

        if (!response) {
          setMessage("Erreur de connexion");
          return;
        }

        if (response.status === "waiting" || response.status === "already_waiting") {
          setIsSearching(true);
          setMessage("En attente d'un joueur...");
        }
      } else {
        // Quitter la file d'attente
        const response = await matchmakingApi.leave(token);

        if (response?.status === "left" || response?.status === "not_in_queue") {
          setIsSearching(false);
          setMessage("En attente d'un joueur...");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, isSearching, isLoading]);

  // Handler pour annuler
  const handleCancel = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await matchmakingApi.leave(token);
      setIsSearching(false);
      setMessage("En attente d'un joueur...");
    } finally {
      setIsLoading(false);
    }
  }, [token, isLoading]);

  // Handler pour reset (dev only)
  const handleReset = useCallback(async () => {
    setIsSearching(false);
    const response = await matchmakingApi.reset(token);
    console.log("Reset:", response);
  }, [token]);

  // Polling pour vérifier si un match est trouvé
  useEffect(() => {
    if (!isSearching) return;

    const intervalId = setInterval(async () => {
      const response = await matchmakingApi.checkMatch(token);

      if (!response) {
        console.warn("Erreur lors du check match");
        return;
      }

      if (response.status === "match_found" && response.game_id) {
        // Match trouvé !
        clearInterval(intervalId);
        setMessage("Joueur trouvé !");

        console.log("✅ Match trouvé:", response);

        // Petite pause pour afficher le message
        setTimeout(() => {
          navigate(`/game/${game_name}/${response.game_id}`);
        }, 500);
      }
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      console.log("🧹 Polling arrêté");
    };
  }, [token, isSearching,game_name, navigate]);

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="flex flex-row items-center gap-3">
      {/* Bouton Play / Searching */}
      <button
        onClick={handlePlayClick}
        disabled={isLoading}
        className={`
          flex items-center justify-center gap-3
          font-bold py-3 px-8 rounded-lg
          shadow-md transition-all duration-150
          cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          ${isSearching
            ? "bg-indigo-700 min-w-[220px]"
            : "bg-indigo-600 hover:bg-indigo-700 active:translate-y-0.5"
          }
          text-white
        `}
      >
        {isSearching ? (
          <>
            {/* Spinner */}
            <div
              className="
                h-6 w-6
                animate-spin
                rounded-full
                border-3
                border-white border-t-transparent
              "
            />
            <span className="text-sm">{message}</span>
          </>
        ) : (
          <span className="text-lg">Play</span>
        )}
      </button>

      {/* Bouton Annuler */}
      {isSearching && (
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="
            bg-red-500 hover:bg-red-600
            text-white font-bold py-3 px-6 rounded-lg
            shadow-md transition-all duration-150
            active:translate-y-0.5
            cursor-pointer disabled:opacity-50
          "
        >
          Annuler
        </button>
      )}

      {/* Bouton Reset (Dev) */}
      {import.meta.env.DEV && (
        <button
          onClick={handleReset}
          className="
            absolute right-5 top-5
            bg-gray-600 hover:bg-gray-700
            text-white text-sm py-2 px-4 rounded
            transition-colors
          "
        >
          Reset Queue
        </button>
      )}
    </div>
  );
}
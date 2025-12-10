// /frontend/src/components/matchmakingButton.tsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from 'lucide-react';

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
  token: string|null;
  game_name:string;
  isAuthenticated:boolean,
  setShowLoginModal:React.Dispatch<React.SetStateAction<boolean>>
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

export default function MatchmakingButton({ token,game_name,isAuthenticated,setShowLoginModal }: MatchmakingButtonProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("En attente d'un joueur...");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Handler pour rejoindre/quitter la file
  const handleSearchGame = useCallback(async () => {
    if (isLoading) return;

    if(!isAuthenticated || !token) {setShowLoginModal(true);return;}

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
  }, [token, isSearching, isLoading,isAuthenticated,setShowLoginModal]);

  // Handler pour annuler
  const handleCancel = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    if(!isAuthenticated || !token) {setShowLoginModal(true);return;}


    try {
      await matchmakingApi.leave(token);
      setIsSearching(false);
      setMessage("En attente d'un joueur...");
    } finally {
      setIsLoading(false);
    }
  }, [token, isLoading,isAuthenticated,setShowLoginModal]);


  // Polling pour vérifier si un match est trouvé
  useEffect(() => {
    if (!isSearching) return;
    if(!isAuthenticated || !token) {return;}


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
  }, [token, isSearching,game_name, navigate,isAuthenticated]);

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="flex flex-row items-center gap-3">
      {/* Bouton Play / Searching */}
      <button
          onClick={handleSearchGame}
          disabled={isLoading}
          className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-xl px-12 py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
      >
          <Search size={24} />
     
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
          <span className="text-sm"> Rechercher une partie </span>
        )}
      </button>

      {/* Bouton Annuler */}
      {isSearching && (
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="bg-red-400 text-gray-900 hover:bg-red-500 font-bold text-xl px-12 py-4 rounded-xl shadow-lg shadow-red-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
        >
          Annuler
        </button>
      )}
    </div>
  );
}
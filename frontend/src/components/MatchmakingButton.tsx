// /frontend/src/components/matchmakingButton.tsx

import { useMatchmaking } from "../Game/hooks/useMatchMaking";
import { type MatchMakingProps } from "../Game/hooks/useMatchMaking";
import { Search, Loader2 } from 'lucide-react';



// =============================================================================
// COMPONENT
// =============================================================================

export function MatchmakingLobby({ token,gameName,isAuthenticated,onAuthRequired }: MatchMakingProps) {

  const {
        isSearching,
        isLoading,
        startSearch,
        cancelSearch,
    } = useMatchmaking({
        token,
        gameName,
        isAuthenticated,
        onAuthRequired,
    });

  
  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="flex flex-row items-center w-fit gap-4">
      {/* Bouton Play / Searching */}
      <button
          onClick={startSearch}
          disabled={isLoading}
          className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-xl px-12 py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
      >
          <Search size={24} />
     
        {isSearching ? (
          <>
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">En attente d'un Joueur ...</span>
          </>
        ) : (
          <span className="text-sm"> {'Rechercher une partie'} </span>
        )}
      </button>
      {/* Bouton Annuler */}
      {isSearching && (
        <button
          onClick={cancelSearch}
          disabled={isLoading}
          className="bg-red-400 text-gray-900 hover:bg-red-500 font-bold text-xl px-12 py-4 rounded-xl shadow-lg shadow-red-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
        >
          Annuler
        </button>
      )}
    </div>
  );
}

export function MatchMakingOverlay({
    token,
    gameName,
    isAuthenticated,
    onAuthRequired,
}: MatchMakingProps) {
    const {
        isSearching,
        isLoading,
        startSearch,
        cancelSearch,
    } = useMatchmaking({
        token,
        gameName,
        isAuthenticated,
        onAuthRequired,
    });


    // État: Par défaut (pas de recherche)
    return (
      
        <button
            onClick={isSearching ? cancelSearch : startSearch}
            disabled={isLoading}
            className={`w-full py-3 ${isSearching ?  'bg-red-400 hover:bg-red-500' :  'bg-brand-yellow hover:bg-yellow-400' } text-gray-900 font-bold rounded-lg  transition flex items-center justify-center gap-2 disabled:opacity-50`}
        >
            {isLoading || isSearching ? (
                <Loader2 size={20} className="animate-spin" />
            ) : (
                <Search size={20} />
                
            )}
            {
              isSearching ? 
          
              <div >
                Annuler
              </div>
                :
               <>
                Rejouer
              </>
            }
      
        </button>
    );
}
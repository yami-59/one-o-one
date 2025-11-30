// /frontend/src/api/auth.js (ou un fichier de service)

// ⚠️ Assurez-vous d'avoir défini ces constantes :
// Dans le hook ou le composant de connexion :
const REST_API_URL = import.meta.env.VITE_API_BASE_URL;
export const TOKEN_KEY = "player_access_token";
export const PLAYER_ID_KEY = "player_identifier";


/**
 * Appelle l'API pour créer un utilisateur invité, générer un JWT, 
 * et stocker le token et l'ID dans le localStorage.
 * * @returns {Promise<{token: string, playerId: string}>} Le jeton et l'identifiant du joueur.
 */
export async function fetchGuestToken() {
    try {
        const response = await fetch(`${REST_API_URL}/guest/login`, {
            method: 'POST',
            headers: {
                // Le backend n'attend pas de corps, mais Content-Type est une bonne pratique
                'Content-Type': 'application/json',
            },
            // Pas de corps JSON nécessaire, car l'identifiant est généré côté serveur
        });

        if (!response.ok) {
            // Gérer les erreurs HTTP (comme le 500 si la DB échoue)
            const errorDetails = await response.json();
            throw new Error(`Échec de la connexion invité: ${errorDetails.detail || response.status}`);
        }

        const data = await response.json();
        
        // 1. Récupération des données du backend (TokenResponse)
        const token = data.access_token;
        const playerId = data.player_identifier;
        
        // 2. Persistance : Stocker le token et l'ID pour les futures requêtes
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(PLAYER_ID_KEY, playerId);
        
        console.log("✅ Connexion Invité réussie. Token stocké.");

        return { token, playerId };

    } catch (error) {
        console.error("Erreur critique lors du login invité:", error);
        // Vous pouvez relancer l'erreur pour que le composant React la gère
        throw error;
    }
}
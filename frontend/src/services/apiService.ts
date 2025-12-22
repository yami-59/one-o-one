import axios from 'axios';

/**
 * Configuration de l'instance Axios pour l'application.
 * Ce service gère les appels vers les statistiques, le classement
 * et les données en temps réel.
 */

// Récupération de l'URL de base depuis les variables d'environnement
// Fallback sur localhost si la variable n'est pas définie
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiService = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * INTERCEPTEUR DE REQUÊTE
 * Avant chaque appel au serveur, on injecte le jeton d'authentification.
 * On utilise la clé 'access_token' pour correspondre à votre AuthProvider.
 */
apiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        
        if (token) {
            // Ajout du header Authorization standard (Bearer Token)
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * INTERCEPTEUR DE RÉPONSE
 * Gère les erreurs globales comme l'expiration du token.
 */
apiService.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si le serveur renvoie 401, le token est probablement expiré ou invalide
        if (error.response && error.response.status === 401) {
            console.warn("Session expirée ou non autorisée. Redirection possible vers la connexion.");
            // On peut optionnellement nettoyer le localStorage ici
            // localStorage.removeItem('access_token');
            // localStorage.removeItem('user_json');
        }
        return Promise.reject(error);
    }
);

export default apiService;
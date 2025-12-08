// /frontend/src/context/AuthContext.tsx
import {  useState, useEffect } from 'react';
// 🎯 Importez vos fonctions de service (à implémenter ou à simuler)
import {type AuthProviderProps,type AuthContextValue,AuthContext, type AuthData} from './AuthContext'
import Loading from '../pages/Loading';
// /frontend/src/api/auth.js (ou un fichier de service)

// ⚠️ Assurez-vous d'avoir défini ces constantes :
// Dans le hook ou le composant de connexion :
const API_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY='access_token'
const USER_INFO_KEY='user_json'



async function fetchAuth(endpoint: string, access_token?: string) {
    try {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Ajouter Authorization uniquement s'il existe
        if (access_token) {
            headers.Authorization = `Bearer ${access_token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: "POST",
            headers,
            body: JSON.stringify({}), // évite les 415 Unsupported Media Type
        });

        if (!response.ok) {
            let message = `Erreur HTTP ${response.status}`;
            try {
                const err = await response.json();
                
                if (typeof err.detail === "string") {
                    message = err.detail;
                } else if (Array.isArray(err.detail) && err.detail[0]?.msg) {
                    message = err.detail[0].msg;
                }
            } catch (error) {console.log(error)}

            throw new Error(message);
        }

        const data: AuthData = await response.json();

        // Stockage correct sans double stringify
        const token = data.access_token;
        const userInfo =JSON.stringify(data.user_info);

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_INFO_KEY, userInfo);

        console.log("✅ Token refresh.");

        return { token, userInfo };

    } catch (error) {
        console.error("❌ fetchAuth error:", error);
        throw error;
    }
}


export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    
    // Initialisation de l'état en lisant le localStorage
    const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
    const [userInfo, setUserInfo] = useState<string | null >(localStorage.getItem(USER_INFO_KEY));
    const [isLoading, setIsLoading] = useState(true);

    // --- Logique de Démarrage Asynchrone (Fetch Token si Manquant) ---
    useEffect(() => {
        
        // 🚨 Ne pas charger si le token JWT est déjà présent
        if (token) {
            setIsLoading(false);
            fetchAuth("/refresh",token).then((data)=>{
                setToken(data.token)
                setUserInfo(data.userInfo)
            }).catch((error)=>{

                console.error("Echec du rafraichissement du token",error)
            })
            return;
        }

        // Si le token est null, tenter de se connecter en tant qu'Invité
        fetchAuth("/guest/login")
            .then((data) => {
                // Si la création réussit, stocker les nouvelles valeurs
                setToken(data.token)
                setUserInfo(data.userInfo)
            })
            .catch((error) => {
                // Gérer les erreurs (ex: connexion API perdue)
                console.error("Échec de la connexion invité:", error);
                // On laisse token et playerId à null
            })
            .finally(() => {
                // Toujours passer isLoading à false à la fin, pour débloquer le rendu
                setIsLoading(false);
            });
    }, [token]); // Dépendance sur 'token': Ne s'exécute que si token est null au montage

    // --- Définition des Valeurs Exposées ---
    const value: AuthContextValue = {
        token,
        userInfo,
        isLoading,
        isAuthenticated: !!token // True si token n'est pas null/vide
    };

    // 4. Rendu
    // Afficher un écran de chargement tant que l'état n'est pas déterminé
    if (isLoading) {
        return <Loading/>;
    }
    // Le Provider enveloppe les enfants et transmet l'état
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
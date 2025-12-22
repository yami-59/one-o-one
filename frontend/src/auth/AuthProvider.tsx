// /frontend/src/auth/AuthProvider.tsx

import { useState, useEffect, useCallback } from 'react';
import {
    type AuthProviderProps,
    type AuthContextValue,
    AuthContext,
    type AuthData,
    type UserProps,
} from './AuthContext';
import Loader from '../components/Loader';

// =============================================================================
// CONSTANTS
// =============================================================================

const API_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'access_token';

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function fetchAuth(endpoint: string, access_token?: string) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (access_token) {
        headers.Authorization = `Bearer ${access_token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
    });

    if (!response.ok) {
        let message = `Erreur HTTP ${response.status}`;
        try {
            const err = await response.json();
            if (typeof err.detail === 'string') {
                message = err.detail;
            } else if (Array.isArray(err.detail) && err.detail[0]?.msg) {
                message = err.detail[0].msg;
            }
        } catch {
            // Ignore JSON parse errors
        }
        throw new Error(message);
    }

    const data: AuthData = await response.json();


    return {
        token: data.access_token,
        userInfo: data.user_info,
    };
}



// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────

    const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
    const [userInfo,setUserInfo] = useState<UserProps|null>(null)

    const [isLoading, setIsLoading] = useState(true);

    // ─────────────────────────────────────────────────────────────────────────
    // CALLBACKS
    // ─────────────────────────────────────────────────────────────────────────

    const saveToken = useCallback((newToken: string) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        setToken(newToken);
    }, []);

    const clearToken = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // AUTH METHODS
    // ─────────────────────────────────────────────────────────────────────────

    const loginAsGuest = useCallback(async () => {
        try {
            const data = await fetchAuth('/guest/login');
            saveToken(data.token);
            setUserInfo(data.userInfo)
            console.log('✅ Connexion invité réussie');
        } catch (error) {
            console.error('❌ Échec de la connexion invité:', error);
            throw error;
        }
    }, [saveToken]);

    const logout = useCallback(() => {
        clearToken();
        console.log('✅ Déconnexion réussie');
    }, [clearToken]);

    const refreshToken = useCallback(async (currentToken: string) => {
        try {
            const data = await fetchAuth('/refresh', currentToken);
            saveToken(data.token);
            setUserInfo(data.userInfo)
            console.log('✅ Token rafraîchi');
        } catch (error) {
            console.error('❌ Échec du rafraîchissement du token:', error);
            // Token invalide → déconnecter l'utilisateur
            clearToken();
        }
    }, [saveToken, clearToken]);

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECT: Initial load & token refresh
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem(TOKEN_KEY);

            if (storedToken) {
                // Token existe → tenter de le rafraîchir
                await refreshToken(storedToken);
            }
            // Pas de token → l'utilisateur devra se connecter manuellement

            setIsLoading(false);
        };

        initAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ✅ Exécuté UNE SEULE fois au montage

    // ─────────────────────────────────────────────────────────────────────────
    // CONTEXT VALUE
    // ─────────────────────────────────────────────────────────────────────────

    const value: AuthContextValue = {
        token,
        userInfo,
        isLoading,
        isAuthenticated: !!token && !!userInfo,
        loginAsGuest,
        logout,
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    if (isLoading) {
        return <Loader variant='spinner'  size='lg' fullscreen></Loader>;
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
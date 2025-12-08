// /frontend/src/context/AuthContext.tsx
import { createContext, useContext, type ReactNode } from 'react';


// --- Interfaces de l'État ---

// Type pour les données que le backend envoie initialement
// --- Interface User ---
export interface User {
  user_id: string;        // identifiant unique (clé primaire)
  username: string;       // nom d'utilisateur unique
  mail?: string;          // email optionnel, mais unique si présent
  victories: number;      // nombre de victoires
  defeats: number;        // nombre de défaites
  created_at: string;     // date ISO (UTC) de création
}


export interface UserStats {
    victories:number,
    defeats:number
}


export interface AuthData {
    access_token: string;
    token_type: string ;
    user_info: User;
}



// Type des valeurs exposées par le contexte
export interface AuthContextValue {
    token: string | null;
    userInfo: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    // Note: Vous ajouteriez ici une fonction logout ou refreshToken
}

// --- Création du Contexte ---
// Valeur par défaut pour initialisation (utilise des valeurs nulles/falsy)
const initialContextValue: AuthContextValue = {
    token: null,
    userInfo: null,
    isLoading: true,
    isAuthenticated: false,
};

export const AuthContext = createContext<AuthContextValue>(initialContextValue);


// /frontend/src/context/AuthContext.tsx (suite)

export const useAuth = () => {
    // 🎯 Fournit un accès rapide et typé à la session
    return useContext(AuthContext); 
};


export interface AuthProviderProps {
    children: ReactNode;
}

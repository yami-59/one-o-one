// /frontend/src/context/AuthContext.tsx
import { createContext, useContext, type ReactNode } from 'react';


// --- Interfaces de l'État ---

// Type pour les données que le backend envoie initialement
// --- Interface User ---
export interface UserProps {
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
    user_info: UserProps;
}

// ✅ new：login / register need payload
export interface LoginPayload {
  mail: string;
  password: string;
}
export interface RegisterPayload {
  username: string;
  mail: string;
  password: string;
}



// Type des valeurs exposées par le contexte
export interface AuthContextValue {
    token: string | null;
    userInfo: UserProps | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    loginAsGuest:() => Promise<void>

    // ✅ new
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;

    logout:() => void
    // Note: Vous ajouteriez ici une fonction logout ou refreshToken
}

// --- Création du Contexte ---
// Valeur par défaut pour initialisation (utilise des valeurs nulles/falsy)
const initialContextValue: AuthContextValue = {
    token: null,
    userInfo: null,
    isLoading: true,
    isAuthenticated: false,
    loginAsGuest:(): Promise<void> => Promise.resolve(),

    // ✅ new
    login: async () => {},
    register: async () => {},

    logout :()=>{}

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

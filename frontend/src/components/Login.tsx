// /frontend/src/components/Login.tsx

import { useState } from 'react';
import { X, User, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

// =============================================================================
// TYPES
// =============================================================================

interface LoginProps {
    /** Callback appelé après une connexion réussie */
    onSuccess?: () => void;
    /** Callback pour fermer le modal */
    onClose?: () => void;
    /** Si true, affiche le bouton de fermeture (mode modal) */
    isModal?: boolean;
}


async function login(email:string,password:string){console.log(email,password)}

// =============================================================================
// COMPONENT
// =============================================================================

export default function Login({ onSuccess, onClose, isModal = false }: LoginProps) {
    const { loginAsGuest} = useAuth();



    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────

    const [mode, setMode] = useState<'choice' | 'login' | 'register'>('choice');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleGuestLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            await loginAsGuest();
            onSuccess?.();
        } catch (err) {
            setError('Erreur lors de la connexion. Réessayez.');
            console.log(err)
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login(email, password);
            onSuccess?.();
        } catch (err) {
            setError('Email ou mot de passe incorrect.');
            console.log(err)

        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Implémenter register
            // await register(email, password, username);
            onSuccess?.();
        } catch (err) {
            setError("Erreur lors de l'inscription.");
            console.log(err)

        } finally {
            setIsLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                    {mode === 'choice' && 'Connexion'}
                    {mode === 'login' && 'Se connecter'}
                    {mode === 'register' && "S'inscrire"}
                </h2>

                {isModal && onClose && (
                    <div
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-700"
                    >
                        <X size={24} />
                    </div>
                )}
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────────
                Mode: Choice (Choix initial)
            ───────────────────────────────────────────────────────────────── */}
            {mode === 'choice' && (
                <div className="space-y-4">
                    {/* Connexion invité */}
                    <button
                        onClick={handleGuestLogin}
                        disabled={isLoading}
                        className="w-full bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <User size={20} />
                        )}
                        Jouer en tant qu'invité
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-800 text-gray-400">ou</span>
                        </div>
                    </div>

                    {/* Bouton connexion avec compte */}
                    <button
                        disabled
                        onClick={() => setMode('login')}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <Mail size={20} />
                        Se connecter avec un compte
                    </button>

                    {/* Lien inscription */}
                    <p className="text-center text-gray-400 text-sm">
                        Pas de compte ?{' '}
                        <button
                            onClick={() => setMode('register')}
                            className="text-brand-pink hover:underline font-medium"
                        >
                            S'inscrire
                        </button>
                    </p>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────────
                Mode: Login (Formulaire de connexion)
            ───────────────────────────────────────────────────────────────── */}
            {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-brand-pink hover:bg-brand-pink/80 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            'Se connecter'
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('choice')}
                        className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        ← Retour
                    </button>
                </form>
            )}

            {/* ─────────────────────────────────────────────────────────────────
                Mode: Register (Formulaire d'inscription)
            ───────────────────────────────────────────────────────────────── */}
            {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Nom d'utilisateur
                        </label>
                        <div className="relative">
                            <User
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="MonPseudo"
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-brand-pink transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        disabled
                        type="submit"
                        // disabled={isLoading}
                        className="w-full bg-brand-pink hover:bg-brand-pink/80 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            "S'inscrire"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setMode('choice')}
                        className="w-full text-gray-400 hover:text-white text-sm transition-colors"
                    >
                        ← Retour
                    </button>
                </form>
            )}
        </div>
    );
}
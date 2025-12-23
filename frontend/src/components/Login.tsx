// /frontend/src/components/Login.tsx

import { useState } from 'react';
import { X, User, Mail, Lock, Loader2, Sparkles, UserPlus, LogIn } from 'lucide-react';
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


// async function login(email: string, password: string) {
//     console.log(email, password);
// }

// =============================================================================
// COMPONENT
// =============================================================================

export default function Login({ onSuccess, onClose, isModal = false }: LoginProps) {
    // const { loginAsGuest } = useAuth();
    const { loginAsGuest, login, register } = useAuth();

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

    const [showPassword, setShowPassword] = useState(false);

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
            console.log(err);
        } finally {
            setIsLoading(false);
        }
    };

    // const handleLogin = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsLoading(true);
    //     setError(null);

    //     try {
    //         await login(email, password);
    //         onSuccess?.();
    //     } catch (err) {
    //         setError('Email ou mot de passe incorrect.');
    //         console.log(err);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    // const handleRegister = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setIsLoading(true);
    //     setError(null);

    //     try {
    //         // TODO: Implémenter register
    //         // await register(email, password, username);
    //         onSuccess?.();
    //     } catch (err) {
    //         setError("Erreur lors de l'inscription.");
    //         console.log(err);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

        const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await login({ mail: email, password });   // ✅ use context login
            onSuccess?.();
        } catch (err) {
            setError('Email ou mot de passe incorrect.');
            console.log(err);
        } finally {
            setIsLoading(false);
        }
        };

    

        const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const u = username.trim();
        const m = email.trim();

        // ✅ 前端先擋：username >= 3（避免一直打後端 422）
        if (u.length < 3) {
            setError("Le nom d'utilisateur doit contenir au moins 3 caractères.");
            return;
        }

        // ✅ email 格式（type="email" 通常已擋，但這裡再保險一次）
        const emailOk = /^\S+@\S+\.\S+$/.test(m);
        if (!emailOk) {
            setError("Veuillez saisir une adresse email valide.");
            return;
        }

        setIsLoading(true);

        try {
            await register({ username: u, mail: m, password });
            onSuccess?.();
        } catch (err: any) {
            // 1) 先把後端回傳的 detail 轉成文字
            const detail = err?.detail;
            let text = (err?.message ?? '').toString();

            if (typeof detail === 'string') {
            text = detail;
            } else if (Array.isArray(detail)) {
            // FastAPI/Pydantic validation errors
            const msgs = detail.map((x) => x?.msg).filter(Boolean);
            if (msgs.length) text = msgs.join(' | ');
            }

            const lower = text.toLowerCase();

            // 2) 映射成你要顯示的法文提示
            if (lower.includes('email already registered') || lower.includes('email already exists')) {
            setError("Cet email est déjà utilisé.");
            } else if (lower.includes('username already') || lower.includes('user already exists') || lower.includes('unique constraint')) {
            setError("Ce nom d'utilisateur est déjà utilisé.");
            } else if (lower.includes('at least 3') || lower.includes('string_too_short') || lower.includes('min_length')) {
            setError("Le nom d'utilisateur doit contenir au moins 3 caractères.");
            } else if (lower.includes('valid email') || lower.includes('value is not a valid email')) {
            setError("Veuillez saisir une adresse email valide.");
            } else {
            setError(text || "Erreur lors de l'inscription.");
            }

            console.log('REGISTER ERROR:', err);
        } finally {
            setIsLoading(false);
        }
        };




    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const renderHeader = () => {
        const titles = {
            choice: 'Bienvenue !',
            login: 'Connexion',
            register: 'Inscription',
        };

        const subtitles = {
            choice: 'Rejoins la compétition',
            login: 'Content de te revoir',
            register: 'Créer ton compte',
        };

        return (
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-pink-600 rounded-full blur-2xl opacity-40 animate-pulse" />
                        {/* Icon */}
                        <div className="relative w-20 h-20 bg-linear-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                    </div>
                </div>
                <h2 className="text-3xl font-black bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {titles[mode]}
                </h2>
                <p className="text-gray-400 text-sm">{subtitles[mode]}</p>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md">
            {/* Close button */}
            {isModal && onClose && (
                <div
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10"
                >
                    <X size={24} />
                </div>
            )}

            {/* Header */}
            {renderHeader()}

            {/* Error message */}
            {error && (
                <div className="mb-6 backdrop-blur-xl bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl shadow-lg shadow-red-500/20 animate-shake">
                    <p className="text-sm font-medium">{error}</p>
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
                        className="group w-full bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <Loader2 size={22} className="animate-spin" />
                        ) : (
                            <>
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <span>Jouer en tant qu'invité</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 backdrop-blur-xl bg-white/5 text-gray-400 text-sm font-medium rounded-full border border-white/10">
                                ou
                            </span>
                        </div>
                    </div>

                    {/* Bouton connexion avec compte */}
                    <button
                        disabled={isLoading}
                        onClick={() => setMode('login')}
                        className="group w-full backdrop-blur-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                            <Mail size={18} />
                        </div>
                        <span>Se connecter avec un compte</span>
                    </button>

                    {/* Lien inscription */}
                    <div className="pt-4 text-center">
                        <p className="text-gray-400 text-sm">
                            Pas encore de compte ?{' '}
                            <button
                                onClick={() => setMode('register')}
                                className="text-pink-400 hover:text-pink-300 font-bold transition-colors hover:underline"
                            >
                                S'inscrire gratuitement
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────────
                Mode: Login (Formulaire de connexion)
            ───────────────────────────────────────────────────────────────── */}
            {mode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-white text-sm font-bold mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Mail size={18} className="text-white" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                className="w-full backdrop-blur-xl bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl py-4 pl-16 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                    <label className="block text-white text-sm font-bold mb-2">
                        Mot de passe
                    </label>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Lock size={18} className="text-white" />
                        </div>

                        <input
                        type={showPassword ? 'text' : 'password'}   // ✅ 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl py-4 pl-16 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />

                        {/* 👁  */}
                        <button
                        type="button"                               // ✅
                        onClick={() => setShowPassword((v) => !v)}  // ✅ 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                        {showPassword ? '🙈' : '👁'}
                        </button>
                    </div>
                    </div>


                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <Loader2 size={22} className="animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Se connecter</span>
                            </>
                        )}
                    </button>

                    {/* Back button */}
                    <button
                        type="button"
                        onClick={() => setMode('choice')}
                        className="w-full text-gray-400 hover:text-white text-sm font-medium transition-colors py-2"
                    >
                        ← Retour aux options
                    </button>
                </form>
            )}

            {/* ─────────────────────────────────────────────────────────────────
                Mode: Register (Formulaire d'inscription)
            ───────────────────────────────────────────────────────────────── */}
            {mode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Username */}
                    <div>
                        <label className="block text-white text-sm font-bold mb-2">
                            Nom d'utilisateur
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-linear-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/30">
                                <User size={18} className="text-white" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="MonPseudo"
                                required
                                minLength={3} // ✅ new：min plus 3 
                                className="w-full backdrop-blur-xl bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl py-4 pl-16 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-white text-sm font-bold mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-linear-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Mail size={18} className="text-white" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="votre@email.com"
                                required
                                className="w-full backdrop-blur-xl bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl py-4 pl-16 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                    <label className="block text-white text-sm font-bold mb-2">
                        Mot de passe
                    </label>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-linear-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Lock size={18} className="text-white" />
                        </div>

                        <input
                        type={showPassword ? 'text' : 'password'}   // ✅ 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full backdrop-blur-xl bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-xl py-4 pl-16 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                        />

                        {/* 👁  */}
                        <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                        {showPassword ? '🙈' : '👁'}
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 mt-2">
                        Minimum 6 caractères
                    </p>
                    </div>


                    {/* Submit button */}
                    <button
                        type="submit"
                        className="w-full bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isLoading ? (
                            <Loader2 size={22} className="animate-spin" />
                        ) : (
                            <>
                                <UserPlus size={20} />
                                <span>Créer mon compte</span>
                            </>
                        )}
                    </button>

                    {/* Back button */}
                    <button
                        type="button"
                        onClick={() => setMode('choice')}
                        className="w-full text-gray-400 hover:text-white text-sm font-medium transition-colors py-2"
                    >
                        ← Retour aux options
                    </button>
                </form>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}

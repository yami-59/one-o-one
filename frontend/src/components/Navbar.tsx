// /frontend/src/components/Navbar.tsx

import { LogOut, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Titles from './Titles';
import { type AuthContextValue } from '../auth/AuthContext';


// =============================================================================
// TYPES
// =============================================================================
export interface NavbarProps extends AuthContextValue {
    setShowLoginModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

// =============================================================================
// COMPONENT
// =============================================================================
export default function Navbar({ setShowLoginModal, logout, isAuthenticated, userInfo }: NavbarProps) {
    const navigate = useNavigate();

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleLogout = () => {
        if (logout) logout();
        navigate('/');
    };

    const handleLogin = () => {
        if (setShowLoginModal) {
            setShowLoginModal(true);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <nav className="relative backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-lg shadow-black/20">
            <div className="max-w-screen mx-auto px-4 py-3 flex items-center justify-between">
                {/* ─────────────────────────────────────────────────────────────
                    Gauche : Vide (pour équilibrer)
                ───────────────────────────────────────────────────────────── */}
                <div className="flex-1">
                    {/* Espace réservé pour équilibrer le layout */}
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    Centre : Title
                ───────────────────────────────────────────────────────────── */}
                <div className="flex-1 flex justify-center">
                    <Titles  num={1}/>
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    Droite : Boutons utilisateur
                ───────────────────────────────────────────────────────────── */}
                <div className="flex-1 flex items-center justify-end gap-3">
                    {isAuthenticated && userInfo ? (
                        <>
                            {/* Bouton Admin (si admin) */}
                            {userInfo && userInfo.username === 'admin' && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="group flex items-center gap-2 bg-linear-to-r from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30 border border-yellow-500/30 hover:border-yellow-500/50 text-yellow-400 px-4 py-2 rounded-xl transition-all shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-105"
                                    title="Accéder au panneau d'administration"
                                >
                                    <Shield size={16} className="group-hover:rotate-12 transition-transform" />
                                    <span className="font-bold hidden sm:inline">Admin</span>
                                </button>
                            )}

                            {/* Nom d'utilisateur */}
                            <div className="flex items-center gap-2.5 backdrop-blur-xl bg-white/5 border border-white/10 px-4 py-2 rounded-xl shadow-lg">
                                <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
                                    <User size={16} className="text-white" />
                                </div>
                                <span className="font-bold text-white hidden sm:inline">
                                    {userInfo.username.startsWith('guest-') ? 'Guest' : userInfo.username}
                                </span>
                            </div>

                            {/* Bouton déconnexion */}
                            <button
                                onClick={handleLogout}
                                className="group flex items-center gap-2 backdrop-blur-xl bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-300 hover:text-red-400 px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-red-500/20"
                                title="Se déconnecter"
                            >
                                <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                <span className="hidden sm:inline font-medium">Déconnexion</span>
                            </button>
                        </>
                    ) : (
                        /* Bouton connexion (si non connecté) */
                        <button
                            onClick={handleLogin}
                            className="group flex items-center gap-2.5 bg-linear-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
                        >
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                <User size={14} />
                            </div>
                            <span>Connexion</span>
                        </button>
                    )}
                </div>
            </div>

            {/* gradient line at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-purple-500/50 to-transparent" />
        </nav>
    );
}

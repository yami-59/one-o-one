// /frontend/src/components/Navbar.tsx

import { LogOut, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../auth/AuthContext';
import Title from './Title';

// =============================================================================
// COMPONENT
// =============================================================================

export default function Navbar({setShowLoginModal} : {setShowLoginModal?: React.Dispatch<React.SetStateAction<boolean>> }) {
    const navigate = useNavigate();
    // const { isAuthenticated, userInfo, logout } = useAuth();

    const isAuthenticated = false
    const userInfo = {role : "caca" ,username:"samy"}
    const logout =()=>{}
    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleLogout = () => {
        logout();
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
        <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3">
            <div className="max-w-screen mx-auto flex items-center justify-between ">
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
                    <Title />
                </div>


                {/* ─────────────────────────────────────────────────────────────
                    Droite : Boutons utilisateur
                ───────────────────────────────────────────────────────────── */}
                <div className="flex-1 flex items-center justify-end space-x-4">
                    {isAuthenticated && userInfo ? (
                        <>
                            {/* Bouton Admin (si admin) */}
                            {userInfo.role === 'admin' && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="flex items-center gap-1 text-xs bg-brand-yellow/10 text-brand-yellow px-3 py-2 rounded-full hover:bg-brand-yellow/20 transition-colors"
                                    title="Accéder au panneau d'administration"
                                >
                                    <Shield size={14} />
                                    <span className="font-bold hidden sm:inline">Admin</span>
                                </button>
                            )}

                            {/* Nom d'utilisateur */}
                            <div className="flex items-center gap-2 text-gray-300">
                                <User size={16} className="text-gray-500" />
                                <span className="font-medium hidden sm:inline">
                                    {userInfo.username}
                                </span>
                            </div>

                            {/* Bouton déconnexion */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-700"
                                title="Se déconnecter"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline text-sm">Déconnexion</span>
                            </button>
                        </>
                    ) : (
                        /* Bouton connexion (si non connecté) */
                        <button
                            onClick={handleLogin}
                            className="flex items-center gap-2 bg-brand-pink hover:bg-brand-pink/80 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            <User size={18} />
                            <span>Connexion</span>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
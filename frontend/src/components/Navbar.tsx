import { LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
      {/* Logo cliquable pour revenir au Lobby */}
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/lobby')}>
        <div className="font-bold text-xl tracking-tighter select-none">
          <span className="text-brand-pink">1</span>o<span className="text-brand-blue">1</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* BOUTON ADMIN : Ici j'ai remplacé le <span> par un <button> avec onClick */}
        {user.role === 'admin' && (
          <button 
            onClick={() => navigate('/admin')} 
            className="flex items-center gap-1 text-xs bg-brand-yellow/10 text-brand-yellow px-3 py-2 rounded-full hover:bg-brand-yellow/20 transition-colors cursor-pointer"
            title="Accéder au panneau d'administration"
          >
            <Shield size={14} /> 
            <span className="font-bold">Admin</span>
          </button>
        )}

        <span className="font-medium text-white">{user.username}</span>
        
        <button 
          onClick={handleLogout} 
          className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          title="Se déconnecter"
        >
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
}
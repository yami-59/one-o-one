import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Title from '../components/title'; 
import { authService } from '../services/authService';

export default function LoginPage() {
  const [pseudo, setPseudo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pseudo.trim()) return;

    setLoading(true);
    await authService.login(pseudo);
    setLoading(false);
    navigate('/lobby');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800/50 backdrop-blur-lg border border-gray-700 p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-center mb-8">
          <Title />
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Pseudo</label>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-pink outline-none transition"
              placeholder="Votre nom de joueur..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-pink hover:bg-pink-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Entrer dans l\'arène'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-700">
            <button className="w-full bg-white text-gray-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                {/* Icône Google simplifiée */}
                <span className="font-bold text-lg">G</span> Se connecter avec Google
            </button>
        </div>
      </div>
    </div>
  );
}
import { Search, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function LobbyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Section Gauche : Trouver une partie */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Prêt à combattre ?</h2>
            <p className="text-gray-400 mb-8">Trouve un adversaire pour un duel de mots mêlés en 3 minutes.</p>
            
            <button 
              onClick={() => navigate('/game/demo123')}
              className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold text-xl px-12 py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
            >
              <Search size={24} />
              Rechercher une partie
            </button>
          </div>

          <h3 className="text-xl font-bold text-gray-300 mt-8 mb-4 flex items-center gap-2">
            <Users size={20}/> Jeux disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Cartes de jeu */}
             {['Mots Mêlés - Rapide', 'Mots Mêlés - Expert'].map((game, i) => (
                <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:border-brand-pink/50 transition cursor-pointer group" onClick={() => navigate('/game/1')}>
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-brand-blue/10 text-brand-blue text-xs font-bold px-2 py-1 rounded">1v1</span>
                        <span className="text-gray-500 text-xs">En ligne: 124</span>
                    </div>
                    <h4 className="font-bold text-white text-lg group-hover:text-brand-pink transition-colors">{game}</h4>
                </div>
             ))}
          </div>
        </div>

        {/* Section Droite : Classement */}
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-brand-yellow" />
            <h2 className="text-xl font-bold">Top Joueurs</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { name: "AlphaWolf", score: 2400 },
              { name: "Yami.59", score: 2150 },
              { name: "WordMaster", score: 1980 },
              { name: "Pixel", score: 1800 },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold w-6 ${i===0 ? 'text-brand-yellow': 'text-gray-500'}`}>#{i+1}</span>
                  <span className="font-medium text-gray-200">{p.name}</span>
                </div>
                <span className="text-brand-pink font-bold">{p.score}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
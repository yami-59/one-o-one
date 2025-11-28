import { ArrowLeft, Ban, ListMusic, Trash2, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function AdminPage() {
  const navigate = useNavigate();

  // Données factices pour la démo
  const users = [
    { id: 1, name: 'Yami.59', email: 'yami@test.com', role: 'user' },
    { id: 2, name: 'TrollUser', email: 'troll@bad.com', role: 'user' },
    { id: 3, name: 'Admin', email: 'admin@1o1.com', role: 'admin' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      <main className="max-w-6xl mx-auto p-6">
        <button 
          onClick={() => navigate('/lobby')}
          className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2"/> Retour au Lobby
        </button>

        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <UserCog className="text-brand-yellow" size={32} />
          Panneau d'Administration
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Carte Gestion Utilisateurs */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserCog size={20} className="text-brand-blue"/> Utilisateurs ({users.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs uppercase bg-gray-700/50 text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Pseudo</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-white">{u.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-gray-600/30 text-gray-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <button className="p-1 hover:text-red-400" title="Bannir"><Ban size={16}/></button>
                        <button className="p-1 hover:text-red-400" title="Supprimer"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Carte Gestion du Jeu */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ListMusic size={20} className="text-brand-pink"/> Contenu du Jeu
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white">Dictionnaire FR</h3>
                  <p className="text-xs text-gray-400">145,000 mots</p>
                </div>
                <button className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-white transition">Mettre à jour</button>
              </div>
              
              <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-white">Grilles Quotidiennes</h3>
                  <p className="text-xs text-gray-400">Générées il y a 2h</p>
                </div>
                <button className="text-sm bg-brand-pink hover:bg-pink-600 px-3 py-2 rounded text-white transition">Régénérer</button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
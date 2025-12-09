import { Send, Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameGrid from '../components/GameGrid';
import Navbar from '../components/Navbar';
import Scoreboard from '../components/Scoreboard';

// Simulation de sons (API Audio du navigateur)
const playSound = (type: 'pop' | 'success' | 'win') => {
  const audio = new Audio(`/sounds/${type}.mp3`);
  audio.play().catch(e => console.log("Audio play failed", e));
  console.log(`🔊 Son joué : ${type}`);
};

export default function GamePage() {
  const navigate = useNavigate();
  
  // État du jeu
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameOver, setGameOver] = useState(false);
  const [activeTab, setActiveTab] = useState<'words' | 'chat'>('words');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Grille (Statique pour la démo)
  const grid = [
    ['P','O','N','S','D','I','S','C','O','M'],
    ['O','R','C','E','U','P','H','C','D','K'],
    ['D','G','A','R','T','S','R','C','H','Z'],
    ['Z','E','F','F','A','I','P','O','J','E'],
    ['O','N','E','I','A','X','O','E','C','R'],
    ['L','I','T','F','L','T','I','E','N','E'],
    ['I','A','S','P','E','C','B','L','D','D'],
    ['S','N','O','N','E','V','B','U','S','I'],
    ['E','Y','A','R','D','S','C','O','S','L'],
    ['R','C','T','I','A','T','I','M','I','A'],
  ];
  
  // Gestion du Timer
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      if (soundEnabled) playSound('win');
    }
  }, [timeLeft, gameOver, soundEnabled]);

  // Formatage du temps
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulation interaction grille
  const handleGridClick = () => {
    if (soundEnabled) playSound('pop');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      
      {/* Overlay de Fin de Partie (Victoire/Défaite) */}
      {gameOver && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-800 border-2 border-brand-yellow rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-bounce-in">
            <h2 className="text-4xl font-black text-white mb-2">TEMPS ÉCOULÉ !</h2>
            <p className="text-xl text-gray-300 mb-6">Quel match incroyable.</p>
            
            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className="text-brand-pink font-bold">Toi</p>
                <p className="text-4xl font-bold text-white">120</p>
              </div>
              <div className="text-center">
                <p className="text-brand-blue font-bold">Adversaire</p>
                <p className="text-4xl font-bold text-white">80</p>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full py-3 bg-brand-yellow text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition"
              >
                Revanche immédiate
              </button>
              <button 
                onClick={() => navigate('/lobby')} 
                className="w-full py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition"
              >
                Retour au Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="grow p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Zone de Jeu */}
        <div className="lg:col-span-2 flex flex-col" onClick={handleGridClick}>
          <div className="flex justify-between items-center mb-4">
            <Scoreboard 
              p1Name="Moi (Yami)" p1Score={120}
              p2Name="Adversaire" p2Score={80}
              timer={formatTime(timeLeft)}
            />
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="ml-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition"
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </button>
          </div>
          
          <div className="grow">
            {/* On passe des props fictives pour l'instant */}
            <GameGrid grid={grid} selection={Array(10).fill(Array(10).fill(0))} />
          </div>
        </div>

        {/* Panneau Latéral */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden flex flex-col h-[500px] lg:h-auto">
          <div className="flex border-b border-gray-700">
            <button 
              onClick={() => setActiveTab('words')}
              className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider ${activeTab === 'words' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Mots (4/12)
            </button>
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 font-bold text-sm uppercase tracking-wider ${activeTab === 'chat' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Chat
            </button>
          </div>

          <div className="grow p-4 overflow-y-auto bg-gray-900/50">
            {activeTab === 'words' ? (
              <div className="space-y-2">
                {['REACT', 'VITE', 'TAILWIND', 'TYPESCRIPT', 'SOCKET'].map((w, i) => (
                  <div key={i} className={`p-2 rounded flex justify-between items-center ${i===0 ? 'bg-brand-pink/20 text-brand-pink line-through' : 'bg-gray-800 text-gray-300'}`}>
                    <span>{w}</span>
                    {i===0 && <span className="text-xs bg-brand-pink text-white px-1 rounded">MOI</span>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="text-brand-blue font-bold">Adv: <span className="text-white font-normal">Bien joué !</span></div>
                <div className="text-brand-pink font-bold">Moi: <span className="text-white font-normal">Merci :)</span></div>
              </div>
            )}
          </div>

          {activeTab === 'chat' && (
            <div className="p-3 bg-gray-800 border-t border-gray-700 flex gap-2">
              <input className="grow bg-gray-900 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-pink" placeholder="Message..." />
              <div className="bg-brand-pink p-2 rounded text-white"><Send size={16}/></div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
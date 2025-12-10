import { Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import GameGrid from '../wordsearch/components/GameGrid';
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
  const [soundEnabled, setSoundEnabled] = useState(true);


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
          
          <div className="grow ">
            {/* L'endroit ou se trouve l'ecran de jeux */}
          </div>
        </div>

        

      </main>
    </div>
  );
}
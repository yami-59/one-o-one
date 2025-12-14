import { Clock } from 'lucide-react';

interface Props {
  p1Name: string;
  p1Score: number;
  p2Name: string;
  p2Score: number;
  timer: string | null;
}

export default function Scoreboard({ p1Name, p1Score, p2Name, p2Score, timer }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* Joueur 1 */}
      <div className="bg-gray-800 border border-brand-pink/50 p-4 rounded-xl text-center shadow-[0_0_15px_rgba(236,72,153,0.1)]">
        <h3 className="text-brand-pink font-bold truncate">{p1Name}</h3>
        <p className="text-3xl font-black text-white">{p1Score}</p>
      </div>

      {/* Timer Central */}
      <div className="flex flex-col items-center justify-center bg-gray-800 p-2 rounded-xl border border-gray-700">
        <div className="flex items-center space-x-2 text-brand-yellow mb-1">
          <Clock size={18} />
          <span className="text-xs uppercase font-bold tracking-widest">Temps</span>
        </div>
        <p className="text-2xl font-mono font-bold text-white">{timer}</p>
      </div>

      {/* Joueur 2 */}
      <div className="bg-gray-800 border border-brand-blue/50 p-4 rounded-xl text-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
        <h3 className="text-brand-blue font-bold truncate">{p2Name}</h3>
        <p className="text-3xl font-black text-white">{p2Score}</p>
      </div>
    </div>
  );
}
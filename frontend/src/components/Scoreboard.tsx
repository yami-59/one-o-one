import { useEffect, useRef } from 'react';
import { useMotionValue, animate } from 'framer-motion';
import { Clock } from 'lucide-react';


interface AnimateNumberProps {
    value: number;
    duration?: number;
    className?: string;
}

const AnimateNumber = ({ value, duration = 0.5, className }: AnimateNumberProps) => {
    const motionValue = useMotionValue(0);
    
    // 🎯 CORRECTION: La ref doit pointer vers un HTMLSpanElement, pas un number
    const roundedValueRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const controls = animate(motionValue, value, {
            duration: duration,
            ease: "easeOut",
        });

        return controls.stop;
    }, [value, duration, motionValue]);

    useEffect(() => {
        const unsubscribe = motionValue.on("change", (latest) => {
            if (roundedValueRef.current) {
                roundedValueRef.current.textContent = latest.toFixed(0);
            }
        });

        return unsubscribe;
    }, [motionValue]);

    return (
        <span ref={roundedValueRef} className={className}>
            0
        </span>
    );
};


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
        {/* <p className="text-3xl font-black text-white">{p1Score}</p> */}
        <AnimateNumber  value={p1Score} className="text-3xl font-black text-white"></AnimateNumber>
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
        {/* <p className="text-3xl font-black text-white">{p2Score}</p> */}
        <AnimateNumber  value={p2Score} className="text-3xl font-black text-white"></AnimateNumber>
      </div>
    </div>
  );
}
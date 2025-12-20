import { Loader2, Gamepad2, Sparkles } from 'lucide-react';
import Div from './DivWrapper';

interface LoaderProps {
    /** Type de loader à afficher */
    variant?: 'spinner' | 'dots' | 'pulse' | 'game';
    /** Taille du loader */
    size?: 'sm' | 'md' | 'lg' | 'xl';
    /** Texte à afficher sous le loader */
    text?: string;
    /** Mode plein écran */
    fullscreen?: boolean;
}

export default function Loader({ 
    variant = 'spinner', 
    size = 'md', 
    text, 
    fullscreen = false 
}: LoaderProps) {
    const sizes = {
        sm: { icon: 'w-6 h-6', dot: 'w-2 h-2', pulse: 'w-12 h-12', game: 'w-12 h-12' },
        md: { icon: 'w-10 h-10', dot: 'w-3 h-3', pulse: 'w-20 h-20', game: 'w-20 h-20' },
        lg: { icon: 'w-16 h-16', dot: 'w-4 h-4', pulse: 'w-32 h-32', game: 'w-32 h-32' },
        xl: { icon: 'w-24 h-24', dot: 'w-6 h-6', pulse: 'w-48 h-48', game: 'w-48 h-48' },
    };

    const sizeClasses = sizes[size];

    const renderLoader = () => {
        switch (variant) {
            case 'spinner':
                return (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className={`${sizeClasses.icon} text-purple-400 animate-spin`} />
                        {text && <p className="text-gray-300 font-medium">{text}</p>}
                    </div>
                );

            case 'dots':
                return (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-2">
                            <Div className={`${sizeClasses.dot} bg-linear-to-br from-purple-500 to-pink-600 rounded-full animate-bounce shadow-lg shadow-purple-500/50`} style={{ animationDelay: '0ms' }} />
                            <Div className={`${sizeClasses.dot} bg-linear-to-br from-pink-500 to-purple-600 rounded-full animate-bounce shadow-lg shadow-pink-500/50`} style={{ animationDelay: '150ms' }} />
                            <Div className={`${sizeClasses.dot} bg-linear-to-br from-purple-600 to-blue-500 rounded-full animate-bounce shadow-lg shadow-blue-500/50`} style={{ animationDelay: '300ms' }} />
                        </div>
                        {text && <p className="text-gray-300 font-medium">{text}</p>}
                    </div>
                );

            case 'pulse':
                return (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            {/* Outer pulse ring */}
                            <div className={`absolute inset-0 bg-linear-to-br from-purple-500 to-pink-600 rounded-full blur-2xl opacity-60 animate-ping`} />
                            
                            {/* Middle pulse ring */}
                            <div className={`absolute inset-0 bg-linear-to-br from-purple-500 to-pink-600 rounded-full blur-xl opacity-40 animate-pulse`} />
                            
                            {/* Core circle */}
                            <div className={`relative ${sizeClasses.pulse} bg-linear-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/50`}>
                                <Sparkles className="w-1/2 h-1/2 text-white animate-pulse" />
                            </div>
                        </div>
                        {text && <p className="text-gray-300 font-medium mt-4">{text}</p>}
                    </div>
                );

            case 'game':
                return (
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-pink-600 rounded-full blur-3xl opacity-50 animate-pulse" />
                            
                            {/* Rotating gradient border */}
                            <div className={`relative ${sizeClasses.game} rounded-full bg-linear-to-br from-purple-500 via-pink-500 to-purple-500 p-1 animate-spin-slow shadow-2xl shadow-purple-500/50`}>
                                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                                    <Gamepad2 className="w-1/2 h-1/2 text-purple-400 animate-pulse" />
                                </div>
                            </div>

                            {/* Orbiting particles */}
                            <div className="absolute inset-0 animate-spin">
                                <Sparkles className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 text-yellow-400" />
                            </div>
                            <div className="absolute inset-0 animate-spin-reverse">
                                <Sparkles className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 text-pink-400" />
                            </div>
                        </div>
                        {text && (
                            <p className="text-lg font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                                {text}
                            </p>
                        )}
                    </div>
                );
        }
    };

    if (fullscreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl bg-slate-950/80">
                {renderLoader()}
            </div>
        );
    }

    return renderLoader();
}

// CSS animations personnalisées
const style = document.createElement('style');
style.textContent = `
    @keyframes spin-slow {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes spin-reverse {
        from {
            transform: rotate(360deg);
        }
        to {
            transform: rotate(0deg);
        }
    }

    .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
    }

    .animate-spin-reverse {
        animation: spin-reverse 4s linear infinite;
    }
`;
document.head.appendChild(style);

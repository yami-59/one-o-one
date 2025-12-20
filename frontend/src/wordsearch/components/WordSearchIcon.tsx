interface WordSearchIconProps {
    /** Taille de l'icône */
    size?: number;
    /** Classe CSS personnalisée */
    className?: string;
    /** Afficher l'animation */
    animated?: boolean;
    /** Variante de couleur */
    variant?: 'purple' | 'pink' | 'blue' | 'gradient';
}

export default function WordSearchIcon({ 
    size = 24, 
    className = '',
    animated = false,
    variant = 'gradient'
}: WordSearchIconProps) {
    const colors = {
        purple: '#a855f7',
        pink: '#ec4899',
        blue: '#3b82f6',
        gradient: 'url(#wordSearchGradient)',
    };

    const color = colors[variant];

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${className} ${animated ? 'animate-icon' : ''}`}
        >
            <defs>
                {/* Gradient pour la variante gradient */}
                <linearGradient id="wordSearchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>

                {/* Gradient pour le highlight */}
                <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
                </linearGradient>
            </defs>

            {/* Grille de fond */}
            <rect x="2" y="2" width="20" height="20" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
            
            {/* Lignes de séparation horizontales */}
            <line x1="2" y1="7.5" x2="22" y2="7.5" stroke={color} strokeWidth="0.5" opacity="0.3" />
            <line x1="2" y1="12.5" x2="22" y2="12.5" stroke={color} strokeWidth="0.5" opacity="0.3" />
            <line x1="2" y1="17.5" x2="22" y2="17.5" stroke={color} strokeWidth="0.5" opacity="0.3" />
            
            {/* Lignes de séparation verticales */}
            <line x1="7.5" y1="2" x2="7.5" y2="22" stroke={color} strokeWidth="0.5" opacity="0.3" />
            <line x1="12.5" y1="2" x2="12.5" y2="22" stroke={color} strokeWidth="0.5" opacity="0.3" />
            <line x1="17.5" y1="2" x2="17.5" y2="22" stroke={color} strokeWidth="0.5" opacity="0.3" />

            {/* Lettres dans la grille */}
            <text x="4.75" y="6.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.6">M</text>
            <text x="9.75" y="6.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.6">O</text>
            <text x="14.75" y="6.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.6">T</text>
            <text x="19.75" y="6.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">S</text>
            
            <text x="4.75" y="11.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">A</text>
            <text x="9.75" y="11.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">R</text>
            <text x="14.75" y="11.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">E</text>
            <text x="19.75" y="11.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">L</text>
            
            <text x="4.75" y="16.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">J</text>
            <text x="9.75" y="16.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">E</text>
            <text x="14.75" y="16.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">U</text>
            <text x="19.75" y="16.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">X</text>
            
            <text x="4.75" y="21.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">K</text>
            <text x="9.75" y="21.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">P</text>
            <text x="14.75" y="21.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">L</text>
            <text x="19.75" y="21.5" fontSize="4" fill={color} fontWeight="bold" opacity="0.4">N</text>

            {/* Ligne de surbrillance pour le mot "MOT" */}
            <rect 
                x="3" 
                y="3.5" 
                width="14" 
                height="4.5" 
                rx="1" 
                fill="url(#highlightGradient)" 
                className={animated ? 'highlight-anim' : ''}
            />

            {/* Animation CSS */}
            <style>{`
                @keyframes pulse-icon {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.02);
                    }
                }

                @keyframes highlight-pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                .animate-icon {
                    animation: pulse-icon 2s ease-in-out infinite;
                }

                .highlight-anim {
                    animation: highlight-pulse 2s ease-in-out infinite;
                }
            `}</style>
        </svg>
    );
}

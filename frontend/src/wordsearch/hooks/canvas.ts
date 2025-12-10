// /frontend/src/wordsearch/canvas.ts

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { CELL_SIZE,GAP_SIZE, LINE_THICKNESS } from '../constants';
import { getGridIndex, getRandomRainbowColor, construct_word } from '../lib';
import { type Position, type WordSolution, type GridIndexes } from '../types';
import { GameMessages } from '../constants';

// =============================================================================
// TYPES
// =============================================================================

export interface UseCanvasDrawingReturn {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    isDrawing: boolean;
    myWord: string;
    myOpponentWord: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const THROTTLE_MS = 50;
const MIN_WORD_LENGTH = 2;

// // Palette de couleurs pour les mots trouvés
// const FOUND_WORD_COLORS = {
//     player1: 'rgba(34, 197, 94, 0.5)',    // Vert
//     player2: 'rgba(59, 130, 246, 0.5)',   // Bleu
//     default: 'rgba(147, 51, 234, 0.5)',   // Violet
// };

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Convertit une WordSolution (indices de grille) en Position (pixels).
 * Centre la ligne au milieu de chaque cellule pour un meilleur rendu.
 */
const solutionToCanvasPosition = (solution: WordSolution): Position => {
    const cellWithGap = CELL_SIZE + GAP_SIZE;
    const halfCell = cellWithGap / 2;
    return {
        start_point: {
            x: solution.start_index.col * cellWithGap + halfCell,
            y: solution.start_index.row * cellWithGap + halfCell,
        },
        end_point: {
            x: solution.end_index.col * cellWithGap + halfCell,
            y: solution.end_index.row * cellWithGap + halfCell,
        },
    };
};

/**
 * Génère une couleur basée sur l'index du joueur.
 */
const getPlayerColor = (playerIndex: number): string => {
    const colors = [
        'rgba(34, 197, 94, 0.5)',   // Vert
        'rgba(59, 130, 246, 0.5)', // Bleu
        'rgba(249, 115, 22, 0.5)', // Orange
        'rgba(236, 72, 153, 0.5)', // Rose
    ];
    return colors[playerIndex % colors.length];
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook pour gérer le canvas du jeu Word Search.
 * 
 * @param gridData - Grille de lettres 2D
 * @param solutionsFound - Liste des mots trouvés avec leurs coordonnées
 * @param ws - Instance WebSocket
 * @param playerId - ID du joueur actuel (optionnel, pour différencier les couleurs)
 */
export const useCanvasDrawing = (
    gridData: string[][],
    solutionsFound: WordSolution[],
    ws: WebSocket | null,
    playerId?: string
): UseCanvasDrawingReturn => {

    const gridSize = gridData.length;

    const CANVAS_SIZE = gridSize * CELL_SIZE + (gridSize - 1) * GAP_SIZE;
    
    // ─────────────────────────────────────────────────────────────────────────
    // REFS
    // ─────────────────────────────────────────────────────────────────────────
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastSendTime = useRef<number>(0);
    const rafId = useRef<number | null>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // STATE - Sélection locale
    // ─────────────────────────────────────────────────────────────────────────
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [myColor, setMyColor] = useState(() => getRandomRainbowColor());
    const [myPosition, setMyPosition] = useState<Position | null>(null);
    const [myWord, setMyWord] = useState('');
    const [currentIndexes, setCurrentIndexes] = useState<GridIndexes | null>(null);

    // ─────────────────────────────────────────────────────────────────────────
    // STATE - Sélection adversaire (aperçu temps réel)
    // ─────────────────────────────────────────────────────────────────────────
    
    const [opponentPosition, setOpponentPosition] = useState<Position | null>(null);
    const [opponentColor, setOpponentColor] = useState<string | null>(null);
    const [myOpponentWord, setMyOpponentWord] = useState('');

    // ─────────────────────────────────────────────────────────────────────────
    // MEMOIZED VALUES
    // ─────────────────────────────────────────────────────────────────────────
    
    // Convertir les solutions trouvées en positions de canvas
    const foundWordsPositions = useMemo(() => {
        return solutionsFound.map((solution, index) => ({
            ...solution,
            canvasPosition: solutionToCanvasPosition(solution),
            color: getPlayerColor(index % 2), // Alterner les couleurs pour l'instant
        }));
    }, [solutionsFound]);

    // Mots déjà trouvés (pour éviter les doublons)
    const foundWordsSet = useMemo(() => {
        return new Set(solutionsFound.map((s) => s.word.toUpperCase()));
    }, [solutionsFound]);

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    
    const getContext = useCallback((): CanvasRenderingContext2D | null => {
        return canvasRef.current?.getContext('2d') ?? null;
    }, []);

    const sendThrottled = useCallback(
        (message: object) => {
            if (!ws || ws.readyState !== WebSocket.OPEN) return;
            const now = Date.now();
            if (now - lastSendTime.current >= THROTTLE_MS) {
                ws.send(JSON.stringify(message));
                lastSendTime.current = now;
            }
        },
        [ws]
    );

    const sendImmediate = useCallback(
        (message: object) => {
            if (!ws || ws.readyState !== WebSocket.OPEN) return;
            ws.send(JSON.stringify(message));
        },
        [ws]
    );

    const calculateWord = useCallback(
        (position: Position): { word: string | null; indexes: GridIndexes } => {
            if (gridData.length === 0) {
                return {
                    word: null,
                    indexes: {
                        start_index: { row: 0, col: 0 },
                        end_index: { row: 0, col: 0 },
                    },
                };
            }
            const indexes = getGridIndex(position);
            const word = construct_word({ grid: gridData, indexes });
            return { word, indexes };
        },
        [gridData]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // DRAWING FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────
    
    const drawLine = useCallback(
        (
            ctx: CanvasRenderingContext2D,
            position: Position,
            color: string,
            lineWidth: number = LINE_THICKNESS,
            dashed: boolean = false
        ) => {
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (dashed) {
                ctx.setLineDash([10, 5]);
            }

            ctx.beginPath();
            ctx.moveTo(position.start_point.x, position.start_point.y);
            ctx.lineTo(position.end_point.x, position.end_point.y);
            ctx.stroke();
            ctx.restore();
        },
        []
    );

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER EFFECT
    // ─────────────────────────────────────────────────────────────────────────
    
    useEffect(() => {
        const ctx = getContext();
        if (!ctx) return;

        if (rafId.current) cancelAnimationFrame(rafId.current);

        rafId.current = requestAnimationFrame(() => {
            // 1. Clear canvas
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            // 2. 🎯 Draw FOUND WORDS (persistent layer)
            foundWordsPositions.forEach(({ canvasPosition, color }) => {
                drawLine(ctx, canvasPosition, color, LINE_THICKNESS * 0.85);
            });

            // 3. Draw OPPONENT selection (real-time preview, dashed)
            if (opponentPosition && opponentColor) {
                drawLine(ctx, opponentPosition, opponentColor, LINE_THICKNESS * 0.7, true);
            }

            // 4. Draw MY selection (current, solid)
            if (isDrawing && myPosition) {
                drawLine(ctx, myPosition, myColor, LINE_THICKNESS);
            }
        });

        return () => {
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [
        isDrawing,
        myPosition,
        myColor,
        opponentPosition,
        opponentColor,
        foundWordsPositions,
        getContext,
        drawLine,
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // WEBSOCKET MESSAGE HANDLER
    // ─────────────────────────────────────────────────────────────────────────
    
    useEffect(() => {
        if (!ws) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);

                // Ignore own messages if echoed back
                if (data.from === playerId) return;

                switch (data.type) {
                    case GameMessages.SELECTION_UPDATE:
                        if (data.position) {
                            setOpponentPosition(data.position);
                            setOpponentColor(data.color || 'rgba(239, 68, 68, 0.5)');

                            // Calculate opponent's word for display
                            if (gridData.length > 0) {
                                const { word } = calculateWord(data.position);
                                setMyOpponentWord(word ?? '');
                            }
                        }
                        console.log(`selection update de ${data.from}`)
                        break;

                    case 'selection_reset':
                    case 'reset':
                        setOpponentPosition(null);
                        setOpponentColor(null);
                        setMyOpponentWord('');
                        break;

                    // Other message types handled elsewhere
                    default:
                        break;
                }
            } catch (error) {
                console.error('[Canvas] Error parsing message:', error);
            }
        };

        ws.addEventListener('message', handleMessage);
        return () => ws.removeEventListener('message', handleMessage);
    }, [ws, gridData, playerId, calculateWord]);

    // ─────────────────────────────────────────────────────────────────────────
    // MOUSE HANDLERS
    // ─────────────────────────────────────────────────────────────────────────
    
    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (gridData.length === 0) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const point = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };

            // Bounds check
            if (point.x < 0 || point.x > CANVAS_SIZE || point.y < 0 || point.y > CANVAS_SIZE) {
                return;
            }

            const position: Position = { start_point: point, end_point: point };
            const { word, indexes } = calculateWord(position);

            setIsDrawing(true);
            setMyPosition(position);
            setCurrentIndexes(indexes);
            setMyWord(word ?? '');

            sendImmediate({
                type: GameMessages.SELECTION_UPDATE,
                position,
                color: myColor,
            });
        },
        [gridData, myColor, calculateWord, sendImmediate]
    );

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!isDrawing || !myPosition || gridData.length === 0) return;

            const rect = e.currentTarget.getBoundingClientRect();
            const currentPoint = {
                x: Math.max(0, Math.min(e.clientX - rect.left, CANVAS_SIZE)),
                y: Math.max(0, Math.min(e.clientY - rect.top, CANVAS_SIZE)),
            };

            const newPosition: Position = {
                start_point: myPosition.start_point,
                end_point: currentPoint,
            };

            const { word, indexes } = calculateWord(newPosition);

            setMyPosition(newPosition);
            setCurrentIndexes(indexes);
            setMyWord(word ?? '');

            sendThrottled({
                type: GameMessages.SELECTION_UPDATE,
                position: newPosition,
                color: myColor,
            });
        },
        [isDrawing, myPosition, gridData, myColor, calculateWord, sendThrottled]
    );

    const handleMouseUp = useCallback(
        () => {
            
            if (!isDrawing) return;

            // Submit word if valid and not already found
            if (myWord && myWord.length >= MIN_WORD_LENGTH && currentIndexes) {
                const wordUpper = myWord.toUpperCase();

                if (!foundWordsSet.has(wordUpper)) {
                    sendImmediate({
                        type: GameMessages.SUBMIT_SELECTION,
                        solution:{    
                            word: myWord,
                            start_index: currentIndexes.start_index,
                            end_index: currentIndexes.end_index
                        }
                    });
                    console.log(`📤 Word submitted: "${myWord}"`);
                } else {
                    console.log(`⚠️ Word already found: "${myWord}"`);
                }
            }

            // Reset local state
            setIsDrawing(false);
            setMyPosition(null);
            setCurrentIndexes(null);
            setMyWord('');
            setMyColor(getRandomRainbowColor());

            // Notify opponent of reset
            sendImmediate({ type: GameMessages.SELECTION_RESET });
        },
        [isDrawing, myWord, currentIndexes, foundWordsSet, sendImmediate]
    );

    const handleMouseLeave = useCallback(
        () => {
            if (isDrawing) {
                handleMouseUp();
            }
        },
        [isDrawing, handleMouseUp]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────
    
    return {
        canvasRef,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp: handleMouseLeave,
        isDrawing,
        myWord,
        myOpponentWord,
    };
};

export default useCanvasDrawing;
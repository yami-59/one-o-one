// /frontend/src/wordsearch/canvas.ts

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { CELL_SIZE, GAP_SIZE, LINE_THICKNESS } from '../constants';
import { getGridIndex, getRandomRainbowColor, construct_word } from '../lib';
import { type Position, type WordSolution, type GridIndexes, type WordSearchData } from '../types';
import { GameMessages } from '../constants';
import type { SoundType } from '../../Game/types/GameInterface';
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
    opponentWord: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const THROTTLE_MS = 50;
const MIN_WORD_LENGTH = 2;

// =============================================================================
// HELPERS
// =============================================================================

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

const getPlayerColor = (playerIndex: number): string => {
    const colors = [
        'rgba(34, 197, 94, 0.5)',
        'rgba(59, 130, 246, 0.5)',
        'rgba(249, 115, 22, 0.5)',
        'rgba(236, 72, 153, 0.5)',
    ];
    return colors[playerIndex % colors.length];
};

// =============================================================================
// HOOK
// =============================================================================

export const useCanvasDrawing = (
    playSound:((type: SoundType) => void) ,
    setGameData: React.Dispatch<React.SetStateAction<unknown>>,
    gridData: string[][],
    solutionsFound: WordSolution[],
    ws: WebSocket | null,
    playerId?: string,
    
): UseCanvasDrawingReturn => {

    const gridSize = gridData.length;
    const CANVAS_SIZE = gridSize * CELL_SIZE + (gridSize - 1) * GAP_SIZE;

    // ─────────────────────────────────────────────────────────────────────────
    // REFS
    // ─────────────────────────────────────────────────────────────────────────
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const lastSendTime = useRef<number>(0);
    const rafId = useRef<number | null>(null);
    
    // 🎯 REF POUR LE WEBSOCKET - Toujours à jour
    const wsRef = useRef<WebSocket | null>(ws);


    // 🎯 DEBUG CRITIQUE: Log à chaque appel du hook
    console.log(`🎨 [Canvas ${playerId?.slice(-8)}] Hook appelé avec ws:`, {
        wsParam: ws ? `exists, readyState=${ws.readyState}` : 'null',
        wsRefCurrent: wsRef.current ? `exists, readyState=${wsRef.current.readyState}` : 'null',
        sameObject: ws === wsRef.current,
    });

    useEffect(() => {
        console.log(`🔄 [Canvas ${playerId?.slice(-8)}] useEffect ws - avant:`, wsRef.current ? 'exists' : 'null');
        wsRef.current = ws;
        console.log(`🔄 [Canvas ${playerId?.slice(-8)}] useEffect ws - après:`, wsRef.current ? 'exists' : 'null');
        
        if (ws) {
            console.log(`✅ [Canvas ${playerId?.slice(-8)}] WebSocket assigné, readyState: ${ws.readyState}`);
        }
    }, [ws, playerId]);

    // ─────────────────────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────────────────────
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [myColor, setMyColor] = useState(() => getRandomRainbowColor());
    const [myPosition, setMyPosition] = useState<Position | null>(null);
    const [myWord, setMyWord] = useState('');
    const [currentIndexes, setCurrentIndexes] = useState<GridIndexes | null>(null);

    const [opponentPosition, setOpponentPosition] = useState<Position | null>(null);
    const [opponentColor, setOpponentColor] = useState<string | null>(null);
    const [opponentWord, setOpponentWord] = useState('');

    // ─────────────────────────────────────────────────────────────────────────
    // MEMOIZED VALUES
    // ─────────────────────────────────────────────────────────────────────────
    
    const foundWordsPositions = useMemo(() => {
        return solutionsFound.map((solution, index) => ({
            ...solution,
            canvasPosition: solutionToCanvasPosition(solution),
            color: getPlayerColor(index % 2),
        }));
    }, [solutionsFound]);

    const foundWordsSet = useMemo(() => {
        return new Set(solutionsFound.map((s) => s.word.toUpperCase()));
    }, [solutionsFound]);

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────
    
    const getContext = useCallback((): CanvasRenderingContext2D | null => {
        return canvasRef.current?.getContext('2d') ?? null;
    }, []);

    // 🎯 SEND FUNCTIONS - Utilisent wsRef.current
    const sendThrottled = useCallback(
        (message: object) => {
            const currentWs = wsRef.current;
            if (!currentWs || currentWs.readyState !== WebSocket.OPEN) {
                return;
            }
            const now = Date.now();
            if (now - lastSendTime.current >= THROTTLE_MS) {
                currentWs.send(JSON.stringify(message));
                lastSendTime.current = now;
            }
        },
        []  // 🎯 Pas de dépendance - utilise la ref
    );

    const sendImmediate = useCallback(
    (message: object) => {

        const currentWs = wsRef.current;
        if (!currentWs) {
            console.log(`❌ [Canvas ${playerId?.slice(-8)}] wsRef.current est NULL`);
            return;
        }
        
        if (currentWs.readyState !== WebSocket.OPEN) {
            console.log(`❌ [Canvas ${playerId?.slice(-8)}] readyState=${currentWs.readyState} (pas OPEN=1)`);
            return;
        }

        try {
            currentWs.send(JSON.stringify(message));
            console.log(`✅ [Canvas ${playerId?.slice(-8)}] send() exécuté`);
        } catch (error) {
            console.error(`❌ [Canvas ${playerId?.slice(-8)}] Erreur send():`, error);
        }
    
    },
    [playerId]
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
    // DRAWING
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
    // RENDER EFFECT
    // ─────────────────────────────────────────────────────────────────────────
    
    useEffect(() => {
        const ctx = getContext();
        if (!ctx) return;

        if (rafId.current) cancelAnimationFrame(rafId.current);

        rafId.current = requestAnimationFrame(() => {
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            foundWordsPositions.forEach(({ canvasPosition, color }) => {
                drawLine(ctx, canvasPosition, color, LINE_THICKNESS * 0.85);
            });

            if (opponentPosition && opponentColor) {
                drawLine(ctx, opponentPosition, opponentColor, LINE_THICKNESS * 0.7, true);
            }

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
        CANVAS_SIZE
    ]);

    // ─────────────────────────────────────────────────────────────────────────
    // WEBSOCKET LISTENER
    // ─────────────────────────────────────────────────────────────────────────
    
    useEffect(() => {
        if (!ws) return;

        const handleMessage = (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case GameMessages.SELECTION_UPDATE:
                        if (data.position) {
                            setOpponentPosition(data.position);
                            setOpponentColor(data.color || 'rgba(239, 68, 68, 0.5)');

                            if (gridData.length > 0) {
                                const { word } = calculateWord(data.position);
                                setOpponentWord(word ?? '');
                            }
                        }
                        break;

                    case 'word_found':
                    case GameMessages.WORD_FOUND_SUCCESS:
                        console.log('[WS] ✅ Word found:', data.new_solution.word, 'by', data.found_by);
                        setGameData((prev: WordSearchData) => {
                            if (!prev) return null;

                            const newSolution: WordSolution = data.new_solution;
                            const updatedWordsFound = { ...prev.words_found };
                            const playerWords = updatedWordsFound[data.found_by] || [];
                            updatedWordsFound[data.found_by] = [...playerWords, newSolution];

                            const updatedScores = { ...prev.realtime_score };
                            if (data.new_score !== undefined) {
                                updatedScores[data.found_by] = data.new_score;
                            }

                            return {
                                ...prev,
                                words_found: updatedWordsFound,
                                realtime_score: updatedScores,
                            };
                        });

                        if(playSound) playSound('success')
                        break;

                        
                    case 'selection_reset':
                    case 'reset':
                        setOpponentPosition(null);
                        setOpponentColor(null);
                        setOpponentWord('');
                        
                        
                        break;
                }
            } catch (error) {
                console.error('[Canvas] Error parsing message:', error);
            }
        };

        ws.addEventListener('message', handleMessage);
        return () => ws.removeEventListener('message', handleMessage);
    }, [ws, gridData, playerId, calculateWord, setGameData,playSound]);

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
        [gridData, myColor, calculateWord, sendImmediate, CANVAS_SIZE]
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
        [isDrawing, myPosition, gridData, myColor, calculateWord, sendThrottled, CANVAS_SIZE]
    );

    const handleMouseUp = useCallback(() => {
        if (!isDrawing) return;

        if (myWord && myWord.length >= MIN_WORD_LENGTH && currentIndexes) {
            const wordUpper = myWord.toUpperCase();

            if (!foundWordsSet.has(wordUpper)) {
                sendImmediate({
                    type: GameMessages.SUBMIT_SELECTION,
                    solution: {
                        word: myWord,
                        start_index: currentIndexes.start_index,
                        end_index: currentIndexes.end_index,
                    },
                });
                console.log(`📤 Word submitted: "${myWord}"`);
            } else {
                console.log(`⚠️ Word already found: "${myWord}"`);
            }
        }

        setIsDrawing(false);
        setMyPosition(null);
        setCurrentIndexes(null);
        setMyWord('');
        setMyColor(getRandomRainbowColor());

        sendImmediate({ type: GameMessages.SELECTION_RESET });
    }, [isDrawing, myWord, currentIndexes, foundWordsSet, sendImmediate]);

    const handleMouseLeave = useCallback(() => {
        if (isDrawing) {
            handleMouseUp();
        }
    }, [isDrawing, handleMouseUp]);

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
        opponentWord,
    };
};

export default useCanvasDrawing;
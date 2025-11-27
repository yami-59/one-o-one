// /frontend/src/hooks/useCanvasDrawing.ts

import { useState, useRef, useCallback } from 'react';
import * as c from './constants'; // Importe vos constantes (GRID_SIZE, CANVAS_SIZE, etc.)
import { getGridIndex,getRandomRainbowColor,getWord } from './utils';
import { type GridIndex ,type Point} from './types';
/**
 * Hook personnalisé pour gérer l'interaction (dessin et événements) avec le Canvas.
 * @param color La couleur à utiliser pour la ligne de surlignage.
 * @returns {object} Contient les gestionnaires d'événements et les états à lier au JSX.
 */
export const useCanvasDrawing = (gridData:string[][]) => {
    
    // États et Références
    const canvasRef = useRef<HTMLCanvasElement>(null); 
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<Point | null>(null);
    const [startGridIndex, setStartGridIndex] = useState<GridIndex >({col:0,row:0});
    const [word,setWord] = useState("")
    const [color,setColor] = useState(getRandomRainbowColor())

    // Fonction utilitaire pour obtenir le contexte de dessin 2D
    const getContext = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return null;
        }
        return canvas.getContext('2d');
    }, []); // Dépend seulement de la référence stable

    // --- Logique de Dessin (Encapsulée) ---

    const clearCanvas = useCallback(() => {
        const ctx = getContext();
        if (ctx) {
            // Utilise les dimensions des constantes
            ctx.clearRect(0, 0, c.CANVAS_SIZE, c.CANVAS_SIZE);
        }
    }, [getContext]);

    const drawLine = useCallback((currentX: number, currentY: number) => {
        const ctx = getContext();
        if (!ctx || !startPoint) return;
        
        ctx.strokeStyle = color; 
        ctx.lineWidth = c.LINE_THICKNESS; 
        ctx.lineCap = 'round'; 
        
        clearCanvas(); 

        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y); 
        ctx.lineTo(currentX, currentY); 
        ctx.stroke();

    }, [startPoint, getContext, clearCanvas,color]);



    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        
        const gridIndex = getGridIndex(x, y);


           
        // 🎯 Utilisez la variable locale 'newIndexes' pour le calcul immédiat
        const currentWord = getWord({
            grid: gridData,
            start:gridIndex,
            end: gridIndex
        });

        // 3. Mettre à jour l'état (maintenant safe, car le calcul est terminé)
        setIsDrawing(true);
        setStartPoint({ x, y }); 
        setStartGridIndex(gridIndex); // Met à jour l'état pour les prochains événements (move/up)
        if(currentWord) setWord(currentWord) ;
        
        console.log(`Index de départ : ligne:${gridIndex.row} col:${gridIndex.col} `);
        console.log(`Mot immédiatement calculé : ${currentWord}`);
        
    }, [gridData]); 

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPoint) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        drawLine(x, y); 


        const gridIndex = getGridIndex(x,y)


        console.log(`Index de Fin :  ligne:${gridIndex.row} col:${gridIndex.col} `)


        // 🎯 Utilisez la variable locale 'gridIndex' pour le calcul immédiat
        const currentWord = getWord({
            grid: gridData,
            start:startGridIndex,
            end: gridIndex
        });
    
        if(!currentWord) setWord("") ;

        else setWord(currentWord)
        

    }, [isDrawing, startPoint, drawLine,gridData,startGridIndex]); 

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    
            if(!isDrawing) return 
    
            // 1. Récupérer la position absolue du Canvas sur la fenêtre
            const rect = e.currentTarget.getBoundingClientRect();
            
            // 2. Calculer les coordonnées relatives (Pixel X et Y)
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
    
            // 🎯 LOG DEMANDÉ
            console.log(`Mouse Up - Position Relative: X=${x.toFixed(2)}, Y=${y.toFixed(2)}`);
    
    
    
            if (!isDrawing) return;
            
            setIsDrawing(false);
            setStartPoint(null);
            setColor(getRandomRainbowColor())
            
            // 🎯 EFFACEMENT CRITIQUE : La ligne est retirée au relâchement
            clearCanvas(); 
    
    
            //Soummision du mot au back
            // if(word.length >=2 )
                
    
            //resetDuMot
            setWord("")
                
    }, [isDrawing, clearCanvas]); 

    // --- Retour de l'API du Hook ---
    return {
        canvasRef,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        isDrawing,
        word
    };
};


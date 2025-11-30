// /frontend/src/hooks/useCanvasDrawing.ts

import { useState, useRef, useCallback,useEffect} from 'react';
import {CANVAS_SIZE,GameMessageType,LINE_THICKNESS} from '../../constants/wordsearchConstants'
import { getGridIndex,getRandomRainbowColor,construct_word} from '../../lib/wordSearchLib';
import { type Position} from '../../types/wordsearchTypes';




/**
 * Hook personnalisé pour gérer l'interaction (dessin et événements) avec le Canvas.
 * @param gridData Le tableaux 2D qui forme la grille de mot-mele
 * @returns {object} Contient les gestionnaires d'événements et les états à lier au JSX.
 */
export const useCanvasDrawing = (gridData:string[][],ws:WebSocket|undefined) => {
    
    // États et Références
    const canvasRef = useRef<HTMLCanvasElement>(null); 
    const [isDrawing, setIsDrawing] = useState(false);
    const [myColor,setMyColor] = useState(getRandomRainbowColor())
    const [myOpponentColor,setMyOpponentColor] = useState<string>()
    
    // donnée relative au joueurs
    const [myWord,setMyWord] = useState("")
    const [myOpponentWord,setMyOpponentWord]=useState("")
    const [myPosition,setMyPosition] = useState<Position>()
    const [opponentPosition,setOpponentPosition] = useState<Position>()
   
    
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
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        }
    }, [getContext]);


             
    useEffect(()=>{

        if(!ws) return 
        else {
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if(data.type === GameMessageType.SELECTION_UPDATE){

                        setOpponentPosition(data.position)
                        setMyOpponentColor(data.color)


                        const indexes = getGridIndex(data.position)

                        const word = construct_word({
                            grid: gridData,
                            indexes:indexes,
                        });

                    

                        if(word) setMyOpponentWord(word)
                        else setMyOpponentWord("")
                    }
                    else if(data.type === "reset"){
                        setOpponentPosition(undefined)
                        setMyOpponentWord("")
                    }

                };
        }

    },[ws,opponentPosition,gridData])       
    

     useEffect(() => {
        const ctx = getContext();
        if (!ctx) return;
        
        // 1. EFFACEMENT TOTAL
        clearCanvas(); 

        // --- 2. DESSIN LOCAL (My Position) ---
        // Cette logique dessine la ligne complète du début du clic (startPoint) au point actuel.
        if (isDrawing && myPosition) {
            ctx.strokeStyle = myColor; // Couleur locale
            ctx.lineWidth = LINE_THICKNESS; 
            
            ctx.beginPath();
            ctx.moveTo(myPosition.start_point.x, myPosition.start_point.y);
            ctx.lineTo(myPosition.end_point.x, myPosition.end_point.y);
            ctx.stroke();
        }
        
        // --- 3. DESSIN ADVERSE (Opponent Position) ---
        if (opponentPosition && myOpponentColor) {
            
            // 🎯 Note: Utiliser le style hachuré ou plus fin pour l'adversaire est courant
            ctx.strokeStyle = myOpponentColor; // Utiliser une couleur différente
            ctx.lineWidth = LINE_THICKNESS;
            
            ctx.beginPath();
            ctx.moveTo(opponentPosition.start_point.x, opponentPosition.start_point.y); 
            ctx.lineTo(opponentPosition.end_point.x, opponentPosition.end_point.y); 
            ctx.stroke();
        }

    }, [isDrawing, getContext, clearCanvas, myColor,myPosition,opponentPosition,myOpponentColor]); 
    
  

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();

        const currentPoint = {
            x:e.clientX - rect.left,
            y:e.clientY - rect.top
        }

        const currentPos = {start_point:currentPoint,end_point:currentPoint}
        const indexes = getGridIndex(currentPos);
    
        const currentWord = construct_word({
            grid: gridData,
            indexes:indexes
        });

        // 3. Mettre à jour l'état (maintenant safe, car le calcul est terminé)
        setIsDrawing(true);

        setMyPosition(currentPos)

        if(ws) {
            ws.send(
                JSON.stringify({
                    type:GameMessageType.SELECTION_UPDATE,
                    position:currentPos,
                    color:myColor
                    
                }))
        }
        if(currentWord) setMyWord(currentWord) ;
        
        console.log(`Index de départ : ligne:${indexes.start_index.row} col:${indexes.start_index.col} `);
        console.log(`Mot immédiatement calculé : ${currentWord}`);
        
    }, [gridData,ws,myColor]); 

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !myPosition) return;

   
        const rect = e.currentTarget.getBoundingClientRect();
        const startPoint = myPosition.start_point
        const currentPoint = {
            x:e.clientX - rect.left,
            y:e.clientY - rect.top
        }
        
        const currentPos = {start_point:startPoint,end_point:currentPoint}
        const indexes = getGridIndex(currentPos);
    
        const currentWord = construct_word({
            grid: gridData,
            indexes:indexes
        });


        console.log(`Index de Fin :  ligne:${indexes.end_index.row} col:${indexes.end_index.col} `)

        setMyPosition(prev => {
            if (!prev) return undefined; 

            return {
                ...prev, 
                end_point:currentPoint 
                
            };
        });


        if(ws) {
            ws.send(
                JSON.stringify({
                type:GameMessageType.SELECTION_UPDATE,
                position:currentPos,
                color:myColor
       
            })
            )
        }
    
        if(!currentWord) setMyWord("") ;

        else setMyWord(currentWord)
        

    }, [isDrawing,gridData,myPosition,ws,myColor]); 

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
            setMyPosition(undefined);
            setMyColor(getRandomRainbowColor())
            
           
            if(ws) {
                ws.send(
                    JSON.stringify({
                    type:"reset",
                })
            )
        }
    
            //Soummision du mot au back
            // if(word.length >=2 )
                
    
            //resetDuMot
            setMyWord("")
                
    }, [isDrawing,ws]); 


   
    // --- Retour de l'API du Hook ---
    return {
        canvasRef,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        isDrawing,
        myWord,
        myOpponentWord
    };
    
};



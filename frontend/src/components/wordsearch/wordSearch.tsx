import { GRID_SIZE } from "../../constants/wordsearchConstants";
import { getRandomLetter } from "../../lib/wordSearchLib";
import { useEffect,useState } from "react";
import  NameListTable  from "./nameListTable";
import WordSearchTable  from "./wordSearchTable";
import { useCanvasDrawing } from '../../hooks/wordsearch/canvas';
import {useWebSocket} from '../../hooks/wordsearch/websocket'
import { type AuthProps } from "../../types/types";
import Loading from "../loading"


// Composents principlae
const WordSearch = ({token,playerId,isLoading} : AuthProps) => {


    // État de la grille (Tableau 2D de lettres)
    const [gridData, setGridData] = useState<string[][]>([]);
    const ws = useWebSocket(token,playerId)

    const rest = useCanvasDrawing(gridData,ws); 

   

    //---MOK DATA---

    // Liste factice de mot a trouver 
    const wordsToFind = [
        "PYTHON",
        "REACT",
        "TYPESCRIPT",
        "TEST",
        "CANVAS",
        "DEV",
        "HOOKS",
        "GRID"
    ];

    //liste factice de mot trouvé
    const wordFound = [
        "TYPESCRIPT",
        "TEST",
    ]
    // Grille avec des lettres aléatoires
    useEffect(() => {
        const initialGrid = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            const row = [];
            for (let col = 0; col < GRID_SIZE ; col++) {
                row.push(getRandomLetter()); // Remplissage aléatoire pour l'instant
            }
            initialGrid.push(row);
        }
        setGridData(initialGrid);

    
    }, []);

    // FIN MOK DATA
    

 
    
    return (
        <>
            
            {
                isLoading ? 
                    <Loading/> 
                : 
                    <div className='flex flex-row  w-fit h-fit  items-end '>

                        {/** Espace pour les nom à trouvé */}
                    
                        <NameListTable  wordsToFind={wordsToFind}  wordFound={wordFound}/>
                

                

                        {/* table de Mot-mêlé*/}

                        {ws && <WordSearchTable gridData={gridData}
                        
                        {...rest}
                        />}
                    </div>
                        
            }

        </>
    );
}



export default WordSearch;
import { GRID_SIZE } from "./constants";
import { getRandomLetter } from "./utils";
import { useEffect,useState } from "react";
import { NameListTable,WordSearchTable } from "./components";




// Composents principlae
const WordSearch = () => {


    // État de la grille (Tableau 2D de lettres)
    const [gridData, setGridData] = useState<string[][]>([]);
   

    // 🎯 DÉCLARATION DE LA LISTE DE MOTS POUR LE TEST
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

    const wordFound = [
        "TYPESCRIPT",
        "TEST",
    ]
    // 🎯 1. Initialisation de la grille avec des lettres aléatoires
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

    
   

    // --- Rendu ---
    return (
        <>
            

            <div className='flex flex-row  w-fit h-fit  items-end '>

                {/** Espace pour les nom à trouvé */}
               
                    <NameListTable  wordsToFind={wordsToFind}  wordFound={wordFound}/>
                 {/** Fin*/}

           

                {/*Début  la table de Mot-mêlé*/}

                 <WordSearchTable gridData={gridData}/>

                {/*Fin de la table de Mot-mêlé*/}

              </div>

        </>
    );
};

export default WordSearch;
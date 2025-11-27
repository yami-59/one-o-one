import Div from '../../divWrapper';
import * as c from './constants'
import * as t from './types';
import { useCanvasDrawing } from './hooks';



const GridCell = ({ letter, row, col }:t.GridCellProps) => {
    
    
    return (
        <Div 
            // 🎯 Tailwind: S'assurer que la cellule a une taille fixe et un centrage
            className="flex items-center justify-center 
                       border border-gray-600 
                       text-xl font-bold font-mono 
                       text-white 
                       bg-dark-bg"
            style={{ width: c.CELL_SIZE, height: c.CELL_SIZE}}
            // Data-attributs pour le débogage (utile pour lire les coordonnées)
            data-row={row}
            data-col={col}
        >
            {letter.toUpperCase()}
        </Div>
    );
};


export const WordSearchTable = ({gridData} : {gridData:string[][]}) => {

    // Appel du Hook
    const { 
        canvasRef, 
        handleMouseDown, 
        handleMouseMove, 
        handleMouseUp,
        word 
    } = useCanvasDrawing(gridData); 


    return (
        
                <div className='flex flex-col '>
                    {/* AFFICHAGE DU MOT SÉLECTIONNÉ */}
                    <div className="w-full text-center mb-2">
                        {/* Tailwind: Typographie Arcade et centrage */}
                        <h2 className="text-sm font-arcade text-white">
                            {/* Affiche le mot, ou un message d'instruction */}
                            {word ? 
                                <span className="text-primary-rose  border-primary-rose">
                                    {word}
                                </span> 
                                : 
                                "..."}
                        </h2>
                    </div>
                    <Div
                        className='relative '
                        style={{ width: c.CANVAS_SIZE, height: c.CANVAS_SIZE }}
                    >
                        
                        <div 
                            className='border-2 border-solid w-full h-full '
                        >
                            {/* 3. Le Calque de la Grille de Lettres (en arrière-plan) */}
                            <Div 
                                className="absolute top-0 left-0"
                                style={{ 
                                    display:'grid',
                                    gridTemplateColumns: `repeat(${c.GRID_SIZE}, ${c.CELL_SIZE}px)`,

                                }}
                            >
                                {gridData.map((row, rIndex) => (
                                    row.map((letter, cIndex) => (
                                        <GridCell 
                                            key={`${rIndex}-${cIndex}`} 
                                            letter={letter} 
                                            row={rIndex}
                                            col={cIndex}
                                        />
                                    ))
                                ))}
                            </Div>
                            {/* L'élément Canvas qui écoute les événements de la souris */}
                            <canvas 
                                ref={canvasRef}
                                width={c.CANVAS_SIZE}
                                height={c.CANVAS_SIZE}
                                // Événements d'écoute
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp} // Important si la souris sort de la zone
                                className='cursor-crosshair z-10 absolute top-0 left-0'
                            />
                        </div>
                    </Div>
                </div>
    )


}


export const NameListTable = ({wordsToFind,wordFound} : {wordsToFind:string[],wordFound:string[]})=>{



    return (
         <Div 
                className='border border-solid mr-20 p-4 space-y-5  flex flex-col '
                style={{height: c.CANVAS_SIZE, width: c.CANVAS_SIZE / 2}}
                >

                    <p className="text-sm  border-b  pb-1 ">
                        Mots a trouver 
                    </p>

                    {/* Conteneur de la liste (list-inside pour les puces) */}
                    <ul className="list-disc list-inside space-y-1 text-gray-300  overflow-y-auto">

                        {/* 🎯 RENDU DYNAMIQUE DES MOTS */}
                        {wordsToFind.map((word, index) => (
                            <li 
                                key={index} 
                                // Style pour les mots à trouver
                                className={
                                    `text-sm tracking-widest hover:text-primary-rose transition-colors duration-100
                                    ${wordFound.includes(word)? 'line-through' :''} 
                                    
                                    `}
                            >
                                {word}
                            </li>
                    ))}

                     </ul>
            
            </Div>
    )

}



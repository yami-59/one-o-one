import {type GridCellProps} from '../../types/wordsearchTypes';
import Div from '../divWrapper';
import {CELL_SIZE} from '../../constants/wordsearchConstants'


const GridCell = ({ letter, row, col }:GridCellProps) => {
    
    
    return (
        <Div 
            // 🎯 Tailwind: S'assurer que la cellule a une taille fixe et un centrage
            className="flex items-center justify-center 
                       border border-gray-600 
                       text-xl font-bold font-mono 
                       text-white 
                       bg-dark-bg"
            style={{ width: CELL_SIZE, height: CELL_SIZE}}
            // Data-attributs pour le débogage (utile pour lire les coordonnées)
            data-row={row}
            data-col={col}
        >
            {letter.toUpperCase()}
        </Div>
    );
};

export default GridCell
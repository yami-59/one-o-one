import { type GridCellProps } from '../types';
import Div from '../../components/divWrapper';
import { CELL_SIZE } from '../constants';

const GridCell = ({ letter, row, col }: GridCellProps) => {
    return (
        <Div
            // 🎯 Tailwind: S'assurer que la cellule a une taille fixe et un centrage
            className="bg-dark-bg flex items-center justify-center border border-gray-600 font-mono text-xl font-bold text-white"
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
            // Data-attributs pour le débogage (utile pour lire les coordonnées)
            data-row={row}
            data-col={col}
        >
            {letter.toUpperCase()}
        </Div>
    );
};

export default GridCell;

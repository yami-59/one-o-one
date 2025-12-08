import { type WordSearchTableProps } from '../types';
import Div from '../../components/divWrapper';
import { CELL_SIZE, CANVAS_SIZE, GRID_SIZE } from '../constants';
import GridCell from './gridCell';

const WordSearchTable = ({
    gridData,
    canvasRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    myWord,
    myOpponentWord,
}: WordSearchTableProps) => {
    return (
        <div className="flex flex-col">
            {/* AFFICHAGE DU MOT SÉLECTIONNÉ */}
            <div className="mb-2 w-full text-center">
                {/* Tailwind: Typographie Arcade et centrage */}
                <h2 className="font-arcade text-sm text-white">
                    {/* Affiche le mot, ou un message d'instruction */}
                    {myWord ? (
                        <span className="text-primary-rose border-primary-rose">{myWord}</span>
                    ) : (
                        '...'
                    )}
                </h2>
            </div>
            <Div className="relative" style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
                <div className="h-full w-full border-2 border-solid">
                    {/* 3. Le Calque de la Grille de Lettres (en arrière-plan) */}
                    <Div
                        className="absolute top-0 left-0"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                        }}
                    >
                        {gridData.map((row, rIndex) =>
                            row.map((letter, cIndex) => (
                                <GridCell
                                    key={`${rIndex}-${cIndex}`}
                                    letter={letter}
                                    row={rIndex}
                                    col={cIndex}
                                />
                            )),
                        )}
                    </Div>
                    {/* L'élément Canvas qui écoute les événements de la souris */}
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        // Événements d'écoute
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp} // Important si la souris sort de la zone
                        className="absolute top-0 left-0 z-10 cursor-crosshair"
                    />
                </div>
            </Div>
            {/* AFFICHAGE DU MOT SÉLECTIONNÉ */}
            <div className="mt-2 w-full text-center">
                {/* Tailwind: Typographie Arcade et centrage */}
                <h2 className="font-arcade text-sm text-white">
                    {/* Affiche le mot, ou un message d'instruction */}
                    {myOpponentWord ? (
                        <span className="text-primary-rose border-primary-rose">
                            {myOpponentWord}
                        </span>
                    ) : (
                        '...'
                    )}
                </h2>
            </div>
        </div>
    );
};

export default WordSearchTable;

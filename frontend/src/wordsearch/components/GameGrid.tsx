import Div from '../../components/DivWrapper';
import { CELL_SIZE, GAP_SIZE } from '../constants';
import { type GameGridProps } from '../types';

export default function GameGrid({
  gridData,
  canvasRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  myWord,
  myOpponentWord,
}: GameGridProps) {
  const gridSize = gridData.length;

  // Calcul précis de la taille totale de la grille
  // = (nombre de cellules × taille cellule) + (nombre de gaps × taille gap)
  const totalSize = gridSize * CELL_SIZE + (gridSize - 1) * GAP_SIZE;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Mot sélectionné par l'adversaire */}
      <div className="h-8 flex items-center justify-center">
        {myOpponentWord ? (
          <span className="text-brand-blue font-bold text-lg tracking-widest animate-pulse">
            {myOpponentWord}
          </span>
        ) : (
          <span className="text-gray-600 text-sm">...</span>
        )}
      </div>

      {/* Grille de jeu */}
      <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-2xl relative w-fit">
        {/* Grille de lettres */}
        <Div
          className="relative"
          style={{
            display: 'grid',
            gap: `${GAP_SIZE}px`,
            gridTemplateColumns: `repeat(${gridSize}, ${CELL_SIZE}px)`,
          }}
        >
          {gridData.flat().map((char, i) => (
            <Div
              key={i}
              style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
              className="bg-gray-700/50 text-gray-300 flex items-center justify-center rounded-md text-sm sm:text-lg font-bold select-none"
            >
              {char}
            </Div>
          ))}
        </Div>

        {/* Canvas superposé */}
        <canvas
          ref={canvasRef}
          className="absolute top-3 left-3 pointer-events-auto cursor-crosshair "
          width={totalSize}
          height={totalSize}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Mot sélectionné par moi */}
      <div className="h-8 flex items-center justify-center">
        {myWord ? (
          <span className="text-brand-pink font-bold text-lg tracking-widest">
            {myWord}
          </span>
        ) : (
          <span className="text-gray-600 text-sm">Sélectionnez un mot...</span>
        )}
      </div>
    </div>
  );
}

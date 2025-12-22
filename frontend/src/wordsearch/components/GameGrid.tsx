import Div from '../../components/DivWrapper';
import { CELL_SIZE, GAP_SIZE } from '../constants';
import { type GameGridProps } from '../types';


// =============================================================================
// GAME GRID COMPONENT
// =============================================================================

export default function GameGrid({
  gridData,
  canvasRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  myWord,
  opponentWord,

}: GameGridProps)  {
  const gridSize = gridData.length;
  const totalSize = gridSize * CELL_SIZE + (gridSize - 1) * GAP_SIZE;



  return (
    <div className="flex flex-col items-center gap-6">
      {/* Mot de l'adversaire */}
      <div className="h-10 flex items-center justify-center min-w-[200px]">
        {opponentWord ? (
          <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-400/30 rounded-xl px-4 py-2 shadow-lg">
            <span className="text-blue-400 font-bold text-lg tracking-widest animate-pulse">
              {opponentWord}
            </span>
          </div>
        ) : (
          <span className="text-gray-600 text-sm">...</span>
        )}
      </div>

      {/* Grille de jeu */}
      <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl relative">
        {/* Grille de lettres */}
        <Div
          className="relative "
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
              className="backdrop-blur-xl bg-white/5 border border-white/10 text-white flex items-center justify-center rounded-lg font-bold select-none hover:bg-white/10 hover:border-purple-400/30 transition-all duration-200 cursor-pointer shadow-lg"
            >
              {char}
            </Div>
          ))}
        </Div>

        {/* Canvas superposé */}
        <canvas
          ref={canvasRef}
          className="absolute top-6 left-6 pointer-events-auto cursor-crosshair "
          width={totalSize}
          height={totalSize}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          
        />
       
      </div>

      {/* Mon mot */}
      <div className="h-10 flex items-center justify-center min-w-[200px]">
        {myWord ? (
          <div className="backdrop-blur-xl bg-pink-500/10 border border-pink-400/30 rounded-xl px-4 py-2 shadow-lg">
            <span className="text-pink-400 font-bold text-lg tracking-widest">
              {myWord}
            </span>
          </div>
        ) : (
          <span className="text-gray-600 text-sm">Sélectionnez un mot...</span>
        )}
      </div>
    </div>
  );
}
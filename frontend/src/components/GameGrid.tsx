interface Props {
  grid: string[][];
  selection: number[][]; // 0=rien, 1=j1, 2=j2
}

export default function GameGrid({ grid, selection }: Props) {
  return (
    <div className="bg-gray-800 p-3 rounded-xl border border-gray-700 shadow-2xl relative">
      <div 
        className="grid gap-1" 
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))` }}
      >
        {grid.flat().map((char, i) => {
          const row = Math.floor(i / grid[0].length);
          const col = i % grid[0].length;
          const status = selection[row][col];
          
          let bgClass = "bg-gray-700/50 text-gray-300";
          if (status === 1) bgClass = "bg-brand-pink text-white animate-pulse";
          if (status === 2) bgClass = "bg-brand-blue text-white";

          return (
            <div 
              key={i}
              style={{width:'75px',height:'75px'}}
              className={`${bgClass}
                aspect-square flex items-center justify-center 
                rounded-md text-sm sm:text-lg font-bold select-none cursor-pointer
                transition-all duration-200
              `}
            >
              {char}
            </div>
          );
        })}
      </div>
      {/* Canvas superposé */}
      <canvas
        id="overlay"
        className="absolute top-3 left-3 pointer-events-none bg-amber-500 opacity-10"
        width={(75 + 4) * grid[0].length}
        height={(75 + 4) * grid[0].length}
      />

    </div>
  );
}
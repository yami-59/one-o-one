//Props
export interface Point {
    x: number;
    y: number;
}

export interface WordSolution extends GridIndexes{
    word:string
}

// Interface pour les indices de grille
export interface GridIndex {
    row: number;
    col: number;
}

export interface GridIndexes {
    start_index: GridIndex;
    end_index: GridIndex;
}

export interface Position {
    start_point: Point;
    end_point: Point;
}

export interface WordConstructProps {
    grid: string[][];
    indexes: GridIndexes;
}

export interface GridCellProps {
    letter: string;
    row: number;
    col: number;
}

export interface CanvaDrawingProps {
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    handleMouseUp: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    isDrawing: boolean;
    myWord: string;
    myOpponentWord: string;
}

export interface WordSearchTableProps extends CanvaDrawingProps {
    gridData: string[][];
}

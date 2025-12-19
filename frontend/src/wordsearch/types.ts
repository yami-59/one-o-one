import { type GameBaseData } from "../Game/types/GameInterface";

//Props
export interface Point {
    x: number;
    y: number;
}

export interface WordSolution extends GridIndexes{
    word:string
    found_by:string;
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
    opponentWord: string;
}

export interface WordSearchTableProps extends CanvaDrawingProps {
    gridData: string[][];
}

export interface GameGridProps extends CanvaDrawingProps {
    gridData: string[][];
}



// Interface spécifique au jeu de mots mêlés
export interface WordSearchData extends GameBaseData {
  theme: string;

  // Grille de lettres
  grid_data: string[][]; // tableau 2D de lettres

  // Liste des mots à trouver
  words_to_find: string[];

  // Mots trouvés par joueur
  words_found:  WordSolution[]; 
}
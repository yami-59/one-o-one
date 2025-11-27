//Props 
export interface Point  {
    x :number;
    y :number;
}


// Interface pour les indices de grille
export interface GridIndex {
    row: number;
    col: number;
}

export interface WordProps  {
    grid:string[][],
    start:GridIndex,
    end:GridIndex
}

export interface GridCellProps {
    letter:string;
    row:number;
    col:number;
}


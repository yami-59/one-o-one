// /frontend/src/wordsearch/components/WordSearchScreen.tsx

import { useMemo } from 'react';
import { useGame } from '../../Game/context/GameContext';
import { useCanvasDrawing } from '../hooks/canvas';
import GameGrid from './GameGrid';
import SidePanel from './SidePanel';
import type { WordSolution, WordSearchData } from '../types';
import type { GameComponentProps } from '../../Game/types/GameInterface';
import { Loader2 } from 'lucide-react';

export function WordSearchScreen({ playSound } : GameComponentProps) {
    const game = useGame();


    
    // Cast des données spécifiques au jeu
    const data = game.gameData as WordSearchData | null;

  


    // Extraire les solutions trouvées
    const solutionsFound: WordSolution[] = useMemo(() => {
        if (!data?.words_found) return [];
        return data.words_found;
    }, [data?.words_found]);


    

    // Hook de dessin Canvas
    const canvasProps = useCanvasDrawing(
        playSound,
        game.setGameData,
        data?.grid_data ?? [],
        solutionsFound,
        game.ws,
        game.me.id,
    );



    if (!data || !data.grid_data) {
        return (
            <Loader2></Loader2>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
            {/* Grille */}
            <div className="order-1">
                <GameGrid gridData={data.grid_data} {...canvasProps} />
            </div>

            {/* Panel latéral */}
            <div className="order-2 w-full lg:w-72">
                <SidePanel
                    theme={data.theme}
                    wordsToFind={data.words_to_find}
                    wordsFound={solutionsFound}
                    gridSize={data.grid_data.length}
                    myPlayerId={game.me.id}
                />
            </div>
        </div>
    );
}
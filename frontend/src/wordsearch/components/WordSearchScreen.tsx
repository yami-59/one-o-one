// /frontend/src/wordsearch/components/WordSearchScreen.tsx

import { useMemo , useEffect} from 'react';
import { useGame } from '../../Game/context/GameContext';
import { useCanvasDrawing } from '../hooks/canvas';
import GameGrid from './GameGrid';
import SidePanel from './SidePanel';
import type { WordSolution, WordSearchData } from '../types';
import type { GameComponentProps } from '../../Game/types/GameInterface';

export function WordSearchScreen({ playSound } : GameComponentProps) {
    const game = useGame();


    // 🎯 DEBUG: Log quand game.ws change
    useEffect(() => {
        console.log(`🔄 [WordSearchScreen] game.ws changé:`, 
            game.ws ? `readyState=${game.ws.readyState}` : 'null'
        );
    }, [game.ws]);
    
    // Cast des données spécifiques au jeu
    const data = game.gameData as WordSearchData | null;

  


    // Extraire les solutions trouvées
    const solutionsFound: WordSolution[] = useMemo(() => {
        if (!data?.words_found) return [];
        return Object.values(data.words_found).flat();
    }, [data?.words_found]);


    

    // Hook de dessin Canvas
    const canvasProps = useCanvasDrawing(
        playSound,
        game.setGameData,
        data?.grid_data ?? [],
        solutionsFound,
        game.ws,
        game.me?.id ?? '',
    );

    // Liste des mots trouvés
    const allWordsFound = useMemo(() => {
        return solutionsFound.map((sol) => sol.word);
    }, [solutionsFound]);

    if (!data || !data.grid_data) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-12 w-12 border-4 border-brand-pink border-t-transparent rounded-full" />
            </div>
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
                    wordsToFind={data.words_to_find}
                    wordsFound={allWordsFound}
                    gridSize={data.grid_data.length}
                />
            </div>
        </div>
    );
}
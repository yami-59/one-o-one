import { useEffect } from 'react';
import Title from '../components/Title'; 
import WordSearch  from '../wordsearch/components/WordSearch'; // Supposons que c'est un composant fonctionnel
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'; // 🎯 Importer le hook de contexte
import Loading from './Loading';

// NOTE: Le composant doit être dans un fichier .tsx (pour le JSX et TypeScript)

function GameRoomWordSearch() {

    // 1. Récupération des paramètres de l'URL (Game ID) et du token temporaire
    const params = useParams();
    const { gameId } = params; // Le gameId est une chaîne extraite de l'URL

    
    // 2. 🎯 CONSOMMATION DU CONTEXTE D'AUTHENTIFICATION
    const { 
        token, 
        userInfo, 
        isLoading, 
        isAuthenticated 
    } = useAuth();


        

    // 3. Logique de Démarrage (Débogage)
    useEffect(() => {
        // Cette vérification garantit que le code ne s'exécute qu'une fois toutes les données prêtes
        if (isAuthenticated && gameId && userInfo) {
            console.log(`Session démarrée. Partie ID: ${gameId}`);
            // 🎯 C'est ici que votre hook useWebSocket serait appelé
            // pour établir la connexion ws://.../ws/game/{gameId}/{playerId}
        }
    }, [isAuthenticated, gameId, userInfo]); // S'exécute si ces valeurs changent


    // --- 4. Affichage Conditionnel ---

    if (isLoading) {
        return  <Loading/>;
    }
    
    if (!isAuthenticated || !gameId || !userInfo || !token ) {
        return <div className="flex h-screen w-screen items-center justify-center text-red-400 bg-gray-900">Erreur critique: Données de session manquantes.</div>;
    }



    // 5. Rendu du Composant de Jeu
    return (
        <div className="flex h-screen w-screen flex-col items-center bg-gray-900">
            <Title />
            
            <div className="mt-5 flex items-center justify-center w-full">
                {/* 🎯 PASSAGE DES PROPS CRITIQUES AU COMPOSANT DE JEU */}
                <WordSearch 
                    gameId={gameId} 
                    user={userInfo}
                />
            </div>
            
        </div>
    );
}

export default GameRoomWordSearch;
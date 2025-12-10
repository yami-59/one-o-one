import Title from '../components/Title'; // Assurez-vous que le chemin est correct
import MatchMakingButton from '../components/MatchmakingButton'; // Assurez-vous que le chemin est correct
import { useAuth } from '../auth/AuthContext'; // 🎯 Importer le hook de contexte
import Loading from './Loading';


// Définissez le composant dans un fichier .tsx

function Example() {
    
    // 🎯 1. CONSOMMATION DU CONTEXTE
    const { token, userInfo, isLoading, isAuthenticated } = useAuth();




    

    // 2. Afficher un indicateur de chargement si la session est en cours de vérification
    if (isLoading) {
        return <Loading/>
    }
    
    // 3. Afficher un message si l'authentification a échoué (ce qui ne devrait pas arriver 
    // car fetchGuestToken crée un invité si nécessaire)
    if (!isAuthenticated || !token || !userInfo) {
        return (
            <div className="flex h-screen w-screen items-center justify-center text-red-400 bg-gray-900">
                Erreur: Connexion impossible.
            </div>
        );
    }

  

    // 4. Rendu de l'application principale si le token est disponible
    return (
        <div className="flex h-screen w-screen flex-col items-center bg-gray-900">
            
            <Title />
            
            {/* 🎯 Affichage de l'ID du joueur pour le débogage */}
            <p className="text-gray-400 mb-4 ">Player id : {userInfo.user_id}</p>
            <p className="text-gray-400 mb-4 ">Player username : {userInfo.username}</p>
            
            <div className="mt-50 flex items-center ">
                {/* 🎯 Passer le token et l'ID au composant de bouton */}
                <MatchMakingButton token={token} game_name='wordsearch'/> 
            </div>
            
        </div>
    );
}

export default Example;
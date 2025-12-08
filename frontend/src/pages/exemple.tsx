import Title from '../components/title'; // Assurez-vous que le chemin est correct
import MatchMakingButton from '../components/matchmakingButton'; // Assurez-vous que le chemin est correct
import { useAuth } from '../auth/AuthContext'; // 🎯 Importer le hook de contexte
import Loading from './Loading';
import { type UserInfo } from '../auth/AuthContext';


// Définissez le composant dans un fichier .tsx

function Exemple() {
    
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

    const user:UserInfo = JSON.parse(userInfo)

    // 4. Rendu de l'application principale si le token est disponible
    return (
        <div className="flex h-screen w-screen flex-col items-center bg-gray-900">
            
            <Title />
            
            {/* 🎯 Affichage de l'ID du joueur pour le débogage */}
            <p className="text-gray-400 mb-4 ">Player id : {user.user_id}</p>
            <p className="text-gray-400 mb-4 ">Player username : {user.username}</p>
            
            <div className="mt-50 flex items-center ">
                {/* 🎯 Passer le token et l'ID au composant de bouton */}
                <MatchMakingButton token={token} game_name='wordsearch'/> 
            </div>
            
        </div>
    );
}

export default Exemple;
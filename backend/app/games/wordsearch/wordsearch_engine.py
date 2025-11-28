from typing import List,Tuple,Dict,Any
from typing import Dict, Any, List, Tuple
from sqlmodel.ext.asyncio.session import AsyncSession
from redis.asyncio import Redis as AsyncRedis # Alias pour le client Redis asynchrone
from app.models.schemas import WordSearchState,WordSolution # Le schéma d'état spécifique
from app.models.tables import GameSession,User
from sqlmodel import select






class WordSearchEngine:
    """
    Gère la logique de validation, le chronométrage et la mise à jour 
    de l'état de la session de jeu Mot-Mêlé.
    """
    
    def __init__(self, game_id: str, db_session: AsyncSession, redis_client: AsyncRedis):
        """Initialise le moteur avec les ressources nécessaires."""
        self.game_id = game_id
        self.db_session = db_session
        self.redis = redis_client
        self.POINTS_PER_WORD = 10 

    # --- MÉTHODES DE GESTION DE L'ÉTAT (I/O) ---
    
    async def _get_game_state(self) -> WordSearchState:
        """Récupère l'état actuel de la partie depuis Redis."""
        # 1. Lire la chaîne JSON de l'état actif
        json_state = await self.redis.get(f"game:{self.game_id}")
        
        if not json_state:
            raise Exception("État de partie non trouvé dans Redis.")
        
        # 2. Désérialiser et valider le JSON en objet Python WordSearchState
        return WordSearchState.model_validate_json(json_state)

    async def _save_game_state(self, state: WordSearchState):
        """Sauvegarde l'état actuel de la partie dans Redis."""
        json_state = state.model_dump_json(indent=2)

        # Utilise SET avec TTL (Time To Live) si nécessaire, sinon sans TTL
        await self.redis.set(f"game:{self.game_id}", json_state)



        
    @staticmethod
    def reconstruct_word_from_coords (
            grid :List[List[str]],
            solution:WordSolution
            
    ) :

        # 1. Calcul de la Longueur (L, C)
        L1, C1 = solution.start_pos
        L2, C2 = solution.end_pos

        # Calcule le nombre d'étapes (différence maximale entre les coordonnées)
        num_steps = max(abs(L2 - L1), abs(C2 - C1))

        dl, dc = solution.direction
    
        reconstructed_word = [] # Utiliser une liste pour une construction efficace
        
        # 3. Itération sur chaque étape (0 à num_steps inclus)
        # Le mot a (num_steps + 1) lettres
        for i in range(num_steps + 1):
            row = L1 + i * dl
            col = C1 + i * dc

            # 4. Vérification des limites (même si direction est censé être valide)
            if not (0 <= row < len(grid) and 0 <= col < len(grid[0])):
                # Ne devrait pas arriver si le vecteur de direction est correct
                raise ValueError("Débordement de grille pendant la reconstruction.")

            # 5. Ajout de la lettre (Utilise append sur la liste)
            reconstructed_word.append(grid[row][col])
            
        # 6. Retourne la chaîne finale
        return "".join(reconstructed_word).upper()             
        

    async def validate_selection(self, player_id: str, selected_obj: WordSolution) -> Dict[str, Any]:
        """
        Vérifie si le mot sélectionné (word) est valide ET s'il correspond à une
        séquence de coordonnées (coordinates) dans la grille.
        """
        state = await self._get_game_state()
        
        # -----------------------------------------------------------
        # 🎯 1. VÉRIFICATION DE LA COHÉRENCE (Anti-Triche)
        # -----------------------------------------------------------
        
        # Hypothèse: Le moteur doit reconstruire le mot à partir des coordonnées et de la grille
        # Simuler la reconstruction pour cette étape :
        # Si la reconstruction échoue ou si le mot reconstruit ne correspond pas au mot soumis
        # (Par exemple, un joueur sélectionne des lettres au hasard)
        

        reconstructed_word = self.reconstruct_word_from_coords(
            state.grid_data, 
            selected_obj
        )

        print(f"{reconstructed_word}/{selected_obj.word}")

        
        if reconstructed_word != selected_obj.word:
            # Si la sélection sur la grille ne correspond pas au mot soumis
            return {"success": False, "reason": "La sélection de lettres ne correspond pas au mot."}
            
        # -----------------------------------------------------------
        # 2. VÉRIFICATION DE LA SOLUTION
        # -----------------------------------------------------------
        
        # Vérification que le mot soumis est bien une solution (et non pas juste des lettres aléatoires)


        solution_exists = any(selected_obj.word == sol.word for sol in state.solution_words)

        if not solution_exists:
            return {"success": False, "reason": "Mot non valide dans cette partie."}

        # 3. VÉRIFICATION DE LA NON-RÉUTILISATION
        found_by_any_player = any(selected_obj.word in words for words in state.words_found.values())
        
        if found_by_any_player:
            return {"success": False, "reason": "Mot déjà trouvé par un joueur."}
        
        # -----------------------------------------------------------
        # 4. SUCCÈS ET MISE À JOUR ATOMIQUE
        # -----------------------------------------------------------
        
        # Mise à jour du score
        # Utilisez .get() et mettez à jour la valeur
        new_score = state.realtime_score.get(player_id, 0) + self.POINTS_PER_WORD
        state.realtime_score[player_id] = new_score
        
        # Enregistrement du mot trouvé
        state.words_found.setdefault(player_id, []).append(selected_obj.word)
        
        # 5. Sauvegarde de l'état mis à jour dans Redis
        await self._save_game_state(state)
        
        return {
            "success": True, 
            "score_update": self.POINTS_PER_WORD, 
            "new_score": new_score,
            "word": selected_obj.word
        }


async def finalize_game(self):
    """
    Finalise la partie, calcule le score final et enregistre les résultats 
    dans PostgreSQL de manière transactionnelle.
    """
    
    # 1. Récupérer l'état final volatile (Redis)
    try:
        final_state = await self._get_game_state()
    except Exception:
        # Si Redis ne contient rien (partie abandonnée ou clé expirée), on s'arrête.
        return {"status": "error", "detail": "État de jeu non trouvé dans Redis."}
        
    final_scores = final_state.realtime_score
    
    # Les identifiants des joueurs sont les clés du dictionnaire de score
    player_a_id, player_b_id = tuple(final_scores.keys())

    # 2. Déterminer le Vainqueur et les Statuts
    score_a = final_scores.get(player_a_id, 0)
    score_b = final_scores.get(player_b_id, 0)
    
    if score_a > score_b:
        winner_id = player_a_id
        loser_id = player_b_id
    elif score_b > score_a:
        winner_id = player_b_id
        loser_id = player_a_id
    else:
        winner_id = None # Match nul
        loser_id = None
        
    # --- DÉBUT DE LA TRANSACTION CRITIQUE (PostgreSQL) ---
    # Cette transaction doit réussir ou échouer en bloc (Atomicité).
    try:
        # 3. Récupérer la GameSession et les utilisateurs
        game_session : GameSession = (await self.db_session.exec(
            select(GameSession).where(GameSession.game_id == self.game_id)
        )).first()
        
        user_query = select(User).where(User.identifier.in_([player_a_id, player_b_id]))
        users_result = await self.db_session.exec(user_query)
        users = users_result.all()
        
        if not game_session or len(users) < 2:
            raise Exception("Ressources DB manquantes pour la finalisation.")

        # 4. Mise à jour des objets
        game_session.status = "finished" # Marquer la partie comme terminée
        game_session.game_data = self._get_game_state(self)
        game_session.winner_id=winner_id
        
        for user in users:
            if user.identifier == winner_id:
                user.victories += 1
                user.points += final_scores[user.identifier]
            elif user.identifier == loser_id:
                user.defeats += 1
            
            # Note : Les utilisateurs qui font match nul n'ont pas leur V/D mis à jour, 
            # mais leur score est mis à jour.
            
            self.db_session.add(user) # Marquer pour mise à jour

        # 5. Exécution et Commit
        self.db_session.add(game_session)
        await self.db_session.commit()
        
        # 6. Nettoyage de Redis (Executed seulement si le commit PostgreSQL réussit)
        await self.redis.delete(f"game:{self.game_id}")
        
        return {
            "status": "finalized", 
            "winner": winner_id, 
            "score_a": score_a, 
            "score_b": score_b,
            "message": "Résultat enregistré avec succès."
        }
        
    except Exception as e:
        # En cas d'erreur DB (ex: connexion perdue), on tente un rollback
        await self.db_session.rollback()
        raise Exception(f"Échec de la finalisation DB: {e}")


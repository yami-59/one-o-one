# /backend/app/game_engine/wordsearch_game.py (suite)

from .wordsearch_engine import WordSearchEngine # Importe le moteur de validation
from sqlmodel.ext.asyncio.session import AsyncSession
from redis.asyncio import Redis as AsyncRedis
from .wordsearch_generator import WordSearchGenerator
from app.models.schemas import WordSearchState
from typing import List,Any,Dict
from app.utils.enums import Status,GameName
from app.models.schemas import WordSearchState,WordSolution # Le schéma d'état spécifique
import asyncio
class WordGame:
    """
    Contrôleur de haut niveau pour une session de jeu Mot-Mêlé.
    Gère la création de l'état initial et le passage des actions au moteur.
    """
    
    def __init__(self, game_id: str, db_session: AsyncSession, redis_client: AsyncRedis, word_list: List[str]):

        # Composition : Initialisation des dépendances internes
        self.generator = WordSearchGenerator(word_list)
        self.engine = WordSearchEngine(game_id, db_session, redis_client)


        self.timeout_task = None 
        self.GAME_DURATION_SECONDS = 180


    async def _schedule_timeout(self):
        """Tâche d'arrière-plan pour attendre 3 minutes et terminer le jeu."""
        try:
            print(f"⏳ Minuteur démarré pour la partie {self.game_id} ({self.GAME_DURATION_SECONDS}s).")
            
            # 1. Attend le temps imparti de manière non-bloquante
            await asyncio.sleep(self.GAME_DURATION_SECONDS)
            
            # 2. Déclenchement de la fin de partie
            print(f"⌛ Temps écoulé pour la partie {self.game_id}. Finalisation...")
            await self.engine.finalize_game() 
            
            # 3. Notifier les joueurs via Pub/Sub (simulé)
            await self.engine.redis.publish(
                f"game_channel:{self.game_id}", 
                '{"type": "timeout", "message": "Le temps est écoulé!"}'
            )

        except asyncio.CancelledError:
            # Gérer l'annulation si la partie se termine plus tôt (par abandon)
            print(f"Minuteur annulé pour la partie {self.game_id}.")
        except Exception as e:
            print(f"Erreur fatale dans le minuteur du jeu : {e}")

    async def initialize_and_start_game(self) -> WordSearchState:
        """
        Génère la grille, crée l'état initial du jeu, et le sauvegarde.
        """
        # 1. Génération de la grille et des solutions
        grid_data, solutions = self.generator.generate()
        
        # 2. Création de l'état initial (avec le bon type)
        initial_state = WordSearchState(
            game_name=GameName.wordsearch,
            grid_data=grid_data,
            solution_words=solutions,
            current_status=Status.active
            # Note: start_time est géré par default_factory
        )
        
        # 3. Sauvegarde dans Redis (pour l'état actif)
        await self.engine._save_game_state(initial_state)
        
        # 4. (Optionnel) Mise à jour de la GameSession PostgreSQL si nécessaire
        
        
        
        # Démarrage du Minuteur Actif
        # Crée la tâche d'arrière-plan pour la boucle d'événements
        self.timeout_task = asyncio.create_task(self._schedule_timeout())


        return initial_state

    async def process_player_action(self, player_id: str, selected_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Passe l'action du joueur au moteur pour validation et mise à jour de l'état.
        """
        # 1. Le moteur s'assure que le mot est valide, non trouvé et met à jour le score/Redis

        selected_obj = WordSolution.model_validate(selected_data)
        validation_result = await self.engine.validate_selection(player_id, selected_obj)
        

        return validation_result
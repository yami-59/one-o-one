from typing import Any, Dict, List

from redis.asyncio import Redis as AsyncRedis
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.schemas import WordSearchState, WordSolution, Index,WordSearchSolutionData
from app.models.tables import GameSession, User
from app.games.constants import GameStatus
from app.games.wordsearch.redis_keys import redis_state_key,redis_solution_key


class WordSearchEngine:
    """Gère la logique de validation du jeu Mot-Mêlé."""

    POINTS_PER_WORD = 10

    def __init__(
        self,
        game_id: str,
        db_session: AsyncSession,
        redis_client: AsyncRedis,
    ):
        self._game_id = game_id
        self._db_session = db_session
        self._redis = redis_client
        self._solution_data_cache: WordSearchSolutionData | None = None

    async def _get_solution_data(self) -> WordSearchSolutionData:
        """Récupère les solutions depuis Redis (avec cache)."""
        if self._solution_data_cache is None:
            json_data = await self._redis.get(redis_solution_key(self._game_id))
            if not json_data:
                raise ValueError(f"Solutions non trouvées pour {self._game_id}.")
            self._solution_data_cache = WordSearchSolutionData.model_validate_json(json_data)
        return self._solution_data_cache

    

    # --- MÉTHODES DE GESTION DE L'ÉTAT (I/O) ---

    async def _get_game_state(self) -> WordSearchState:
        """Récupère l'état actuel de la partie depuis Redis."""
        json_state = await self._redis.get(redis_state_key(self._game_id))

        if not json_state:
            raise ValueError(f"État de partie {self._game_id} non trouvé dans Redis.")

        return WordSearchState.model_validate_json(json_state)

    async def _save_game_state(self, state: WordSearchState) -> None:
        """Sauvegarde l'état actuel de la partie dans Redis."""
        json_state = state.model_dump_json()
        await self._redis.set(redis_state_key(self._game_id), json_state)

    @staticmethod
    def _calculate_direction(start: Index, end: Index) -> tuple[int, int, int]:
        """
        Calcule la direction et le nombre de pas entre deux positions.
        Retourne (dr, dc, steps).
        Lève ValueError si la sélection n'est pas colinéaire.
        """
        delta_r = end.row - start.row
        delta_c = end.col - start.col
        abs_delta_r = abs(delta_r)
        abs_delta_c = abs(delta_c)

        # Vérification de colinéarité (horizontal, vertical ou diagonal)
        is_horizontal = abs_delta_r == 0
        is_vertical = abs_delta_c == 0
        is_diagonal = abs_delta_r == abs_delta_c

        if not (is_horizontal or is_vertical or is_diagonal):
            raise ValueError("Sélection invalide: non colinéaire.")

        steps = max(abs_delta_r, abs_delta_c)
        dr = (delta_r // abs_delta_r) if delta_r != 0 else 0
        dc = (delta_c // abs_delta_c) if delta_c != 0 else 0

        return dr, dc, steps

    @staticmethod
    def reconstruct_word(grid: List[List[str]], solution: WordSolution) -> str:
        """Reconstruit le mot à partir de la grille et des coordonnées."""
        start = solution.start_index
        end = solution.end_index

        # Cas d'une seule lettre
        if start.row == end.row and start.col == end.col:
            return grid[start.row][start.col].upper()

        dr, dc, steps = WordSearchEngine._calculate_direction(start, end)

        letters = []
        for i in range(steps + 1):
            row = start.row + i * dr
            col = start.col + i * dc

            if not (0 <= row < len(grid) and 0 <= col < len(grid[0])):
                raise ValueError("Débordement de grille.")

            letters.append(grid[row][col])

        return "".join(letters).upper()

    async def validate_selection(
        self,
        player_id: str,
        selected_obj: WordSolution,
    ) -> Dict[str, Any]:
        """Vérifie si le mot sélectionné est valide et met à jour l'état."""
        state = await self._get_game_state()
        solution_data = await self._get_solution_data()  # ← Utilise le cache

        # 1. Reconstruction et vérification anti-triche
        try:
            reconstructed_word = self.reconstruct_word(state.grid_data, selected_obj)
        except ValueError as e:
            return {"success": False, "reason": str(e)}

        if reconstructed_word != selected_obj.word.upper():
            return {
                "success": False,
                "reason": "La sélection ne correspond pas au mot soumis.",
            }

        # 2. Vérification que le mot est une solution
        is_valid_solution = any(
            selected_obj.word.upper() == sol.word.upper()
            for sol in solution_data.solutions  # ← Utilise solution_data
        )

        if not is_valid_solution:
            return {"success": False, "reason": "Mot non valide dans cette partie."}

        # 3. Vérification que le mot n'a pas déjà été trouvé
        already_found = any(
            selected_obj.word.upper() in [w.word.upper() for w in words]
            for words in state.words_found.values()
        )

        if already_found:
            return {"success": False, "reason": "Mot déjà trouvé."}

        # 4. Mise à jour atomique
        current_score = state.realtime_score.get(player_id, 0)
        new_score = current_score + self.POINTS_PER_WORD
        state.realtime_score[player_id] = new_score

        player_words = state.words_found.setdefault(player_id, [])
        player_words.append(selected_obj)


        await self._save_game_state(state)

        return {
            "success": True,
            "new_solution": selected_obj.model_dump(),
            "score_update": self.POINTS_PER_WORD,
            "new_score": new_score,
        }

    async def finalize_game(self) -> Dict[str, Any]:
        """
        Finalise la partie et enregistre les résultats en base.
        """
        # 1. Récupérer l'état final
        try:
            final_state = await self._get_game_state()
        except ValueError:
            return {"status": "error", "detail": "État de jeu non trouvé."}

        final_scores = final_state.realtime_score
        player_ids = list(final_scores.keys())

        if len(player_ids) < 2:
            return {"status": "error", "detail": "Pas assez de joueurs."}

        player_a_id, player_b_id = player_ids[0], player_ids[1]
        score_a = final_scores.get(player_a_id, 0)
        score_b = final_scores.get(player_b_id, 0)

        # 2. Déterminer le vainqueur
        winner_id, loser_id = self._determine_winner(
            player_a_id, score_a, player_b_id, score_b
        )

        # 3. Transaction DB
        try:
            await self._persist_results(
                player_a_id=player_a_id,
                player_b_id=player_b_id,
                winner_id=winner_id,
                loser_id=loser_id,
                final_scores=final_scores,
                final_state=final_state,
            )
        except Exception as e:
            await self._db_session.rollback()
            return {"status": "error", "detail": f"Échec DB: {e}"}

        # 4. Nettoyage Redis
        await self._redis.delete(redis_state_key(self._game_id))

        return {
            "status": GameStatus.GAME_FINISHED,
            "winner": winner_id,
            "scores": {player_a_id: score_a, player_b_id: score_b},
        }

    @staticmethod
    def _determine_winner(
        player_a_id: str,
        score_a: int,
        player_b_id: str,
        score_b: int,
    ) -> tuple[str | None, str | None]:
        """Détermine le gagnant et le perdant."""
        if score_a > score_b:
            return player_a_id, player_b_id
        elif score_b > score_a:
            return player_b_id, player_a_id
        return None, None  # Match nul

    async def _persist_results(
        self,
        player_a_id: str,
        player_b_id: str,
        winner_id: str | None,
        loser_id: str | None,
        final_scores: Dict[str, int],
        final_state: WordSearchState,
    ) -> None:
        """Persiste les résultats en base de données."""
        # Récupérer la session de jeu
        result = await self._db_session.exec(
            select(GameSession).where(GameSession.game_id == self._game_id)
        )
        game_session = result.first()

        if not game_session:
            raise ValueError("GameSession non trouvée.")

        # Récupérer les utilisateurs
        user_result = await self._db_session.exec(
            select(User).where(User.user_id.in_([player_a_id, player_b_id]))
        )
        users = {user.user_id: user for user in user_result.all()}

        if len(users) < 2:
            raise ValueError("Utilisateurs non trouvés.")

        # Mise à jour de la GameSession
        game_session.status = GameStatus.GAME_FINISHED
        game_session.game_data = final_state.model_dump()
        game_session.winner_id = winner_id

        # Mise à jour des stats joueurs
        for user_id, user in users.items():
            user.points += final_scores.get(user_id, 0)

            if user_id == winner_id:
                user.victories += 1
            elif user_id == loser_id:
                user.defeats += 1
            # Match nul: seuls les points sont ajoutés

        await self._db_session.commit()
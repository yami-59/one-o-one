# /backend/app/games/wordsearch/wordsearch_engine.py

from typing import Any, Dict, List
from enum import Enum

from redis.asyncio import Redis as AsyncRedis
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.schemas import WordSearchState, WordSolution, Index, WordSearchSolutionData
from app.models.tables import GameSession, User
from app.games.constants import GameStatus
from app.games.constants import GAME_STATE_KEY_PREFIX, SOLUTION_KEY_PREFIX


class WordDirection(str, Enum):
    """Direction du mot dans la grille."""
    HORIZONTAL_RIGHT = "horizontal_right"    # → Sens de lecture
    HORIZONTAL_LEFT = "horizontal_left"      # ← Sens inverse
    VERTICAL_DOWN = "vertical_down"          # ↓ Haut vers bas
    VERTICAL_UP = "vertical_up"              # ↑ Bas vers haut
    DIAGONAL_DOWN_RIGHT = "diagonal_down_right"  # ↘
    DIAGONAL_DOWN_LEFT = "diagonal_down_left"    # ↙
    DIAGONAL_UP_RIGHT = "diagonal_up_right"      # ↗
    DIAGONAL_UP_LEFT = "diagonal_up_left"        # ↖
    SINGLE_LETTER = "single_letter"          # Un seul caractère


class WordSearchEngine:
    """Gère la logique de validation du jeu Mot-Mêlé."""

    # =========================================================================
    # SYSTÈME DE POINTS
    # =========================================================================
    
    # Points de base par direction (du plus facile au plus difficile)
    DIRECTION_POINTS: Dict[WordDirection, int] = {
        WordDirection.SINGLE_LETTER: 0,           # Pas de points pour une lettre
        WordDirection.HORIZONTAL_RIGHT: 5,        # → Facile (sens de lecture)
        WordDirection.HORIZONTAL_LEFT: 8,         # ← Moyen (sens inverse)
        WordDirection.VERTICAL_DOWN: 10,          # ↓ Moyen+
        WordDirection.VERTICAL_UP: 12,            # ↑ Difficile
        WordDirection.DIAGONAL_DOWN_RIGHT: 15,    # ↘ Difficile
        WordDirection.DIAGONAL_DOWN_LEFT: 18,     # ↙ Très difficile
        WordDirection.DIAGONAL_UP_RIGHT: 18,      # ↗ Très difficile
        WordDirection.DIAGONAL_UP_LEFT: 20,       # ↖ Expert
    }

    # Bonus par longueur de mot
    LENGTH_BONUS_THRESHOLD = 5  # Bonus à partir de 5 lettres
    LENGTH_BONUS_PER_LETTER = 2  # +2 points par lettre au-delà du seuil

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

    # =========================================================================
    # CALCUL DE DIRECTION ET POINTS
    # =========================================================================

    @staticmethod
    def _determine_direction(start: Index, end: Index) -> WordDirection:
        """
        Détermine la direction du mot basée sur les indices de début et fin.
        """
        delta_r = end.row - start.row
        delta_c = end.col - start.col

        # Cas d'une seule lettre
        if delta_r == 0 and delta_c == 0:
            return WordDirection.SINGLE_LETTER

        # Horizontal
        if delta_r == 0:
            return WordDirection.HORIZONTAL_RIGHT if delta_c > 0 else WordDirection.HORIZONTAL_LEFT

        # Vertical
        if delta_c == 0:
            return WordDirection.VERTICAL_DOWN if delta_r > 0 else WordDirection.VERTICAL_UP

        # Diagonal
        if delta_r > 0 and delta_c > 0:
            return WordDirection.DIAGONAL_DOWN_RIGHT  # ↘
        elif delta_r > 0 and delta_c < 0:
            return WordDirection.DIAGONAL_DOWN_LEFT   # ↙
        elif delta_r < 0 and delta_c > 0:
            return WordDirection.DIAGONAL_UP_RIGHT    # ↗
        else:
            return WordDirection.DIAGONAL_UP_LEFT     # ↖

    def _calculate_points(self, word: str, direction: WordDirection) -> Dict[str, Any]:
        """
        Calcule les points pour un mot trouvé.
        
        Returns:
            Dict avec le détail des points:
            - base_points: Points de base pour la direction
            - length_bonus: Bonus de longueur
            - total_points: Total
            - direction: La direction détectée
        """
        # Points de base selon la direction
        base_points = self.DIRECTION_POINTS.get(direction, 5)

        # Bonus de longueur
        word_length = len(word)
        length_bonus = 0
        if word_length > self.LENGTH_BONUS_THRESHOLD:
            extra_letters = word_length - self.LENGTH_BONUS_THRESHOLD
            length_bonus = extra_letters * self.LENGTH_BONUS_PER_LETTER

        total_points = base_points + length_bonus

        return {
            "base_points": base_points,
            "length_bonus": length_bonus,
            "total_points": total_points,
            "direction": direction.value,
            "word_length": word_length,
        }

    # =========================================================================
    # MÉTHODES DE GESTION DE L'ÉTAT (I/O)
    # =========================================================================

    async def _get_solution_data(self) -> WordSearchSolutionData:
        """Récupère les solutions depuis Redis (avec cache)."""
        if self._solution_data_cache is None:
            json_data = await self._redis.get(f"{SOLUTION_KEY_PREFIX}{self._game_id}")
            if not json_data:
                raise ValueError(f"Solutions non trouvées pour {self._game_id}.")
            self._solution_data_cache = WordSearchSolutionData.model_validate_json(json_data)
        return self._solution_data_cache

    async def _get_game_state(self) -> WordSearchState:
        """Récupère l'état actuel de la partie depuis Redis."""
        json_state = await self._redis.get(f"{GAME_STATE_KEY_PREFIX}{self._game_id}")

        if not json_state:
            raise ValueError(f"État de partie {self._game_id} non trouvé dans Redis.")

        return WordSearchState.model_validate_json(json_state)

    async def _save_game_state(self, state: WordSearchState) -> None:
        """Sauvegarde l'état actuel de la partie dans Redis."""
        json_state = state.model_dump_json()
        await self._redis.set(f"{GAME_STATE_KEY_PREFIX}{self._game_id}", json_state)

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

    # =========================================================================
    # VALIDATION ET SCORING
    # =========================================================================

    async def check_all_solutions_found(self):
        """Vérifie si toutes les solutions ont été trouvées."""
        state = await self._get_game_state()
        solution_data = await self._get_solution_data()

        total_found = len([word for sublist in state.words_found.values() for word in sublist])
        
        if total_found >= len(solution_data.solutions):
            return await self.finalize_game("all_solutions_found")
        
        return None

    async def validate_selection(
        self,
        player_id: str,
        selected_obj: WordSolution,
    ) -> Dict[str, Any]:
        """Vérifie si le mot sélectionné est valide et met à jour l'état."""
        state = await self._get_game_state()
        solution_data = await self._get_solution_data()

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
            for sol in solution_data.solutions
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

        # 4. 🎯 Calcul des points selon la direction
        direction = self._determine_direction(selected_obj.start_index, selected_obj.end_index)
        points_detail = self._calculate_points(selected_obj.word, direction)
        points_earned = points_detail["total_points"]

        # 5. Mise à jour atomique
        current_score = state.realtime_score.get(player_id, 0)
        new_score = current_score + points_earned
        state.realtime_score[player_id] = new_score

        player_words = state.words_found.setdefault(player_id, [])
        player_words.append(selected_obj)

        await self._save_game_state(state)

        return {
            "success": True,
            "new_solution": selected_obj.model_dump(),
            "points_detail": points_detail,  # 🎯 Détail des points
            "points_earned": points_earned,
            "new_score": new_score,
        }

    # =========================================================================
    # FINALISATION
    # =========================================================================

    async def finalize_game(self, reason: str) -> Dict[str, Any]:
        """Finalise la partie et enregistre les résultats en base."""
        try:
            final_state = await self._get_game_state()
        except ValueError:
            return {"status": "error", "detail": "État de jeu non trouvé."}

        final_scores = final_state.realtime_score
        player_ids = list(final_scores.keys())

        player_a_id, player_b_id = player_ids[0], player_ids[1]
        score_a = final_scores.get(player_a_id, 0)
        score_b = final_scores.get(player_b_id, 0)

        winner_id, loser_id = self._determine_winner(
            player_a_id, score_a, player_b_id, score_b
        )

        # Nettoyage Redis
        await self._redis.delete(f"{GAME_STATE_KEY_PREFIX}{self._game_id}")

        return {
            "status": GameStatus.GAME_FINISHED,
            "winner_id": winner_id,
            "loser_id": loser_id,
            "scores": {player_a_id: score_a, player_b_id: score_b},
            "reason": reason,
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
        return None, None

"""

```

## Résumé du système de points

| Direction | Symbole | Points | Difficulté |
|-----------|---------|--------|------------|
| Horizontal droite | → | 5 | Facile |
| Horizontal gauche | ← | 8 | Moyen |
| Vertical bas | ↓ | 10 | Moyen+ |
| Vertical haut | ↑ | 12 | Difficile |
| Diagonal bas-droite | ↘ | 15 | Difficile |
| Diagonal bas-gauche | ↙ | 18 | Très difficile |
| Diagonal haut-droite | ↗ | 18 | Très difficile |
| Diagonal haut-gauche | ↖ | 20 | Expert |

## Bonus de longueur

| Longueur | Bonus |
|----------|-------|
| ≤ 5 lettres | 0 |
| 6 lettres | +2 |
| 7 lettres | +4 |
| 8 lettres | +6 |
| etc. | +2 par lettre |

## Exemple de calcul
```
Mot: "PYTHON" (6 lettres)
Direction: Diagonal haut-gauche (↖)

Base points: 20
Length bonus: (6 - 5) × 2 = 2
Total: 22 points




"""
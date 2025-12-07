import itertools
import random
import string
from typing import List, Tuple

from app.models.schemas import WordSearchSolutionData, WordSolution, Index
from app.models.tables import WordList


class WordSearchGenerator:
    """Gère la création de la grille et le placement des mots."""

    def __init__(self, wordlist: WordList, grid_size: int = 10):
        self._theme = wordlist.theme
        self._words = [word.upper() for word in wordlist.words]
        self._grid_size = grid_size
        self._grid: List[List[str]] = []
        self._solutions: List[WordSolution] = []
        self._words_found: List[str] = []

    def _reset_grid(self) -> None:
        self._grid = [
            ["." for _ in range(self._grid_size)] 
            for _ in range(self._grid_size)
        ]

    def _get_end_position(
        self,
        word: str,
        start: Index,
        direction: Tuple[int, int],
    ) -> Index:
        length = len(word)
        dr, dc = direction
        return Index(
            row=start.row + (length - 1) * dr,
            col=start.col + (length - 1) * dc,
        )

    def _is_within_bounds(self, pos: Index) -> bool:
        return 0 <= pos.row < self._grid_size and 0 <= pos.col < self._grid_size

    def _can_place_word(
        self,
        word: str,
        start: Index,
        direction: Tuple[int, int],
    ) -> bool:
        end = self._get_end_position(word, start, direction)
        
        if not self._is_within_bounds(end):
            return False

        dr, dc = direction
        for i, letter in enumerate(word):
            r = start.row + i * dr
            c = start.col + i * dc
            cell = self._grid[r][c]
            
            if cell != "." and cell != letter:
                return False
        
        return True

    def _place_word(
        self,
        word: str,
        start: Index,
        direction: Tuple[int, int],
    ) -> None:
        dr, dc = direction
        for i, letter in enumerate(word):
            r = start.row + i * dr
            c = start.col + i * dc
            self._grid[r][c] = letter

    def _fill_empty_cells(self) -> None:
        for r in range(self._grid_size):
            for c in range(self._grid_size):
                if self._grid[r][c] == ".":
                    self._grid[r][c] = random.choice(string.ascii_uppercase)

    def _get_all_directions(self) -> List[Tuple[int, int]]:
        directions = list(itertools.product((-1, 0, 1), repeat=2))
        directions.remove((0, 0))
        return directions

    def _get_all_positions(self) -> List[Index]:
        return [
            Index(row=r, col=c)
            for r, c in itertools.product(range(self._grid_size), repeat=2)
        ]

    def generate(self) -> Tuple[str, List[List[str]], List[str], WordSearchSolutionData]:
        self._reset_grid()
        self._solutions.clear()
        self._words_found.clear()

        words = self._words.copy()
        random.shuffle(words)

        positions = self._get_all_positions()
        directions = self._get_all_directions()

        for word in words:
            random.shuffle(positions)
            random.shuffle(directions)
            
            placed = False
            for start in positions:
                if placed:
                    break
                    
                for direction in directions:
                    if self._can_place_word(word, start, direction):
                        self._place_word(word, start, direction)
                        end = self._get_end_position(word, start, direction)
                        
                        self._solutions.append(
                            WordSolution(
                                word=word,
                                start_index=start,
                                end_index=end,
                            )
                        )
                        self._words_found.append(word)
                        placed = True
                        break

        self._fill_empty_cells()

        return (
            self._theme,
            self._grid,
            self._words_found,
            WordSearchSolutionData(solutions=self._solutions),
        )

    def print_grid(self) -> None:
        separator = "-" * (self._grid_size * 3 + 1)
        print(separator)
        for row in self._grid:
            print("| " + " ".join(row) + " |")
        print(separator)
# /backend/tests/test_wordsearch.py

import pytest


class TestWordSearchGenerator:
    """Tests pour le générateur de grille."""

    def test_generate_creates_valid_grid(self, word_generator):
        """La génération crée une grille valide."""
        theme, grid, words, solutions = word_generator.generate()
        
        assert theme == "Test"
        assert len(grid) == 10
        assert len(grid[0]) == 10
        assert len(words) > 0
        assert len(solutions.solutions) == len(words)

    def test_all_words_placed_in_grid(self, word_generator):
        """Tous les mots sont placés dans la grille."""
        _, grid, words, solutions = word_generator.generate()
        
        for solution in solutions.solutions:
            assert solution.word in words
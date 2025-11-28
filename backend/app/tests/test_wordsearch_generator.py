from app.utils.enums import Direction
from app.games.wordsearch.wordsearch_engine import WordSearchEngine


# ----------------------------------------------------------------------
# TESTS DES COMPOSANTS INTERNES
# ----------------------------------------------------------------------

def test_random_letter_creation(generator):
    """Vérifie que la lettre aléatoire est une majuscule de l'alphabet."""
    letter = generator._random_letter()
    assert len(letter) == 1
    assert ord(letter) <= ord('Z') and ord(letter)>=ord('A')

def test_check_fit_valid_placement(generator):
    """Teste le placement d'un mot simple sur une grille vide."""
    
    # Tentative de placement de 'DEV' à partir de (0, 0) vers BAS_DROITE
    is_valid = generator._check_fit("DEV", (0, 0), Direction.BAS_DROITE)
    assert is_valid is True

def test_check_fit_invalid_collision(generator):
    """Teste un conflit de lettres invalide (la cellule est occupée par une lettre différente)."""
    
    # Grille 3x3 simple pour isoler le test (taille: 3x3)
    
    # 🎯 Création de la grille de test (3x3 pour la simplicité)
    generator.grid = [
        ['.', 'Z', '.'],  # Conflit : Position (0, 1) contient 'Z'
        ['.', '.', '.'], 
        ['.', '.', '.']
    ]
    
    # Mot à Placer : "ABC"
    # L'algorithme essaiera de placer 'B' à la position (0, 1) qui contient 'Z'.
    is_valid = generator._check_fit("ABC", (0, 0), Direction.DROITE)
    
    # 🎯 L'assertion est correcte : le placement doit échouer
    assert is_valid is False
    
    
def test_check_fit_valid_overlap(generator):
    """Teste un croisement valide (la lettre est la même)."""
    generator.grid = [
        ['.', 'T', '.'], 
        ['.', '.', '.'], 
        ['.', '.', '.']
    ]
    
    # L'algorithme essaiera de placer 'T' à (0, 1) qui contient déjà 'T'.
    
    is_valid = generator._check_fit("TI", (0, 1), Direction.DROITE)
    
    # Le placement est valide car la lettre est la même.
    assert is_valid is True


# ----------------------------------------------------------------------
# TEST DE L'ALGORITHME DE GÉNÉRATION COMPLET
# ----------------------------------------------------------------------

def test_generate_full_grid(generator):
    """Vérifie que la grille est générée, que les mots sont placés, et que le remplissage est effectué."""
    
    # Exécuter l'algorithme de génération
    grid, solutions = generator.generate()
    
    # 1. Vérification de la taille de la grille
    assert len(grid) == 10
    assert all(len(row) == 10 for row in grid)
    
    # 2. Vérification du remplissage aléatoire (pas de points '.' restants)
    assert all("." not in row for row in grid), "La grille contient des cellules non remplies ('.')."
    
    # 3. Vérification des solutions
    # Les solutions doivent être un sous-ensemble des mots initiaux (certains peuvent échouer à se placer)
    assert len(solutions) > 0, "Aucun mot n'a été placé dans la grille."
    
    # 4. Vérification de la cohérence de la solution (vérifie si la solution existe dans la grille)
    for solution in solutions:
        word = WordSearchEngine.reconstruct_word_from_coords(grid,solution)

        assert word == solution.word
        

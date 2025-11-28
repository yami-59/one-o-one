from typing import List,Tuple,Dict,Any
import random
import itertools
from typing import  List, Tuple
from app.models.schemas import WordSolution # Le schéma d'état spécifique
from app.utils.enums import Direction





class WordSearchGenerator:
    """
    Gère la création de la grille et le placement des mots.
    """
   

    def __init__(self, word_list: List[str], grid_size: int = 10):
        self.word_list = word_list
        self.grid_size = grid_size
        self.grid = [["." for _ in range(self.grid_size)] for _ in range(self.grid_size)]
        self.solutions : List[WordSolution] = []
        
        # Convertir tous les mots en majuscules à l'initialisation
        self.word_list = [word.upper() for word in self.word_list]


    # ----------------------------------------------------------------------
    # MÉTHODES UTILITAIRES (Méthodes d'instance si elles utilisent self.grid_size)
    # ----------------------------------------------------------------------

    def _getEndPos(
        self,
        word: str, # ⚠️ Type hint corrigé en str
        startPostion: Tuple[int, int],
        direction: Direction,
    ) -> Tuple[int, int]:
        
        M = len(word) # Longueur du mot
        dl, dc = direction.value
        start_row, start_col = startPostion
        
        final_row = start_row + (M - 1) * dl
        final_col = start_col + (M - 1) * dc

        return (final_row, final_col)
    
    
    def _check_fit(
        self,
        word: str,
        startPostion: Tuple[int, int],
        direction: Direction,
    ) -> bool:
        
        M = len(word)
        start_row, start_col = startPostion
        dl, dc = direction.value

        # 1. VÉRIFICATION DES LIMITES
        final_row, final_col = self._getEndPos(word, startPostion, direction)


        if not (0 <= final_row < self.grid_size and 0 <= final_col < self.grid_size):
            return False
            
        # 2. VÉRIFICATION DES COLLISIONS ET CROISEMENTS
        for i in range(M):
            r = start_row + i * dl
            c = start_col + i * dc
            
            target_letter = word[i].upper()
            current_cell_content = self.grid[r][c] # 🎯 Utilise la grille d'instance


            if current_cell_content != ".":
                if current_cell_content != target_letter:
                    return False
        return True

    def _fill_grid(
        self,
        word: str,
        startPostion: Tuple[int, int],
        direction: Direction,
    ):
        
        M = len(word)
        dl, dc = direction.value
        start_row, start_col = startPostion

        for i in range(M):
            r = start_row + i * dl
            c = start_col + i * dc

            self.grid[r][c] = word[i] # 🎯 Modifie la grille d'instance


    def _random_letter(self):
         # --- Logique d'assignation ---

        #  Générer un entier aléatoire entre 0 et 25 (pour A + 0 à A + 25)

        rand = random.randint(0, 26 - 1)

        #  Trouver le code Unicode de 'A'

        code_A = ord('A')

        # Calculer le code Unicode de la lettre désirée

        code_lettre_aleatoire = code_A + rand

        #  Convertir le code en caractère

        lettre_aleatoire = chr(code_lettre_aleatoire)

        return lettre_aleatoire


    def _print_grid(self): # Imprime la grille de l'instance
        """Affiche la grille du mot-mêlé dans le terminal."""
        print("-" * (self.grid_size * 3 + 1))
        for row in self.grid:
            print("| " + " ".join(row) + " |")
        print("-" * (self.grid_size * 3 + 1))

    # ----------------------------------------------------------------------
    # MÉTHODE PRINCIPALE DE GÉNÉRATION
    # ----------------------------------------------------------------------

    def generate(self) -> Tuple[List[List[str]], List[WordSolution]]: 
        
        # 🎯 Mélanger les mots pour un placement aléatoire
        random.shuffle(self.word_list)
        
        # 1. Préparer toutes les positions de départ aléatoires (produit cartésien)
        all_coordinates = list(itertools.product(range(self.grid_size), repeat=2))
        random.shuffle(all_coordinates) 

        # 2. Boucle Principale de Placement
        for word in self.word_list:
            word_placed = False
            shuffled_directions = list(Direction) 
            random.shuffle(shuffled_directions)

            for start_row, start_col in all_coordinates:
                start_pos = (start_row, start_col)

                for direction in shuffled_directions :
                    # 3. Vérification : Utilise self._check_fit
                    if self._check_fit(word, start_pos, direction): 

                        # 4. Placement réussi
                        self._fill_grid(word, start_pos, direction)
                        
                        # 5. Enregistrement de la solution
                        end_pos = self._getEndPos(word, start_pos, direction)
                        
                        self.solutions.append(
                            WordSolution(
                                word=word,
                                start_pos=start_pos,
                                end_pos=end_pos,
                                direction=direction.value
                            )
                        )
                        word_placed = True
                        break # Sortir de la boucle des directions
                
                if word_placed:
                    break # Sortir de la boucle des positions (passer au mot suivant)
            
        # 6. Remplissage des cases vides
        for r in range(self.grid_size):
            for c in range(self.grid_size):
                if self.grid[r][c] == ".":
                    # 🎯 Appel de la méthode statique via le nom de la classe
                    self.grid[r][c] = self._random_letter() 
                    
        self._print_grid() # Affichage final
        
        return self.grid, self.solutions
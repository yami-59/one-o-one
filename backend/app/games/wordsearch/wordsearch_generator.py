from typing import List,Tuple,Dict,Any
import random
import itertools
from typing import  List, Tuple
from app.models.schemas import WordSolution # Le schéma d'état spécifique





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
        start_index: Dict[str,int],
        direction: Tuple[int,int],
    ) -> Dict[str, int]:
        
        M = len(word) # Longueur du mot
        dl, dc = direction
        
        final_row = start_index['row'] + (M - 1) * dl
        final_col = start_index['col'] + (M - 1) * dc

        return {"row":final_row,"col": final_col}
    
    
    def _check_fit(
        self,
        word: str,
        start_index: Dict[str,int],
        direction: Tuple[int,int],
    ) -> bool:
        
        M = len(word)
        dl, dc = direction

        # 1. VÉRIFICATION DES LIMITES
        end_index = self._getEndPos(word, start_index, direction)


        if not (0 <= end_index['row'] < self.grid_size and 0 <= end_index['col'] < self.grid_size):
            return False
            
        # 2. VÉRIFICATION DES COLLISIONS ET CROISEMENTS
        for i in range(M):
            r = start_index['row'] + i * dl
            c = start_index['col'] + i * dc
            
            target_letter = word[i].upper()
            current_cell_content = self.grid[r][c] # 🎯 Utilise la grille d'instance


            if current_cell_content != ".":
                if current_cell_content != target_letter:
                    return False
        return True

    def _fill_grid(
        self,
        word: str,
        start_index: Dict[str, int],
        direction: Tuple[int,int],
    ) -> None:
        
        M = len(word)
        dl, dc = direction

        for i in range(M):
            r = start_index['row'] + i * dl
            c = start_index['col'] + i * dc

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


        all_directions = list(itertools.product((-1,0,1),repeat=2))
        
        # retire le vecteur (0,0) qui ne sert à rien 
        all_directions = [direction for direction in all_directions if direction != (0,0) ]

        # 2. Boucle Principale de Placement
        for word in self.word_list:
            word_placed = False
            
            random.shuffle(all_directions)

            for start_row, start_col in all_coordinates:
                start_index = {
                    "row":start_row,
                     "col": start_col
                }

                for direction in all_directions :
                    # 3. Vérification : Utilise self._check_fit
                    if self._check_fit(word, start_index, direction): 

                        # 4. Placement réussi
                        self._fill_grid(word, start_index, direction)
                        
                        # 5. Enregistrement de la solution
                        end_index = self._getEndPos(word, start_index, direction)
                        
                        self.solutions.append(
                            WordSolution(
                                word=word,
                                start_index=start_index,
                                end_index=end_index,
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
from enum import Enum



class Status(str, Enum):
    waiting = "waiting"
    alreadyWaiting="already waiting"
    ready="ready"
    matched="matched"
    active = "active"
    paused = "paused"
    timeout = "timeout"
    finished = "finished"
    abandoned = "abandoned"


class Direction(Enum):
    # Directions principales
    DROITE = (0, 1)     # Horizontal droite (colonne +1)
    GAUCHE = (0, -1)    # Horizontal gauche (colonne -1)
    BAS = (1, 0)        # Vertical bas (ligne +1)
    HAUT = (-1, 0)      # Vertical haut (ligne -1)

    # Directions diagonales
    BAS_DROITE = (1, 1)     # Diagonale bas-droite (ligne +1, colonne +1)
    BAS_GAUCHE = (1, -1)    # Diagonale bas-gauche (ligne +1, colonne -1)
    HAUT_DROITE = (-1, 1)   # Diagonale haut-droite (ligne -1, colonne +1)
    HAUT_GAUCHE = (-1, -1)  # Diagonale haut-gauche (ligne -1, colonne -1)
    pass


class GameName (str,Enum):
    wordsearch="WORDSEARCH"
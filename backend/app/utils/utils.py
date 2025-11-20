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

class Games(str,Enum):
    word_search="WORD_SEARCH"
    
    pass

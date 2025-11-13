from enum import Enum

class Status(str, Enum):
    waiting = "waiting"
    ready = "ready"
    active = "active"
    paused = "paused"
    timeout = "timeout"
    finished = "finished"
    abandoned = "abandoned"




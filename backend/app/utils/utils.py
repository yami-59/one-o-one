from enum import Enum
import jwt
from datetime import datetime, timedelta, timezone
from app.core.settings import settings

ALGORITHM = "HS256" # Algorithme de hachage standard pour JWT

def create_access_token(data: dict, expires_delta: timedelta):
    """Crée un JWT signé."""
    to_encode = data.copy()
    
    # Ajout de l'expiration (crucial pour la sécurité)
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire})
    
    # Encodage avec la clé secrète
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY.get_secret_value(), # Récupère la clé de Pydantic
        algorithm=ALGORITHM
    )
    return encoded_jwt


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

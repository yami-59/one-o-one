from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from app.core.settings import settings
from fastapi import HTTPException, status,Depends
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/guest/log")
TokenDep=Annotated[str, Depends(oauth2_scheme)]


ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  #  valable 7 jours
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Crée un jeton d'accès JWT."""
    to_encode = data.copy()
    
    # Définir la date d'expiration
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Ajouter les claims standard 'exp' et l'identifiant du joueur ('sub' ou 'id')
    to_encode.update({"exp": expire})
    
    # Créer le jeton signé
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- Service de validation de jeton (utilisé par la dépendance) ---

def verify_token(token: str, verify_exp):
    """Vérifie le jeton JWT et retourne l'identifiant du joueur."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Jeton invalide ou expiré.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    options={"verify_signature": True, "verify_exp": verify_exp}
    try:
        # Décoder et vérifier la signature
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=settings.ALGORITHMS,options=options)
        
        # Le 'sub' (subject) est la convention pour l'identifiant unique
        player_identifier: str = payload.get("sub") 
        
        if player_identifier is None:
            raise credentials_exception
            
        return player_identifier
        
    except JWTError:
        raise credentials_exception

def get_current_player_id(token: TokenDep,verify_exp=True):
    """Dépendance : Valide le jeton et retourne l'identifiant du joueur."""
    return verify_token(token,verify_exp)

from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from app.core.settings import settings
from app.core.db import SessionDep
from fastapi import HTTPException, status,Depends,WebSocket
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
import uuid
from app.models.tables import User
from sqlmodel import select

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  #  valable 7 jours


# La dépendance pour extraire le JWT des headers de la requete http
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/guest/login")

# La dépendance pour extraire le JWT des headers de la connexion WS
# C'est l'équivalent de OAuth2PasswordBearer pour les WebSockets
def get_websocket_token(websocket: WebSocket) -> str:
    """
    Extrait le jeton Bearer du header 'Authorization' de la connexion WebSocket.
    """
    # 1. Tente de récupérer le header Authorization
    token = websocket.query_params.get("token")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,  # 403 Forbidden car le jeton est manquant
            detail="Jeton d'autorisation manquant dans les en-têtes WebSocket."
        )

    return token



# je sais pas quoi mettre 
TokenDep=Annotated[str, Depends(oauth2_scheme)]
TokenWebsocketDep=Annotated[str,get_websocket_token]


# --- Service de validation de jeton (utilisé par la dépendance) ---

def verify_token(token: str, verify_exp=True):
    """Vérifie le jeton JWT et retourne l'identifiant du joueur."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Jeton invalide ou expiré.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    options={"verify_signature": True, "verify_exp": verify_exp}
    try:
        # Décoder et vérifier la signature
        payload = jwt.decode(token, settings.SECRET_KEY.get_secret_value(), algorithms=settings.ALGORITHM,options=options)
        
        # Le 'sub' (subject) est la convention pour l'identifiant unique
        player_identifier: str = payload.get("sub") 
        
        if player_identifier is None:
            raise credentials_exception
            
        return player_identifier
        
    except JWTError:
        raise credentials_exception



def get_current_player_id(token: TokenDep | TokenWebsocketDep,verify_exp=True):
    """Dépendance : Valide le jeton et retourne l'identifiant du joueur."""
    return verify_token(token,verify_exp)

# --- ANCIENNE DÉPENDANCE DEVENANT UNE DÉPENDANCE DE LOOKUP DB ---

async def get_current_active_user(
    db: SessionDep,
    player_identifier: str = Depends(get_current_player_id),
) -> User:
    """
    Dépendance : Récupère l'utilisateur actif à partir de l'identifiant extrait du jeton.
    """
    # 2. Récupération de l'utilisateur dans la DB
    
    result = db.exec(select(User).where(User.identifier == player_identifier))
    user = result.first()
    

    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable."
        )
        
    # Vérification additionnelle
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Utilisateur inactif."
        )
        
    return user



def generate_guest_identifier() -> str :
    return "guest-"+str(uuid.uuid4())


def create_access_token(player_id: str, expires_delta: timedelta | None = None):
    """Crée un jeton d'accès JWT."""
    to_encode = {"sub": player_id}
    
    # Définir la date d'expiration
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Ajouter les claims standard 'exp' et l'identifiant du joueur ('sub' ou 'id')
    to_encode.update({"exp": expire})
    
    # Créer le jeton signé
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY.get_secret_value(), algorithm=settings.ALGORITHM)
    return encoded_jwt
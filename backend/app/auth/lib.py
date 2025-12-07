import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status,Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlmodel import select

from app.core.db import SessionDep
from app.core.settings import settings
from app.models.tables import User



# La dépendance pour extraire le JWT des headers de la requete http
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/guest/login")


# Dépendance principale qui lit le cookie
async def get_jwt_from_cookie(request: Request) -> str:
    """
    Tente de récupérer le jeton JWT du cookie HttpOnly.
    """
    # 🎯 1. Vérifier si le cookie 'access_token' existe
    token = request.cookies.get("access_token")
    
    if not token:
        print("aucun jeton")
        # Lève une exception si le token de session est manquant dans le cookie
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session non valide (jeton manquant).",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token

# Dépendance finale qui appelle la fonction de vérification du token
# (Utilisez la fonction que nous avions pour décoder le JWT)
async def get_current_user_id_from_cookie(token: str = Depends(get_jwt_from_cookie)):
    # 🎯 2. Utiliser la fonction de vérification existante pour décoder et valider l'ID
    user_id = verify_token(token, verify_exp=True) 
    return user_id

# Dépendance à utiliser dans les routeurs :
UserIDFromCookieDep = Depends(get_current_user_id_from_cookie)





TokenDep = Annotated[str, Depends(oauth2_scheme)]




def create_access_token(user_id: str, expires_delta: timedelta):
    """Crée un jeton d'accès JWT."""
    to_encode = {"sub": user_id}


    expire = datetime.now(timezone.utc) + expires_delta
   

    # Ajouter les claims standard 'exp' et l'identifiant du joueur ('sub' ou 'id')
    to_encode.update({"exp": expire})

    # Créer le jeton signé
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY.get_secret_value(), algorithm=settings.ALGORITHM
    )
    return encoded_jwt

# --- Service de validation de jeton (utilisé par la dépendance) ---


def verify_token(token: str, verify_exp=True):
    """Vérifie le jeton JWT et retourne l'identifiant du joueur."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Jeton invalide ou expiré.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    options = {"verify_signature": True, "verify_exp": verify_exp}
    try:
        # Décoder et vérifier la signature
        payload = jwt.decode(
            token,
            settings.SECRET_KEY.get_secret_value(),
            algorithms=settings.ALGORITHM,
            options=options,
        )

        # Le 'sub' (subject) est la convention pour l'identifiant unique
        user_id: str = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        return user_id

    except JWTError:
        raise credentials_exception


def get_current_user_id(token: TokenDep, verify_exp=True):
    """Dépendance : Valide le jeton et retourne l'identifiant du joueur."""
    return verify_token(token, verify_exp)


# --- ANCIENNE DÉPENDANCE DEVENANT UNE DÉPENDANCE DE LOOKUP DB ---


async def get_user(
    db: SessionDep,
    user_id: str = Depends(get_current_user_id),
) -> User:
    """
    Dépendance : Récupère l'utilisateur actif à partir de l'identifiant extrait du jeton.
    """
    # 2. Récupération de l'utilisateur dans la DB

    result = await db.exec(select(User).where(User.user_id == user_id))
    user = result.first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Utilisateur introuvable."
        )


    return user




def generate_user_id() -> str:
    return  str(uuid.uuid4())

def generate_guest_username() -> str:

    return 'guest-'+str(uuid.uuid1())


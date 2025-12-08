from fastapi import APIRouter, HTTPException, status
from sqlmodel import SQLModel, select

from app.core.db import SessionDep
from app.models.tables import User
from app.auth.lib import (
    create_access_token,
    generate_guest_username,
    generate_user_id,
    TokenDep,
    get_current_user_id
)

from datetime import timedelta
from app.core.settings import settings
from datetime import timedelta

router = APIRouter()

# Schéma de réponse pour la connexion
class TokenResponse(SQLModel):
    access_token: str
    token_type: str = "Bearer"
    user_info:dict



@router.post(
    "/guest/login", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def login_guest(session: SessionDep):
    """
    Crée un compte utilisateur invité et génère un JWT pour l'authentification.
    """
    # 1. Génération de l'identifiant unique (UUID ou autre méthode sûre)

    new_id = generate_user_id()

    new_username = generate_guest_username()


    db_user = User(user_id=new_id,username=new_username)

    try:
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
    except Exception as e:
        # Gérer l'erreur si l'insertion échoue
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'utilisateur invité: {e}",
        )
    
    expires = timedelta(days=7)

    # 3. Création du Jeton JWT
    access_token = create_access_token(new_id,expires)

    # 4. Retourner le jeton et l'identifiant au client
    return TokenResponse(
        access_token=access_token,
        user_info=db_user
        
    )

@router.post("/refresh", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def refresh_token(
    # Le jeton est extrait de l'en-tête Authorization
    token_to_refresh: TokenDep,
    session: SessionDep
):
    """
    Échange un jeton existant contre un nouveau jeton.
    """
    
    # 1. Tenter de vérifier le jeton pour récupérer l'identifiant du joueur (subject 'sub')
    try:
        # NOTE 1: La fonction verify_token DOIT être adaptée pour IGNORER l'expiration ici 

        user_id =get_current_user_id(token_to_refresh)
    except HTTPException:
        # Si le jeton est invalide (mauvaise signature, format incorrect), nous rejetons.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton invalide (signature ou format incorrect)."
        )
    
    # 2. Vérification de l'existence de l'utilisateur en DB
    statement = select(User).where(User.user_id == user_id)
    user = (await session.exec(statement)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur associé au jeton introuvable."
        )

    # 3. Génération d'un nouveau jeton JWT
    new_access_token = create_access_token(user_id,timedelta(days=7))

    # 4. Retourner le nouveau jeton
    return TokenResponse(
        access_token=new_access_token,
        user_info={
            "user_id":user_id,
            "username":user.username
        }
        
    )
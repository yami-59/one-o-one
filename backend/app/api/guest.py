from sqlmodel import  SQLModel,select
from app.core.db import SessionDep
from fastapi import APIRouter,status,HTTPException
from app.models.tables import User
from app.utils.auth import generate_guest_identifier,create_access_token,get_current_player_id,TokenDep
from app.models.schemas import TokenResponse
router = APIRouter()



@router.post("/guest/login", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def login_guest(session: SessionDep):
    """
    Crée un compte utilisateur invité et génère un JWT pour l'authentification.
    """
    # 1. Génération de l'identifiant unique (UUID ou autre méthode sûre)
  
    new_identifier = generate_guest_identifier()


    # 2. Création de l'utilisateur dans la DB
    db_user = User(identifier=new_identifier)
    
    try:
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
    except Exception as e:
        # Gérer l'erreur si l'insertion échoue
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'utilisateur invité: {e}"
        )

    # 3. Création du Jeton JWT
    access_token = create_access_token(new_identifier )

    # 4. Retourner le jeton et l'identifiant au client
    return TokenResponse(
        access_token=access_token,
        player_identifier=new_identifier
    )

# --- Les Imports et Définitions (Assurez-vous qu'elles sont dans votre contexte) ---
# router = APIRouter(tags=["Auth"])
# UserModel, TokenResponse, create_access_token, verify_token, get_session, etc.
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/guest/login")
# ---------------------------------------------------------------------------------

@router.post("/guest/refresh", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def refresh_guest_token(
    # Le jeton est extrait de l'en-tête Authorization
    token_to_refresh: TokenDep,
    session: SessionDep
):
    """
    Échange un jeton existant (même s'il est expiré) contre un nouveau jeton.
    """
    
    # 1. Tenter de vérifier le jeton pour récupérer l'identifiant du joueur (subject 'sub')
    try:
        # NOTE 1: La fonction verify_token DOIT être adaptée pour IGNORER l'expiration ici 

        player_identifier = get_current_player_id(token_to_refresh,False)
        
    except HTTPException:
        # Si le jeton est invalide (mauvaise signature, format incorrect), nous rejetons.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Jeton invalide (signature ou format incorrect)."
        )
    
    # 2. Vérification de l'existence de l'utilisateur en DB
    statement = select(User).where(User.identifier == player_identifier)
    user = await session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur associé au jeton introuvable."
        )

    # 3. Génération d'un nouveau jeton JWT
    new_access_token = create_access_token(player_identifier)

    # 4. Retourner le nouveau jeton
    return TokenResponse(
        access_token=new_access_token,
        player_identifier=player_identifier
    )
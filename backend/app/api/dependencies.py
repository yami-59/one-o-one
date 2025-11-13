# /backend/app/api/dependencies.py (Nouveau fichier)

from fastapi import Header,Depends
from typing import Annotated
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.db import get_session

async def get_player_identifier(
    # Tente de lire l'identifiant unique envoyé par le frontend (stocké en localStorage)
    # Le frontend DOIT envoyer l'en-tête 'X-Player-Identifier'
    x_player_identifier: Annotated[str | None, Header(alias="X-Player-Identifier")] = None
) -> str | None:
    """
    Récupère l'identifiant de l'utilisateur (même invité) depuis l'en-tête de requête.
    """
    
    # Le backend ne PEUT PAS forcer l'utilisateur à être connecté ici (pas de levée d'exception)
    # L'identifiant est simplement retourné (str) ou None si l'en-tête est manquant.
    return x_player_identifier

# Dépendance à utiliser dans les routeurs :
PlayerIdentifierDep = Annotated[str | None, Depends(get_player_identifier)]
SessionDep = Annotated[AsyncSession,Depends(get_session)]
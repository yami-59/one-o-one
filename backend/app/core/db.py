# /backend/app/core/db.py

from typing import AsyncGenerator
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.settings import settings
from sqlalchemy.ext.asyncio import create_async_engine
from typing import Annotated
from fastapi import Depends
from sqlalchemy.exc import OperationalError
from asyncpg.exceptions import ConnectionDoesNotExistError
import asyncio


# --- 1. Création du Moteur Asynchrone ---
# Utilise l'URL définie dans settings.py (qui sera lue depuis le .env ou Docker Compose)
engine = create_async_engine(
    # Le schéma doit être 'postgresql+asyncpg' pour le driver asynchrone
    settings.DATABASE_URL, 
    echo=settings.DEBUG, # Afficher les requêtes SQL si DEBUG=True
    future=True,
    pool_size=10, # Limite le nombre de connexions au pool
    max_overflow=0 # Pas de connexions au-delà du pool_size
)

async def check_db_connection(max_retries: int = 5, delay: int = 2):
    """Tente de se connecter à la DB plusieurs fois avant d'échouer."""
    for attempt in range(max_retries):
        try:
            async with AsyncSession(engine) as session:
                await session.connection()
            print("✅ Connexion DB réussie après tentative.")
            return
        
        except (OperationalError, ConnectionDoesNotExistError) as e:
            if attempt < max_retries - 1:
                print(f"Tentative {attempt + 1}/{max_retries} échouée. Nouvelle tentative dans {delay}s...")
                await asyncio.sleep(delay)
            else:
                # Si c'est la dernière tentative, on lève l'exception pour que FastAPI plante
                print("❌ Toutes les tentatives de connexion DB ont échoué.")
                raise e


# --- 3. Dépendance FastAPI pour la Session ---
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Fournit une session de base de données asynchrone à FastAPI.
    Utilisée avec Depends() dans les routeurs.
    """
    async with AsyncSession(engine) as session:
        yield session

SessionDep = Annotated[AsyncGenerator,Depends(get_session)]
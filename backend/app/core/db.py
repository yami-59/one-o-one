# /backend/app/core/db.py

from typing import AsyncGenerator
from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.settings import settings


# ⚠️ Il est ESSENTIEL d'importer les modèles ici pour que SQLModel
# puisse les détecter et créer les tables dans create_db_and_tables().
from app.models.user import User
from app.models.gameSession import GameSession
from app.models.gameType import GameType
from app.models.wordLists import WordList


# --- 1. Création du Moteur Asynchrone ---
# Utilise l'URL définie dans settings.py (qui sera lue depuis le .env ou Docker Compose)
engine = create_engine(
    # Le schéma doit être 'postgresql+asyncpg' pour le driver asynchrone
    settings.DATABASE_URL, 
    echo=settings.DEBUG, # Afficher les requêtes SQL si DEBUG=True
    future=True,
    pool_size=10, # Limite le nombre de connexions au pool
    max_overflow=0 # Pas de connexions au-delà du pool_size
)

# --- 2. Fonction pour la Création des Tables ---
async def create_db_and_tables():
    """Crée les tables dans la base de données si elles n'existent pas."""
    async with engine.begin() as conn:
        # run_sync exécute les opérations synchrones de l'ORM (comme create_all)
        # dans un contexte asynchrone sécurisé.
        await conn.run_sync(SQLModel.metadata.create_all)


# --- 3. Dépendance FastAPI pour la Session ---
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Fournit une session de base de données asynchrone à FastAPI.
    Utilisée avec Depends() dans les routeurs.
    """
    async with AsyncSession(engine) as session:
        yield session
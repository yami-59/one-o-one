# /backend/app/core/db.py

from typing import AsyncGenerator
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.settings import settings
from sqlalchemy.ext.asyncio import create_async_engine

# ⚠️ Il est ESSENTIEL d'importer les modèles ici pour que SQLModel
# puisse les détecter et créer les tables dans create_db_and_tables().
from app.models.tables import *
from sqlalchemy.exc import OperationalError

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

async def check_db_connection():
    """
    Tente de se connecter à la base de données pour vérifier sa disponibilité.
    
    """
    try:
        # Tenter d'ouvrir une session et de la fermer immédiatement
        async with AsyncSession(engine) as session:
            # Exécuter une requête minimale (comme une requête 'SELECT 1')
            await session.connection() 
        print("✅ Connexion à postgresql établie")
        return True
    except OperationalError as e:
        print(f"❌ ERREUR : La base de données est inaccessible ou les identifiants sont incorrects. {e}")
        return False




# --- 3. Dépendance FastAPI pour la Session ---
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Fournit une session de base de données asynchrone à FastAPI.
    Utilisée avec Depends() dans les routeurs.
    """
    async with AsyncSession(engine) as session:
        yield session
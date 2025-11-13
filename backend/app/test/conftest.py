# /backend/tests/conftest.py
import pytest
from httpx import AsyncClient
from sqlmodel import SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import AsyncGenerator
from app.main import app 
from app.core.db import get_session, create_db_and_tables as create_db_prod

# --- 1. MOTEUR ET SESSION DE TEST ---

# Utiliser SQLite en mémoire pour les tests. Le 'sqlite+aiosqlite:///' crée une DB en mémoire.
sqlite_url = "sqlite+aiosqlite://"
engine_test = create_engine(sqlite_url, echo=False, future=True)

async def get_session_test() -> AsyncGenerator[AsyncSession, None]:
    """
    Dépendance de session asynchrone pour l'environnement de test.
    """
    async with AsyncSession(engine_test) as session:
        yield session


# --- 2. FIXTURE DE SETUP DE LA DB ---

@pytest.fixture(scope="session", autouse=True)
async def setup_db():
    """
    Configure la base de données de test une seule fois au début de la session.
    """
    # ⚠️ 1. Créer toutes les tables basées sur les modèles SQLModel
    async with engine_test.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    # ⚠️ 2. Surcharger la dépendance get_session de FastAPI pour utiliser la DB de test
    app.dependency_overrides[get_session] = get_session_test
    
    # Le 'yield' permet au test de s'exécuter
    yield
    
    


# --- 3. FIXTURE DU CLIENT DE TEST (Réutilisé de notre discussion précédente) ---

@pytest.fixture(scope="session")
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Fournit un client HTTP asynchrone pour tester l'API FastAPI.
    """
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client
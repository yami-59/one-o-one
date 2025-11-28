# /backend/tests/conftest.py
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import AsyncGenerator,Generator
from app.main import app 
from app.core.db import get_session
from sqlalchemy.ext.asyncio import create_async_engine
from app.models.schemas import *
from app.models.tables import *
from app.utils.auth import *
from app.games.wordsearch.wordsearch_generator import WordSearchGenerator
from app.games.wordsearch.wordsearch_engine import WordSearchEngine
import uuid
from redis.asyncio import Redis as AsyncRedis
from app.utils.enums import GameName





# --- 1. MOTEUR ET SESSION DE TEST ---

# Utiliser SQLite en mémoire pour les tests. Le 'sqlite+aiosqlite:///' crée une DB en mémoire.
sqlite_url = "sqlite+aiosqlite://"
engine_test = create_async_engine(sqlite_url, echo=False, future=True)


@pytest.fixture(scope="session")
def anyio_backend():
    return 'asyncio'

async def get_session_test() -> AsyncGenerator[AsyncSession, None]:
    """
    Dépendance de session asynchrone pour l'environnement de test.
    """
    async with AsyncSession(engine_test) as session:
        yield session




# --- 1. FIXTURE DE LA CONNEXION A LA DB ---
@pytest_asyncio.fixture(scope="function") # Scope function pour l'isolation des tests DB
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Exécute le générateur de session de test pour obtenir l'objet AsyncSession actif.
    """
    # 🎯 Exécution et nettoyage du générateur via async for
    async for session in get_session_test():
        yield session

        # La transaction est annulée après le test pour annuler toutes les écritures.
        await session.rollback()


# --- 2. FIXTURE DE SETUP DE LA DB ---

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_db(): 
    """
    Configure la base de données de test une seule fois au début de la session.
    """
    # ... (code de création des tables et surcharge de dépendance inchangé)
    
    async with engine_test.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    
    app.dependency_overrides[get_session] = get_session_test
    
    yield

# --- FIXTURE DU CLIENT REDIS ---
@pytest_asyncio.fixture(scope="function")
async def redis_client() -> AsyncGenerator[AsyncRedis, None]:

    REDIS_TEST_URL = "redis://localhost:6379/15" # Utiliser une base de données distincte (ex: 15) pour les tests

    """
    Crée une connexion asynchrone à Redis, de portée session.
    La connexion est ouverte avant le premier test et fermée après le dernier.
    """
    # 1. Connexion au client Redis
    client = AsyncRedis.from_url(REDIS_TEST_URL)

    try:
        # Vérification de la connexion (ping) pour s'assurer que Redis est accessible
        await client.ping()
        print(f"\n--- Connexion Redis (TEST) établie à {REDIS_TEST_URL} ---")
    except Exception as e:
        pytest.fail(f"Impossible de se connecter à Redis de test à {REDIS_TEST_URL}: {e}")
        
    # 2. Yield : Céder la ressource aux tests
    # Le code ci-dessous (après yield) sera exécuté après tous les tests de la session
    yield client

    # 3. Teardown (Nettoyage après la session)
    print("\n--- Fermeture de la connexion Redis (TEST) ---")
    await client.aclose()

    # 4. Optionnel mais recommandé : Vider la base de données de test

    await client.flushdb()

# --- 3. FIXTURE DU CLIENT DE TEST ---

@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None,None]:
    """
    Fournit un client HTTP asynchrone pour tester l'API FastAPI.
    """
    with TestClient(app=app) as client:
        yield client


# --- 4. FIXTURE DE LA CLASSE QUI GENERE LA GRILLE DE MOT-MELE ---
@pytest.fixture
def test_word_list() -> List[str]:
    """Liste de mots de test."""
    return ["PYTHON", "FASTAPI", "CODE", "TEST", "DEV", "GAME", "API", "WS", "SQL"]

@pytest.fixture(scope="function")
def generator(test_word_list) -> WordSearchGenerator:
    """Initialise le générateur de grille pour les tests."""
    # La grille est de 10x10 par défaut
    return WordSearchGenerator(word_list=test_word_list, grid_size=10)



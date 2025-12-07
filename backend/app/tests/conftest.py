# /backend/tests/conftest.py
import uuid
from typing import AsyncGenerator, Generator, List
import contextlib

import pytest
import pytest_asyncio
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
from redis.asyncio import Redis as AsyncRedis
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.core.redis import redis_generator
from app.games.wordsearch.wordsearch_generator import WordSearchGenerator
from app.auth.lib import create_access_token
from app.main import app
from app.models.tables import User, GameSession, WordList


# ============================================================================
# 🔥 OVERRIDE DU LIFESPAN POUR EMPÊCHER LE MATCHMAKER DE TOURNER EN TEST
# ============================================================================
@contextlib.asynccontextmanager
async def fake_lifespan(app: FastAPI):
    """
    Empêche le lancement du consumer matchmaking et de Redis
    pendant les tests.
    """
    yield

# On remplace le lifespan d'origine pour TOUS les tests
app.router.lifespan_context = fake_lifespan


# ============================================================================
# CONFIGURATION
# ============================================================================

SQLITE_TEST_URL = "sqlite+aiosqlite://"
REDIS_TEST_URL = "redis://localhost:6379/15"

engine_test = create_async_engine(SQLITE_TEST_URL, echo=False, future=True)


@pytest.fixture(scope="session")
def anyio_backend():
    return "asyncio"


# ============================================================================
# DATABASE
# ============================================================================

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    async with engine_test.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine_test, expire_on_commit=False) as session:
        yield session
        await session.rollback()


async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSession(engine_test, expire_on_commit=False) as session:
        yield session


# ============================================================================
# REDIS
# ============================================================================

@pytest_asyncio.fixture(scope="session")
async def redis_client() -> AsyncGenerator[AsyncRedis, None]:
    client = AsyncRedis.from_url(REDIS_TEST_URL, decode_responses=True)
    await client.flushdb()
    yield client
    await client.flushdb()
    await client.aclose()


@pytest_asyncio.fixture(scope="function")
async def clean_redis(redis_client: AsyncRedis) -> AsyncRedis:
    await redis_client.flushdb()
    yield redis_client


# ============================================================================
# HTTP CLIENTS
# ============================================================================

@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app=app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def async_client(db_session: AsyncSession, redis_client: AsyncRedis) -> AsyncGenerator[AsyncClient, None]:

    # Override DB
    app.dependency_overrides[get_session] = override_get_session

    # Override Redis dependency
    async def override_redis():
        yield redis_client
    app.dependency_overrides[redis_generator] = override_redis

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ============================================================================
# USERS & AUTH
# ============================================================================

@pytest_asyncio.fixture(scope="function")
async def test_user(db_session: AsyncSession) -> User:
    user = User(
        user_id=str(uuid.uuid4()),
        username=f"test_user_{uuid.uuid4().hex[:8]}",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture(scope="function")
async def test_user_with_token(test_user: User) -> dict:
    from datetime import timedelta
    token = create_access_token(test_user.user_id, timedelta(hours=1))
    return {
        "user": test_user,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest_asyncio.fixture(scope="function")
async def two_test_users(db_session: AsyncSession) -> tuple[User, User]:
    u1 = User(user_id=str(uuid.uuid4()), username="player1")
    u2 = User(user_id=str(uuid.uuid4()), username="player2")
    db_session.add(u1)
    db_session.add(u2)
    await db_session.commit()
    await db_session.refresh(u1)
    await db_session.refresh(u2)
    return u1, u2


# ============================================================================
# GAME FIXTURES
# ============================================================================

@pytest.fixture
def sample_wordlist() -> WordList:
    return WordList(
        theme="Test",
        words=["PYTHON", "FASTAPI", "CODE", "TEST", "DEV", "GAME", "API", "SQL"],
    )


@pytest_asyncio.fixture(scope="function")
async def db_wordlist(db_session: AsyncSession) -> WordList:
    wl = WordList(
        theme=f"TestTheme_{uuid.uuid4().hex[:8]}",
        words=["PYTHON", "FASTAPI", "CODE", "TEST", "DEV", "GAME", "API", "SQL"],
    )
    db_session.add(wl)
    await db_session.commit()
    await db_session.refresh(wl)
    return wl


@pytest.fixture
def word_generator(sample_wordlist: WordList) -> WordSearchGenerator:
    return WordSearchGenerator(sample_wordlist, grid_size=10)


@pytest_asyncio.fixture(scope="function")
async def test_game_session(db_session: AsyncSession, two_test_users):
    u1, u2 = two_test_users
    g = GameSession(
        game_id=str(uuid.uuid4()),
        game_name="wordsearch",
        player1_id=u1.user_id,
        player2_id=u2.user_id,
        game_data={},
    )
    db_session.add(g)
    await db_session.commit()
    await db_session.refresh(g)
    return g


# ============================================================================
# WEBSOCKET
# ============================================================================

@pytest_asyncio.fixture(scope="function")
async def ws_token(test_user: User, redis_client: AsyncRedis) -> str:
    t = str(uuid.uuid4())
    await redis_client.set(f"ws_auth:{t}", test_user.user_id, ex=300)
    return t

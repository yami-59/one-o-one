import asyncio
from typing import Any, Dict, Optional

from redis.asyncio import Redis as AsyncRedis
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import func

from app.models.schemas import WordSearchState, WordSolution
from app.models.tables import GameSession, WordList
from app.games.constants import GameStatus
from .wordsearch_engine import WordSearchEngine
from .wordsearch_generator import WordSearchGenerator
from app.games.constants import GAME_STATE_KEY_PREFIX,SOLUTION_KEY_PREFIX

async def get_random_wordlist(session: AsyncSession) -> Optional[WordList]:
    query = select(WordList).order_by(func.random()).limit(1)
    result = await session.exec(query)
    return result.first()


class WordSearchController:
    GAME_DURATION_SECONDS : int  = 180

    def __init__(
        self,
        game_id: str,
        db_session: AsyncSession,
        redis_client: AsyncRedis,
    ):
        self._game_id = game_id
        self._db_session = db_session
        self._redis_client = redis_client
        self._engine = WordSearchEngine(game_id, db_session, redis_client)
        self._timeout_task: asyncio.Task | None = None

    @classmethod
    async def initialize_game(
        cls,
        game_id: str,
        game_name: str,
        p1_id: str,
        p2_id: str,
        db_session: AsyncSession,
        redis_client: AsyncRedis,
    ) -> dict | None:
        wordlist_record = await get_random_wordlist(db_session)
        if not wordlist_record:
            return None

        theme, grid_data,words_to_find, solutions = WordSearchGenerator(wordlist_record).generate()

        initial_state = WordSearchState(
            theme=theme,
            grid_data=grid_data,
            words_to_find=words_to_find,
            current_status=GameStatus.GAME_INITIALIZED,
            game_duration=cls.GAME_DURATION_SECONDS
        )

        new_session = GameSession(
            game_id=game_id,
            game_name=game_name,
            player1_id=p1_id,
            player2_id=p2_id,
            game_data=initial_state.model_dump()
        )

        try:
            # db_session.add(new_session)
            # await db_session.commit()
            await redis_client.set(f"{GAME_STATE_KEY_PREFIX}{game_id}", initial_state.model_dump_json())
            await redis_client.set(f"{SOLUTION_KEY_PREFIX}{game_id}",solutions.model_dump_json())
        except Exception:
            # await db_session.rollback()
            return None

        return initial_state.model_dump()

    async def _schedule_timeout(self):
        try:
            await asyncio.sleep(self.GAME_DURATION_SECONDS)
            await self._engine.finalize_game()
            await self._redis_client.publish(
                f"game_channel:{self._game_id}",
                '{"type": "timeout", "message": "Le temps est écoulé!"}'
            )
        except asyncio.CancelledError:
            pass

    def start_game(self) -> dict:
        self._timeout_task = asyncio.create_task(self._schedule_timeout())
        return {
            "status": GameStatus.GAME_IN_PROGRESS,
            "timer": self.GAME_DURATION_SECONDS,
        }

    async def process_player_action(
        self, player_id: str, selected_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        selected_obj = WordSolution.model_validate(selected_data)
        return await self._engine.validate_selection(player_id, selected_obj)
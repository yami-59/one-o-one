# /backend/app/games/gameRoom.py

import asyncio
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from redis.asyncio import Redis as AsyncRedis
from .constants import GameStatus
from .wordsearch.redis_keys import redis_state_key
from sqlmodel.ext.asyncio.session import AsyncSession
from app.games.wordsearch.wordsearch_controller import WordSearchController

class GameRoom:
    """Représente une salle de jeu avec ses joueurs connectés."""

    GAME_DURATION_SECONDS = 180  # 3 minutes

    def __init__(
        self, 
        game_id: str, 
        redis_conn: AsyncRedis ,
        db_session:AsyncSession,
        max_players: int = 2,
    ):
        self._game_id = game_id
        self._players: dict[str, WebSocket] = {}  # {player_id: websocket}
        self._state: GameStatus = GameStatus.WAITING_FOR_PLAYERS
        self._max_players = max_players
        self._redis_conn = redis_conn
        self._timeout_task: asyncio.Task | None = None
        self._db_session = db_session
        self._controller = WordSearchController(game_id,db_session,redis_conn)

    @property
    def game_id(self) -> str:
        return self._game_id

    @property
    def state(self) -> GameStatus:
        return self._state

    @property
    def player_count(self) -> int:
        return len(self._players)

    @property
    def player_ids(self) -> list[str]:
        return list(self._players.keys())

    def is_full(self) -> bool:
        """Vérifie si la salle a atteint sa capacité maximale."""
        return self.player_count >= self._max_players

    def is_empty(self) -> bool:
        """Vérifie si la salle est vide."""
        return self.player_count == 0

    def add_player(self, player_id: str, websocket: WebSocket) -> bool:
        """
        Ajoute un joueur à la salle.
        Retourne False si la salle est pleine ou si le joueur est déjà présent.
        """
        if self.is_full():
            return False
        if player_id in self._players:
            return False
        self._players[player_id] = websocket
        print(f"🎮 [{self._game_id}] Joueur {player_id} a rejoint ({self.player_count}/{self._max_players})")
        return True

    def remove_player(self, player_id: str) -> bool:
        """Retire un joueur de la salle."""
        if player_id in self._players:
            del self._players[player_id]
            print(f"🚪 [{self._game_id}] Joueur {player_id} a quitté")
            return True
        return False

    def get_player_socket(self, player_id: str) -> WebSocket | None:
        """Récupère le WebSocket d'un joueur."""
        return self._players.get(player_id)

    def get_opponent_id(self, player_id: str) -> str | None:
        """Trouve l'ID de l'adversaire."""
        for pid in self._players:
            if pid != player_id:
                return pid
        return None

    async def send_to_player(self, player_id: str, message: dict[str, Any]) -> bool:
        """
        Envoie un message à un joueur spécifique.
        Retourne False si l'envoi échoue.
        """
        websocket = self._players.get(player_id)
        if not websocket:
            return False

        try:
            await websocket.send_json(message)
            return True
        except WebSocketDisconnect:
            self.remove_player(player_id)
            return False
        except Exception as e:
            print(f"⚠️ [{self._game_id}] Erreur envoi à {player_id}: {e}")
            self.remove_player(player_id)
            return False

    async def broadcast(self, message: dict[str, Any]) -> list[str]:
        """
        Envoie un message à tous les joueurs.
        Retourne la liste des player_ids qui ont échoué.
        """
        failed: list[str] = []

        for player_id in list(self._players.keys()):  # Copie pour éviter mutation pendant itération
            success = await self.send_to_player(player_id, message)
            if not success:
                failed.append(player_id)

        return failed

    async def broadcast_except(self, message: dict[str, Any], exclude_player_id: str) -> list[str]:
        """Envoie un message à tous sauf un joueur."""
        failed: list[str] = []

        for player_id in list(self._players.keys()):
            if player_id == exclude_player_id:
                continue
            success = await self.send_to_player(player_id, message)
            if not success:
                failed.append(player_id)

        return failed

    async def _get_game_state(self) -> dict | None:
        """Récupère l'état du jeu depuis Redis pour le broadcast."""
        from app.models.schemas import WordSearchState
        
        state_key = redis_state_key(self._game_id)
        json_state = await self._redis_conn.get(state_key)
        
        if not json_state:
            return None
        
        if isinstance(json_state, bytes):
            json_state = json_state.decode("utf-8")
        
        state = WordSearchState.model_validate_json(json_state)
        
        return state.model_dump()

    async def start_countdown(self, countdown_seconds: int = 3) -> None:
        """Déclenche le compte à rebours avant le début de la partie."""
        self._state = GameStatus.STARTING_COUNTDOWN

        await self.broadcast({
            "type": GameStatus.STARTING_COUNTDOWN.value,
            "message": f"Partie prête ! Démarrage dans {countdown_seconds} secondes...",
            "countdown": countdown_seconds,
        })

        print(f"⏳ [{self._game_id}] Compte à rebours: {countdown_seconds}s")
        await asyncio.sleep(countdown_seconds)

    async def start_game(self, redis_conn: AsyncRedis, game_id: str) -> None:
        """Démarre la partie et notifie tous les joueurs avec l'état complet."""
        self._state = GameStatus.GAME_IN_PROGRESS

        # Récupérer l'état du jeu depuis Redis
        game_state = await self._get_game_state(redis_conn, game_id)

        # Envoyer un message personnalisé à chaque joueur
        for player_id in list(self._players.keys()):
            opponent_id = self.get_opponent_id(player_id)

            message = {
                "type": GameStatus.GAME_IN_PROGRESS.value,
                "message": "GO! La partie a commencé.",
                "you": player_id,
                "opponent": opponent_id,
                "timer": self.GAME_DURATION_SECONDS,
            }

            # Inclure l'état du jeu si disponible
            if game_state:
                message.update(game_state)

            await self.send_to_player(player_id, message)

        print(f"🚀 [{self._game_id}] Partie démarrée!")

        # Démarrer le timer de fin de partie
        self._timeout_task = asyncio.create_task(
            self._handle_game_timeout(redis_conn, game_id)
        )

    async def _handle_game_timeout(self, redis_conn: AsyncRedis, game_id: str) -> None:
        """Gère la fin du temps imparti."""
        try:
            await asyncio.sleep(self.GAME_DURATION_SECONDS)
            
            if self._state == GameStatus.GAME_IN_PROGRESS:
                print(f"⏰ [{self._game_id}] Temps écoulé!")
                await self.end_game(reason="timeout")
                
        except asyncio.CancelledError:
            print(f"⏰ [{self._game_id}] Timer annulé")

    async def handle_game_start(
        self, 
        redis_conn: AsyncRedis, 
        game_id: str,
        countdown_seconds: int = 3,
    ) -> None:
        """Gère le démarrage complet: countdown puis start."""
        await self.start_countdown(countdown_seconds)
        await self.start_game(redis_conn, game_id)

    async def end_game(self, winner_id: str | None = None, reason: str = "finished") -> None:
        """Termine la partie et notifie les joueurs."""
        self._state = GameStatus.GAME_FINISHED

        # Annuler le timer si actif
        if self._timeout_task and not self._timeout_task.done():
            self._timeout_task.cancel()

        await self.broadcast({
            "type": GameStatus.GAME_FINISHED.value,
            "reason": reason,
            "winner": winner_id,
        })

        print(f"🏆 [{self._game_id}] Partie terminée. Gagnant: {winner_id or 'match nul'}")

    async def close_all_connections(self) -> None:
        """Ferme toutes les connexions WebSocket."""
        for player_id, websocket in list(self._players.items()):
            try:
                await websocket.close()
            except Exception:
                pass
            self.remove_player(player_id)

        print(f"🔌 [{self._game_id}] Toutes les connexions fermées")
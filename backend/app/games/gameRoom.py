# /backend/app/games/gameRoom.py

import asyncio
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from redis.asyncio import Redis as AsyncRedis
from .constants import GameStatus
from .wordsearch.redis_keys import redis_state_key
from sqlmodel.ext.asyncio.session import AsyncSession
from app.games.wordsearch.wordsearch_controller import WordSearchController
from typing import Set



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
        self._players: dict[str, dict[str,Any]] = {}  # {player_id: websocket}
        self._state: GameStatus = GameStatus.WAITING_FOR_PLAYERS
        self._max_players = max_players
        self._redis_conn = redis_conn
        self._timeout_task: asyncio.Task | None = None
        self._db_session = db_session
        self._controller = WordSearchController(game_id,db_session,redis_conn)

        # Nouveaux attributs pour la synchronisation
        self._ready_players: Set[str] = set()

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

    def add_player(self, player_id: str, websocket: WebSocket,username:str) -> bool:
        """
        Ajoute un joueur à la salle.
        Retourne False si la salle est pleine ou si le joueur est déjà présent.
        """
        if self.is_full():
            return False
        if player_id in self._players:
            return False
        
        player = self._players.setdefault(player_id, {})
        player["websocket"] = websocket
        player["username"] = username
        
        print(f"🎮 [{self._game_id}] Joueur {username} a rejoint ({self.player_count}/{self._max_players})")
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
        if self._players.get(player_id) :
            return self._players.get[player_id].get('websocket')

    def get_opponent_id(self, player_id: str) -> str | None:
        """Trouve l'ID de l'adversaire."""
        for pid in self._players:
            if pid != player_id:
                return pid
        return None
    
    def get_username(self,player_id)-> str:
        return self._players[player_id]['username']
    
    def get_opponent_username(self,player_id:str) -> str|None:

        for pid in self._players:
            if pid != player_id and self._players.get(player_id) : 
                return self._players[pid]['username']

        return None

    async def send_to_player(self, player_id: str, message: dict[str, Any]) -> bool:
        """
        Envoie un message à un joueur spécifique.
        Retourne False si l'envoi échoue.
        """
        websocket=None
        if self._players.get(player_id) :
             websocket = self._players.get(player_id).get("websocket")
        
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
    
    # ─────────────────────────────────────────────────────────────────────────
    # PHASE 1 : Préparation
    # ─────────────────────────────────────────────────────────────────────────

    async def prepare_game(self, game_data: dict) -> None:
        """
        Envoie les données de jeu à tous les joueurs.
        Les clients doivent répondre "player_ready" quand ils sont prêts.
        """
        game_data = await self._get_game_state()
        self._state = GameStatus.PREPARING
        self._ready_players.clear()

        # Envoyer à tous les joueurs
        await self.broadcast({
            "type": "prepare_game",
            "game_data": game_data,  # Grille, mots à trouver, thème...
            "message": "Chargement de la partie...",
        })

    def mark_player_ready(self, player_id: str) -> None:
        """Marque un joueur comme prêt."""
        if player_id in self._players:
            self._ready_players.add(player_id)
            print(f"✅ [{self._game_id}] {player_id} est prêt ({len(self._ready_players)}/{self._max_players})")

    def all_players_ready(self) -> bool:
        """Vérifie si tous les joueurs sont prêts."""
        return len(self._ready_players) >= self._max_players

    # ─────────────────────────────────────────────────────────────────────────
    # PHASE 2 : Démarrage synchronisé
    # ─────────────────────────────────────────────────────────────────────────

    async def wait_for_all_ready(self, timeout_seconds: float = 10.0) -> bool:
        """
        Attend que tous les joueurs soient prêts.
        
        Returns:
            True si tous prêts, False si timeout
        """
        elapsed = 0.0
        check_interval = 0.1  # Vérifier toutes les 100ms
        
        while elapsed < timeout_seconds:
            if self.all_players_ready():
                return True
            await asyncio.sleep(check_interval)
            elapsed += check_interval
        
        return False

    async def start_synchronized(self, countdown_seconds: int = 3) -> None:
        """
        Démarre la partie de manière synchronisée pour tous les joueurs.
        """
        # 1. Countdown
        self._state = GameStatus.STARTING_COUNTDOWN
        
        for remaining in range(countdown_seconds, 0, -1):
            await self.broadcast({
                "type": "countdown",
                "seconds": remaining,
            })
            await asyncio.sleep(1)

        # 2. Calcul du timestamp de démarrage
        # Ajouter un petit délai pour compenser la latence réseau
        from datetime import time
        start_timestamp = time.time() + 0.1  # Démarre dans 100ms

        # 3. Envoyer le signal de démarrage avec timestamp
        self._state = GameStatus.GAME_IN_PROGRESS
        
        await self.broadcast({
            "type": GameStatus.GAME_START.value,
            "start_timestamp": start_timestamp,
            "duration_seconds": self._controller.GAME_DURATION_SECONDS,  # 3 minutes
        })

        self._timeout_task = asyncio.create_task(self._handle_game_timeout())

        print(f"🚀 [{self._game_id}] Partie démarrée à {start_timestamp}")

    # ─────────────────────────────────────────────────────────────────────────
    # FLOW COMPLET
    # ─────────────────────────────────────────────────────────────────────────

    async def handle_game_start(self, game_data: dict) -> bool:
        """
        Gère le flow complet de démarrage synchronisé.
        
        Returns:
            True si la partie a démarré, False sinon
        """
        # Phase 1 : Envoyer les données
        await self.prepare_game(game_data)

        # Phase 2 : Attendre que tous soient prêts
        all_ready = await self.wait_for_all_ready(timeout_seconds=10)

        if not all_ready:
            # Timeout - certains joueurs n'ont pas répondu
            await self.broadcast({
                "type": "error",
                "message": "Tous les joueurs ne sont pas prêts. Annulation.",
            })
            return False

        # Phase 3 : Countdown + démarrage
        await self.start_synchronized(countdown_seconds=3)
        return True


    
    async def _handle_game_timeout(self) -> None:
        """Gère la fin du temps imparti."""
        try:
            await asyncio.sleep(self.GAME_DURATION_SECONDS)
            
            if self._state == GameStatus.GAME_IN_PROGRESS:
                print(f"⏰ [{self._game_id}] Temps écoulé!")
                await self.end_game(reason="timeout")
                
        except asyncio.CancelledError:
            print(f"⏰ [{self._game_id}] Timer annulé")


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
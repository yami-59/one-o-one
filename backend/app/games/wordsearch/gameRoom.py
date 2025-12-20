# /backend/app/games/gameRoom.py

import asyncio
from typing import Any, Set
from app.games.constants import GameStatus,GameMessages
from fastapi import WebSocket, WebSocketDisconnect
from redis.asyncio import Redis as AsyncRedis
from sqlmodel.ext.asyncio.session import AsyncSession

from app.games.constants import GameStatus, GAME_STATE_KEY_PREFIX
from app.games.wordsearch.wordsearch_controller import WordSearchController


class GameRoom:
    """Représente une salle de jeu avec ses joueurs connectés."""


    def __init__(
        self,
        game_id: str,
        redis_conn: AsyncRedis,
        db_session: AsyncSession,
        max_players: int = 2,
    ):
        self._game_id = game_id
        self._players: dict[str, dict[str, Any]] = {}
        self._state: GameStatus = GameStatus.WAITING_FOR_PLAYERS
        self._max_players = max_players
        self._redis_conn = redis_conn
        self._timeout_task: asyncio.Task | None = None
        self._db_session = db_session
        self._controller = WordSearchController(game_id, db_session, redis_conn)

        # Synchronisation
        self._ready_players: Set[str] = set()
        self._game_data: dict | None = None

        # 🎯 NOUVEAU: Tracking des joueurs connus (même déconnectés)
        self._known_players: Set[str] = set()
        self._start_timestamp: float | None = None


    # =========================================================================
    # PROPERTIES
    # =========================================================================

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
        return self.player_count >= self._max_players

    def is_empty(self) -> bool:
        return self.player_count == 0

    # =========================================================================
    # PLAYER MANAGEMENT
    # =========================================================================

    def add_player(self, player_id: str, websocket: WebSocket, username: str) -> bool:
        if self.is_full() or player_id in self._players:
            return False

        self._players[player_id] = {
            "websocket": websocket,
            "username": username,
        }

        self._known_players.add(player_id)
        print(f"🎮 [{self._game_id}] {username} a rejoint ({self.player_count}/{self._max_players})")
        return True
    
    def is_known_player(self, player_id: str) -> bool:
        """Vérifie si le joueur a déjà participé à cette partie."""
        return player_id in self._known_players

    def is_reconnection(self, player_id: str) -> bool:
        """
        Vérifie si c'est une reconnexion.
        True si: joueur connu ET partie déjà démarrée (pas en WAITING)
        """
        return (
            player_id in self._known_players
            and self._state != GameStatus.WAITING_FOR_PLAYERS
        )

    def remove_player(self, player_id: str) -> bool:
        if player_id in self._players:
            del self._players[player_id]
            self._ready_players.discard(player_id)
            print(f"🚪 [{self._game_id}] Joueur {player_id} retiré de la game room")
            return True
        return False

    def get_player_socket(self, player_id: str) -> WebSocket | None:
        player = self._players.get(player_id)
        return player.get("websocket") if player else None

    def get_username(self, player_id: str) -> str | None:
        player = self._players.get(player_id)
        return player.get("username") if player else None

    def get_opponent_id(self, player_id: str) -> str | None:
        for pid in self._players:
            if pid != player_id:
                return pid
        return None

    def get_opponent_info(self, player_id: str) -> dict | None:
        opponent_id = self.get_opponent_id(player_id)
        if not opponent_id:
            return None
        return {
            "id": opponent_id,
            "username": self.get_username(opponent_id),
        }
    
    def _calculate_time_remaining(self) -> int:
        """
        Calcule le temps restant en secondes.
        Utilisé pour les reconnexions afin de synchroniser le timer.
        """
        if not self._start_timestamp:
            return self._controller.GAME_DURATION_SECONDS
        
        import time
        elapsed = time.time() - self._start_timestamp
        remaining = max(0, self._controller.GAME_DURATION_SECONDS - elapsed)
        return int(remaining)

    # =========================================================================
    # MESSAGING
    # =========================================================================

    async def send_to_player(self, player_id: str, message: dict[str, Any]) -> bool:
        websocket = self.get_player_socket(player_id)
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
        failed: list[str] = []
        for player_id in list(self._players.keys()):
            if not await self.send_to_player(player_id, message):
                failed.append(player_id)
        return failed

    async def broadcast_except(self, message: dict[str, Any], exclude: str) -> list[str]:
        failed: list[str] = []
        for player_id in list(self._players.keys()):
            if player_id != exclude:
                if not await self.send_to_player(player_id, message):
                    failed.append(player_id)
        return failed

    # =========================================================================
    # GAME STATE
    # =========================================================================

    async def _get_game_state(self) -> dict | None:
        from app.models.schemas import WordSearchState

        state_key = GAME_STATE_KEY_PREFIX + self._game_id
        json_state = await self._redis_conn.get(state_key)

        if not json_state:
            return None

        if isinstance(json_state, bytes):
            json_state = json_state.decode("utf-8")

        state = WordSearchState.model_validate_json(json_state)
        return state.model_dump()

    # =========================================================================
    # FLOW PRINCIPAL
    # =========================================================================

    async def on_player_connected(self, player_id: str) -> None:
        """
        Appelé quand un joueur se connecte.
        Gère tout le flow de connexion.
        """
        # 1. Envoyer l'état d'attente au joueur
        await self.send_to_player(player_id, {
            "type": "waiting_for_opponent",
            "message": "En attente d'un adversaire...",
            "player_count": self.player_count,
            "max_players": self._max_players,
        })

        # 2. Notifier les autres qu'un joueur a rejoint
        await self.broadcast_except({
            "type": "player_joined",
            "player_id": player_id,
            "username": self.get_username(player_id),
            "player_count": self.player_count,
        }, exclude=player_id)

        # 3. Si room pleine → démarrer la préparation
        if self.is_full():
            await self._start_preparation_phase()



    async def on_player_reconnected(self, player_id: str) -> None:
            """
            Gère la reconnexion d'un joueur.
            Renvoie l'état actuel sans refaire le flow complet.
            """
            username = self.get_username(player_id)

            # Récupérer l'état actuel du jeu
            game_data = await self._get_game_state()
            opponent_info = self.get_opponent_info(player_id)

            # Calculer le temps restant si partie en cours
            time_remaining = None
            if self._state == GameStatus.GAME_IN_PROGRESS:
                time_remaining = self._calculate_time_remaining()

            
            # Envoyer l'état complet de reconnexion
            await self.send_to_player(player_id, {
                "type": "reconnected",
                "status": self._state.value,
                "game_data": game_data,

                "opponent": opponent_info,
                "start_timestamp": self._start_timestamp,
                "time_remaining": time_remaining,
                "duration_seconds": self._controller.GAME_DURATION_SECONDS,
            })

            # Notifier l'adversaire de la reconnexion
            await self.broadcast_except({
                "type": "opponent_reconnected",
                "player_id": player_id,
                "username": username,
            }, exclude=player_id)

            # # Si la partie était en cours mais pausée (adversaire déconnecté),
            # # on peut la reprendre
            # if self._state == GameStatus.GAME_IN_PROGRESS and self.is_full():
            #     await self.broadcast({
            #         "type": "game_resumed",
            #         "message": "La partie reprend !",
            #     })

    async def _start_preparation_phase(self) -> None:
        """
        Phase 1: Envoie les données de jeu à tous les joueurs.
        Attend que tous répondent "player_ready".
        """
        print(f"🎮 [{self._game_id}] Room pleine, démarrage de la préparation...")

        self._state = GameStatus.PREPARING
        self._ready_players.clear()
        self._game_data = await self._get_game_state()

        if not self._game_data:
            await self.broadcast({"type": "error", "message": "Erreur: données de jeu introuvables"})
            return

        # Envoyer à chaque joueur ses données + info adversaire
        for player_id in self._players:
            opponent_info = self.get_opponent_info(player_id)

            await self.send_to_player(player_id, {
                "type": "prepare_game",
                "game_data": self._game_data,
                "opponent": {**opponent_info,"score":0},
                "message": "Chargement de la partie...",
            })

        print(f"📤 [{self._game_id}] Données envoyées, en attente des confirmations...")

    async def on_player_ready(self, player_id: str) -> None:
        """
        Appelé quand un joueur envoie "player_ready".
        Si tous les joueurs sont prêts, démarre le countdown.
        """
        if self._state != GameStatus.PREPARING:
            print(f"⚠️ [{self._game_id}] player_ready reçu mais état = {self._state}")
            return

        self._ready_players.add(player_id)
        print(f"✅ [{self._game_id}] {self.get_username(player_id)} est prêt ({len(self._ready_players)}/{self._max_players})")

        # Notifier les autres
        await self.broadcast_except({
            "type": "opponent_ready",
            "player_id": player_id,
            "ready_count": len(self._ready_players),
        }, exclude=player_id)

        # Si tous prêts → démarrer le countdown
        if len(self._ready_players) >= self._max_players:
            await self._start_countdown_phase()

    async def _start_countdown_phase(self, countdown_seconds: int = 3) -> None:
        """
        Phase 2: Countdown avant le début de la partie.
        """
        print(f"⏳ [{self._game_id}] Tous les joueurs sont prêts, countdown...")

        self._state = GameStatus.STARTING_COUNTDOWN

        for remaining in range(countdown_seconds, 0, -1):
            await self.broadcast({
                "type": GameStatus.STARTING_COUNTDOWN.value,
                "seconds": remaining,
            })
            await asyncio.sleep(1)

        await self._start_game_phase()

    async def _start_game_phase(self) -> None:
        """Phase 3: Démarrage effectif de la partie."""
        import time

        self._state = GameStatus.GAME_IN_PROGRESS
        self._start_timestamp = time.time()

        await self.broadcast({
            "type": "game_start",
            "start_timestamp": self._start_timestamp,
            "duration_seconds": self._controller.GAME_DURATION_SECONDS,
        })

        print(f"🚀 [{self._game_id}] Partie démarrée!")



        # 🎯 CORRECTION: Lancer le timeout en arrière-plan avec asyncio.create_task
        self._timeout_task = asyncio.create_task(self._handle_timeout())

    async def _handle_timeout(self) -> None:
        """Gère le timeout de fin de partie en arrière-plan."""
        try:
            result = await self._controller.start_game()
            if result:
                print(f"⏱️ [{self._game_id}] Timeout result: {result}")
                await self._end_game(result)
        except asyncio.CancelledError:
            print(f"⏹️ [{self._game_id}] Timeout annulé")
        except Exception as e:
            print(f"❌ [{self._game_id}] Erreur timeout: {e}")
    
    # =========================================================================
    # GAME END
    # =========================================================================


    async def _end_game(self, result: dict) -> None:
        """Termine la partie et notifie les joueurs."""
        print("end game")

        self._state = GameStatus.GAME_FINISHED

        if self._timeout_task and not self._timeout_task.done():
            self._timeout_task.cancel()

        winner_id = result.get('winner_id')
        loser_id = result.get('loser_id')
        scores = result.get('scores', {})
        reason = result.get('reason', 'unknown')
        
        # 🎯 Info abandon si applicable
        abandon_player_id = result.get('abandon_player_id')
        abandon_username = result.get('abandon_username')

        winner_username = self.get_username(winner_id) if winner_id else None

        await self.broadcast({
            "type": "game_finished",
            "reason": reason,
            "winner_id": winner_id,
            "winner_username": winner_username,
            "loser_id": loser_id,
            "scores": scores,
            "abandon_player_id": abandon_player_id,
            "abandon_username": abandon_username,
        })

        print(f"🏆 [{self._game_id}] Partie terminée. Raison: {reason}, Gagnant: {winner_username or 'match nul'}")

    async def handle_player_message(
            self, 
            player_id: str, 
            data: dict,
    ) -> None:
            """Traite un message reçu d'un joueur."""
            message_type = data.get("type")

            
            match message_type:
                case 'abandon' :

                    print('abandon reçu ')

                    result = await self._controller.handle_abandon(player_id)

                    print(f"obtention du resultat de l'abandon {result}")
            
                    if result.get("status") == GameStatus.GAME_FINISHED:
                        print("fin de la game")
                        await self._end_game({
                            **result,
                            "abandon_player_id": player_id,
                            "abandon_username": self.get_username(player_id),
                        })

                    pass

                case 'player_ready':
                    await self.on_player_ready(player_id)


                # Gérer les différents types de messages
                case  "selection_update":
                    # Transmettre la sélection à l'adversaire (aperçu en temps réel)
                    opponent_id = self.get_opponent_id(player_id)
                    if opponent_id:
                        await self.send_to_player(opponent_id, {
                            **data,
                            "from": self.get_username(player_id),
                        })
                
                case  "submit_selection":
                    solution = data.get("solution")
                    result  = await self._controller.process_player_action(player_id,solution)


                    if result.get("success"):
                        # Récupérer l'état mis à jour pour calculer les mots restants

                        await self.broadcast({
                            "type":GameMessages.WORD_FOUND_SUCCESS,
                            **result,
                            "found_by":self.get_username(player_id)
                        })

                        await self.broadcast({
                            "type":GameMessages.SCORE_UPDATE,
                            "player_id":player_id,
                            "new_score":result["new_score"]
                        })

                        result =  await self._controller.check_game_completed()

                        print(f"resultat recupéré dans le websocket : {result}")

                        if(result) :
                            await self._end_game(result)
                    
                    else:
                        await self.send_to_player(player_id,{**result,"from":self.get_username(player_id)})
                    
                    pass

                case _:
                    # Transmettre les autres messages à l'adversaire
                    opponent_id = self.get_opponent_id(player_id)
                    if opponent_id:
                        await self.send_to_player(opponent_id, {
                            **data,
                            "from": self.get_username(player_id),
                        })


    async def handle_player_disconnect( self,player_id: str, game_id: str) -> None:
        """Gère la déconnexion d'un joueur."""
        self.remove_player(player_id)

        print(f"player {player_id} removed from the room ")

        # Notifier l'adversaire
        opponent_id = self.get_opponent_id(player_id)
        if opponent_id:
            await self.send_to_player(opponent_id, {
                "type": "opponent_disconnected",
                "message": "Votre adversaire s'est déconnecté.",
            })

        # # Si la partie était en cours, la terminer
        # if state == GameStatus.GAME_IN_PROGRESS and opponent_id:
        #     await self.end_game(winner_id=opponent_id, reason="opponent_disconnected")




    async def close_all_connections(self) -> None:
        """Ferme toutes les connexions WebSocket."""
        for player_id in list(self._players.keys()):
            websocket = self.get_player_socket(player_id)
            if websocket:
                try:
                    await websocket.close()
                except Exception:
                    pass
            self.remove_player(player_id)

        print(f"🔌 [{self._game_id}] Toutes les connexions fermées")
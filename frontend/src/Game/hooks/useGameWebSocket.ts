// /frontend/src/game/hooks/useGameWebSocket.ts

import { useEffect, useRef, useCallback } from 'react';
import type { GameContextValue, Player } from '../context/GameContext';
import { GameStatus } from '../../shared/GameMessages';

const API_URL = import.meta.env.VITE_API_BASE_URL;
const WS_URL = import.meta.env.VITE_WS_BASE_URL;



type GameData = {
  realtime_score: Record<string, number>;
  // ... autres champs
};

function getPlayerScore(gameData: GameData, playerId: string ): number {
  if (!gameData || !gameData.realtime_score ) {
    return 0;
  }
  return gameData.realtime_score[playerId] ?? 0;
}




// Ajouter au début du fichier
// let globalWsInstance = 0;



export function useGameWebSocket(game: GameContextValue) {
    const wsRef = useRef<WebSocket | null>(null);
    const isConnecting = useRef(false);
    const isConnected = useRef(false);

    // const instanceId = useRef(++globalWsInstance);

    // Log l'instance pour debug
    // console.log(`🔷 [Instance ${instanceId.current}] Hook créé pour ${game.me.id}`);



    const gameRef = useRef(game);
    gameRef.current = game;


    // Ajouter un wrapper pour tracer tous les envois
    const sendMessage = (ws: WebSocket, message: object) => {
        const msgStr = JSON.stringify(message);
        console.log(`📤 [${gameRef.current.me?.username}] Envoi:`, message);
        ws.send(msgStr);
    };

    const fetchWsToken = useCallback(async (): Promise<string | null> => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_URL}/ws-auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.ws_token;
        } catch {
            return null;
        }
    }, []);

    const connect = useCallback(async () => {
       

        const { gameId, gameName } = gameRef.current;
        if (!gameId || !gameName) {
            console.log('⚠️ gameId ou gameName manquant');
            return;
        }

        isConnecting.current = true;
        console.log('🔌 Connexion WebSocket...');

        const wsToken = await fetchWsToken();
        
        

        if (!wsToken) {
            console.error('❌ Pas de ws_token');
            gameRef.current.setStatus(GameStatus.ERROR);
            isConnecting.current = false;
            return;
        }

        const wsUrl = `${WS_URL}/${gameName}/${gameId}?ws_token=${wsToken}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
           
            isConnecting.current = false;
            isConnected.current = true;
            wsRef.current = ws;
            
            if(wsRef.current) console.log("Reference websocket attribué")

            // 🎯 DEBUG: Vérifier que setWs est appelé
            gameRef.current.setWs(ws);

            console.log(`✅ WebSocket connecté pour ${gameRef.current.me?.username} (${gameRef.current.me?.id})`);
        };

        ws.onclose = (event) => {
            // console.log(`🔌 [Instance ${instanceId.current}] WebSocket fermé pour ${gameRef.current.me.id}: code=${event.code}`);
            console.log(`🔌 WebSocket fermé: code=${event.code}, reason=${event.reason}, wasClean=${event.wasClean}`);
            isConnected.current = false;
            isConnecting.current = false;
            wsRef.current = null;

            if(!wsRef.current) console.log("Réference websocket null")
            
            

            // 🎯 NE PAS reconnecter automatiquement
            // Les codes 1006 (erreur handshake) et 1008 (policy) ne doivent pas retry
        };

        ws.onerror = (error) => {
            console.error('❌ WebSocket erreur:', error);
            isConnecting.current = false;
          
        };

        ws.onmessage = (event: MessageEvent) => {
            
            try {
                const data = JSON.parse(event.data);
                const g = gameRef.current;

                switch (data.type) {

             

                    case 'reconnected':
                        console.log('🔄 Reconnexion...');
                        
                        g.setGameData(data.game_data);
                        g.setOpponent(data.opponent);
                        g.setStartTimeStamp(data.start_timestamp);
                        g.setStatus(data.status);
                        g.updateScore(g.me.id,getPlayerScore(data.game_data,g.me.id))
                        if(g.opponent?.id)
                            g.updateScore(g.opponent.id,getPlayerScore(data.game_data,g.opponent.id))
                        break;

                    case 'waiting_for_opponent':
                        g.setStatus(GameStatus.WAITING_FOR_OPPONENT);
                        break;

                    case 'player_joined':
                        console.log('👤 Joueur rejoint:', data);
                        break;

                    case 'prepare_game':
                        console.log('🎮 Préparation...');
                        g.setStatus(GameStatus.PREPARING);
                        g.setGameData(data.game_data);
                        g.setOpponent(data.opponent as Player);

                        setTimeout(() => {
                            if (wsRef.current?.readyState === WebSocket.OPEN) {
                                sendMessage(wsRef.current,{type:'player_ready'})
                            }
                        }, 100);
                        break;

                    case 'opponent_ready':
                        console.log('✅ Adversaire prêt');
                        break;

                    case 'countdown':
                    case 'starting_countdown':
                        g.setStatus(GameStatus.STARTING_COUNTDOWN);
                        g.setCountdown(data.seconds as number);
                        break;

                    case 'game_start':
                        console.log('🚀 GO!');
                        g.setStatus(GameStatus.IN_PROGRESS);
                        g.setStartTimeStamp(data.start_timestamp as number);
                        g.setCountdown(null);
                        break;

                    case 'word_found':
                    case 'score_update':
                        g.updateScore(data.player_id, data.new_score);
                        break;

                    case 'game_finished':
                        console.log(data)
                        g.setGameFinishedData(data)
                        g.setGameOver();
                        
                        break;

                    default:
                        console.log('Message:', data);
                }
            } catch (error) {
                console.error('Erreur parsing:', error);
            }
        };

        // wsRef.current = ws;
    }, [fetchWsToken]);

    useEffect(() => {
        console.log('🟢 useEffect: montage');
        
        // const instanceCopy = instanceId.current
        
        connect();

        return () => {
            // console.log(`🔴 [Instance ${instanceCopy}] Cleanup pour ${gameRef.current.me.id}`);
            // console.log('🔴 useEffect: démontage');
            isConnected.current = false;
            isConnecting.current = false;
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounted');
                wsRef.current = null;
            }
        };
    }, [connect]);
}
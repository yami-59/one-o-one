// /frontend/src/hooks/useCanvasDrawing.ts

import { useState,useEffect} from 'react';
import {GAME_ID,GameMessageType} from '../../constants/wordsearchConstants'



export  const useWebSocket = (token:string,playerId:string) :  WebSocket | undefined => {


    const [ws,setWs] = useState<WebSocket|undefined>()
    
    useEffect(()=>{
        // 1. Construction de l'URL complète (avec les identifiants)
        const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/${GAME_ID}?token=${token}`;
        
    
        console.log("Tentative de connexion WebSocket...");

        const newWs = new WebSocket(wsUrl);

        setWs(newWs)

            // --- 1. GESTION DE LA CONNEXION OUVERTE (SUCCESS) ---
        newWs.onopen = () => {
            console.log(`[WS] 🔌 Connecté à la partie ${GAME_ID} en tant que ${playerId}.`);
            
            // Signal de préparation au serveur
            newWs.send(JSON.stringify({ 
                type: GameMessageType.PLAYER_READY, 
                message: "Client is ready for the game." 
            }));
        };
        
        // --- 3. GESTION DES ERREURS (ÉCHEC DE CONNEXION) ---
        newWs.onerror = (error) => {
            // Souvent causé par un problème réseau ou un serveur injoignable au départ
            console.error("[WS] ❌ Erreur de connexion:", error);
        };

        // --- 4. GESTION DE LA FERMETURE ---
        newWs.onclose = (event) => {
            if (event.wasClean) {
                console.log(`[WS] 🔌 Déconnexion propre, code=${event.code} raison=${event.reason}`);
            } else {
                // Ex: Le serveur s'est éteint brusquement ou la connexion a été perdue
                console.warn(`[WS] 🚨 Déconnexion anormale: Connexion coupée.`);
            }
        };


        // 4. NETTOYAGE CRITIQUE : Fermer la connexion lors du démontage du composant ou du changement de dépendance
        return () => {
            if (newWs && newWs.readyState === newWs.OPEN) {
                 console.log("Nettoyage: Fermeture de la connexion WS.");
                 newWs.close();
            }
        }; 

    },[token,playerId])

  

    return ws

}
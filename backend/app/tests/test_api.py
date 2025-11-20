# /backend/tests/test_api.py
import pytest
from app.models.tables import *
from sqlalchemy import select
import uuid
from app.models.schemas import *
from app.utils.utils import *


# Utilise la fixture 'client' définie dans conftest.py
def test_read_root(client):
    """Vérifie que la route de base est fonctionnelle."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Bienvenue sur l'API One'o One. Voir /docs pour les endpoints."}

# # 🎯 Si votre session est asynchrone, le test doit être marqué
# @pytest.mark.asyncio 
# async def test_create_guest(client,db_session): # 🎯 session est injectée par Pytest
    
#     # 1. Préparation des données d'entrée (simulons l'absence d'ID)
#     # Le frontend envoie une requête pour créer un invité
    
#     # 2. Exécution de la requête API (SYNCHRONE, si TestClient est utilisé)
#     response = client.post(
#         "/api/v1/new_guest"
#     ) 

#     response_data = response.json()
    
#     # Désérialisation pour récupérer l'identifiant
#     player = User.model_validate(response_data)
    
#     #Vérification de l'existence dans la base de données
#     query = (
#         # 🎯 CORRECTION: Utilise la syntaxe SQLAlchemy/SQLModel
#         select(User).where(User.identifier == player.identifier) 
#     )

    
#     #Exécution de la requête DB (DOIT être await si la session est asynchrone)
#     result = await db_session.exec(query)
#     user_in_db = result.first()
    
#     # Validation de la réponse API
#     assert response.status_code == 201 # Le code doit être 200/201 selon votre implémentation
#     # Assertion
#     assert user_in_db is not None, "L'utilisateur n'a pas été créé en base de données."

# @pytest.mark.asyncio
# async def test_join_queue(client,db_session):
    
#     # création d'un utilisateur factice dans la db
#     u_id1=str(uuid.uuid4())
#     u_id2=str(uuid.uuid4())
#     playerA=PlayerIdentifier(identifier=u_id1)
    
#     playerB=PlayerIdentifier(identifier=u_id2)

#     playerA.model_dump_json()
#     # Test du premier joueur à etre en attente
#     response = client.post(
#         "/api/v1/join-queue", 
#         json=playerA.model_dump() # 🎯 Les données JSON sont passées via l'argument 'json'
#     )

#     response_data=response.json()


#     assert response.status_code==200
#     assert response_data["message"]=="En attente d'un adversaire..."
#     assert response_data["status"] == Status.waiting


#     # test de même joueur renvoyant une requête à l'api
#     response = client.post(
#         "/api/v1/join-queue", 
#         json=playerA.model_dump() # 🎯 Les données JSON sont passées via l'argument 'json'
#     )

#     response_data=response.json()

    
#     assert response.status_code==200
#     assert response_data["message"]=="Vous êtes déjà en file d'attente."
#     assert response_data["status"] == Status.alreadyWaiting


#     #test du second joueur arrivant en file d'attente 
#     response = client.post(
#         "/api/v1/join-queue", 
#         json=playerB.model_dump() # 🎯 Les données JSON sont passées via l'argument 'json'
#     )

#     response_data=response.json()


#     #Vérification de l'existence dans la base de données
#     query = (
#         # 🎯 CORRECTION: Utilise la syntaxe SQLAlchemy/SQLModel
#         select(GameSession).where(GameSession.player1_identifier==playerA.identifier and GameSession.player2_identifier==playerB.identifier) 
#     )

#     #Exécution de la requête DB (DOIT être await si la session est asynchrone)
#     result = await db_session.exec(query)
#     game = result.first()

    
        
#     assert response.status_code==200
#     assert response_data["message"]=="Match trouvé ! Début de la session de jeu."
#     assert response_data["status"] == Status.matched
#     assert response_data["opponent_identifier"]== playerA.identifier
#     assert game is not None , "Le jeux n'est pas en bd ou les données ne sont pas bonnes"
     
#     pass

# @pytest.mark.asyncio
# async def test_websocket_broadcast(client, db_session):
#     """
#     Teste si deux joueurs peuvent se connecter à un même game_id valide 
#     et si les messages sont diffusés (broadcast) à tous les connectés.
#     """
#     # --- 1. SETUP: Créer les utilisateurs et la session de jeu en DB ---
    
#     # Créer les identifiants de test (Player A et Player B)
#     player_a_id = f"test-p-a-{uuid.uuid4()}"
#     player_b_id = f"test-p-b-{uuid.uuid4()}"
#     game_uuid = str(uuid.uuid4())
    
#     # Créer les utilisateurs dans la DB de test
#     user_a = User(identifier=player_a_id)
#     user_b = User(identifier=player_b_id)
#     db_session.add(user_a)
#     db_session.add(user_b)
    
#     # Créer l'objet GameSession (avec des données minimales)
#     game_session = GameSession(
#         game_id=game_uuid,
#         player1_identifier=player_a_id,
#         player2_identifier=player_b_id,
#         # Utiliser un dictionnaire simple pour l'état JSONB si GameStateBase n'est pas encore prêt
#         current_state={}, 
#         game_type="mot_mele"
#     )
#     db_session.add(game_session)
#     await db_session.commit()
#     await db_session.refresh(game_session)
    
#     # --- 2. CONNEXION DES JOUEURS ---
    
#     # La route WS est /ws/game/{game_id}/{player_identifier}
#     ws_url = f"/ws/game/{game_uuid}"

#     # Utiliser le TestClient (synchrone) pour simuler la connexion asynchrone
#     with client.websocket_connect(f"{ws_url}/{player_a_id}") as websocket_a, \
#          client.websocket_connect(f"{ws_url}/{player_b_id}") as websocket_b:
        
#         # 3. CONSOMMER LES MESSAGES DE CONNEXION INITIALE (handshake + player_joined)
#         # Chaque joueur reçoit un message 'player_joined' de lui-même et de son adversaire.
#         # On lit les messages en double pour vider le buffer.
#         websocket_a.receive_json() 
#         websocket_a.receive_json() 
#         websocket_b.receive_json()
#         websocket_b.receive_json()

#         # --- 4. ACTION : Le joueur A envoie un message ---
#         test_message = {"action": "move", "data": "mot_selectionne"}
#         websocket_a.send_json(test_message)

#         # --- 5. ASSERTION : Le joueur B reçoit le message du joueur A ---
#         # Le serveur devrait renvoyer un message d'écho à tous les connectés.
        
#         # On lit le message reçu par le joueur B
#         received_data = websocket_b.receive_json() 
        
#         # Vérification du contenu diffusé
#         assert received_data["type"] == "echo"
#         assert received_data["sender"] == player_a_id
#         assert received_data["data"]["data"] == "mot_selectionne"
        
#         print(f"\n✅ Test WS réussi: Diffusion du message de {player_a_id} à {player_b_id}.")
        
#     # Le bloc 'with' se termine et nettoie les connexions WS.
#     # Le rollback de la fixture db_session nettoie les données DB créées.


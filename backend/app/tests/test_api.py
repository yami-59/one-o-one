# /backend/tests/test_api.py
import pytest
from app.models.tables import User,GameSession
from sqlmodel import select
from app.utils.auth import * 
from app.models.schemas import *
from app.utils.enums import *
from fastapi import status
from app.models.schemas import *
from app.models.schemas import TokenResponse


# Utilise la fixture 'client' définie dans conftest.py
def test_read_root(client):
    """Vérifie que la route de base est fonctionnelle."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Bienvenue sur l'API One'o One. Voir /docs pour les endpoints."}



# /backend/tests/test_api.py (Test Player A rejoint une file vide)

@pytest.mark.asyncio
async def test_player_a_joins_queue_empty(client):
    """
    Vérifie que le premier joueur est placé dans la file d'attente (Status.waiting).
    """
    
    player_id=generate_guest_identifier()
    test_player_token=create_access_token(player_id)
    test_auth_header = {"Authorization": f"Bearer {test_player_token}"}
    # L'identifiant est transporté via le token, pas le corps de la requête.
    response = client.post(
        "/api/v1/matchmaking/join",
        headers=test_auth_header, # 🎯 Fournit le JWT dans l'en-tête
        json={} # Le corps peut être vide
    )
    
    response_data = response.json()
    
    # 1. Vérification du statut (202 ACCEPTED serait mieux pour l'attente)
    assert response.status_code == status.HTTP_200_OK # Si la route retourne 200 OK
    assert response_data["status"] == "waiting"


    response=client.post(
        "/api/v1/matchmaking/reset"  # Le corps peut être vide
    )

    response_data = response.json()
    
    assert response.status_code == status.HTTP_200_OK
    
    # 2. Vérification DB (Optionnel) : Vérifier que l'ID du joueur A est dans la variable globale
    # Note: On ne peut pas facilement tester la variable globale 'WAITING_PLAYER_ID' dans un test unitaire,
    # mais on peut vérifier l'état du serveur ou utiliser un mock si besoin.

@pytest.mark.asyncio
async def test_match_found_scenario(client, db_session):
    # Créer les données d'identification de deux joueurs différents pour le test
    player_a_id = generate_guest_identifier()
    token_a = create_access_token(player_a_id, timedelta(minutes=30))
    header_a = {"Authorization": f"Bearer {token_a}"}

    player_b_id = generate_guest_identifier()
    token_b = create_access_token(player_b_id, timedelta(minutes=30))
    header_b = {"Authorization": f"Bearer {token_b}"}


    # 1. Joueur A rejoint la file (Setup)
    client.post("/api/v1/matchmaking/join", headers=header_a, json={}) 

    # 2. Joueur B rejoint la file (Exécution du Test)
    response_b = client.post("/api/v1/matchmaking/join", headers=header_b, json={})
    
    response_data = response_b.json()

    # 3. Validation de la Réponse
    assert response_data["status"] == "matched"
    assert response_data["opponent_identifier"] == player_a_id # Vérifie le Match FCFS
    
    # 4. Vérification de la création de la GameSession dans la DB (via db_session)
    # ...



@pytest.mark.asyncio 
async def test_guest_login(client, db_session): # Fixture db_session est l'AsyncSession
    
    # 1. Exécution de la requête API (crée l'utilisateur)
    # Le TestClient est synchrone (pas d'await sur l'appel client.post)
    response = client.post(
        "/api/v1/guest/login"
    ) 

    response_data = response.json()
    
    # 2. Validation du Statut HTTP
    assert response.status_code == status.HTTP_201_CREATED
    
    # 3. Désérialisation pour obtenir l'objet complet créé
    # Pydantic validera les données de la réponse (y compris l'ID généré par la DB)
    tokenResponse = TokenResponse.model_validate(response_data)
    
    # 4. Vérification de l'existence dans la base de données (en utilisant l'ID créé)
    query = (
        select(User)
        .where(User.identifier == tokenResponse.player_identifier) 
    )
    
    # 5. Exécution de la requête DB
    result = await db_session.exec(query)
    
    # Utiliser .scalars().first() pour désencapsuler l'objet User du curseur
    user_in_db = result.first()
    
    # 6. Assertions finales
    assert user_in_db is not None, "L'utilisateur n'a pas été créé en base de données."
    assert user_in_db.identifier == tokenResponse.player_identifier, "L'ID de l'utilisateur dans la DB ne correspond pas à l'ID de la réponse."



# On suppose que db_session et client sont des fixtures injectées

@pytest.mark.asyncio
async def test_websocket_broadcast(client, db_session):
    """
    Teste la connexion, la diffusion (broadcast) et la réception de messages 
    entre deux joueurs connectés à la même session de jeu.
    """
    # --- 1. SETUP: Créer les utilisateurs et la session de jeu en DB ---
    
    player_a_id = f"test-p-a-{uuid.uuid4()}"
    player_b_id = f"test-p-b-{uuid.uuid4()}"
    game_uuid = str(uuid.uuid4())


    token_a = create_access_token(player_a_id, timedelta(minutes=30))
    token_b = create_access_token(player_b_id, timedelta(minutes=30))
    

    # Créer et enregistrer la GameSession
    game_session = GameSession(
        game_id=game_uuid,
        player1_identifier=player_a_id,
        player2_identifier=player_b_id,
        # 🎯 Utiliser l'objet Python qui sera sérialisé en JSONB
        game_data=GameStateBase().model_dump_json(), 
        game_name="WORDSEARCH"
    )
    
    db_session.add(User(identifier=player_a_id))
    db_session.add(User(identifier=player_b_id))
    db_session.add(game_session)
    await db_session.commit()
    await db_session.refresh(game_session)
    
    # --- 2. CONNEXION ET CONSOMMATION DES MESSAGES DE SETUP ---
    
    ws_url_a = f"api/v1/ws/game/{game_uuid}?token={token_a}"
    ws_url_b = f"api/v1/ws/game/{game_uuid}?token={token_b}"

    with client.websocket_connect(f"{ws_url_a}") as websocket_a, \
         client.websocket_connect(f"{ws_url_b}") as websocket_b:
        
        # Amélioration: Consommer tous les messages "player_joined" envoyés
        # par le broadcast lors des deux connexions, sans supposer qu'il y en a exactement 4.
        # Nous lisons jusqu'à ce que le buffer soit vide ou que le message crucial arrive.
        
        # On lit un message final de B pour confirmer qu'il a bien reçu les messages précédents
        initial_join_b = websocket_b.receive_json()
        assert initial_join_b["type"] == "player_joined"

        # --- 3. ACTION : Le joueur A envoie un message ---
        test_message = {"action": "move", "data": "mot_selectionne"}
        websocket_a.send_json(test_message)

        # --- 4. ASSERTION : Le joueur B reçoit le message du joueur A ---
        
        # On lit le message d'écho reçu par le joueur B
        received_data = websocket_b.receive_json() 
                
        # Vérification du contenu diffusé
        assert received_data["type"] == "echo"
        assert received_data["sender"] == player_a_id
        assert received_data["data"]["data"] == "mot_selectionne"
        
        
        print(f"\n✅ Test WS réussi: Diffusion du message de {player_a_id} à {player_b_id}.")
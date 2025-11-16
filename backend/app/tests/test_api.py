# /backend/tests/test_api.py
import pytest
from app.models.tables import User
from sqlalchemy import select

# Utilise la fixture 'client' définie dans conftest.py
def test_read_root(client):
    """Vérifie que la route de base est fonctionnelle."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Bienvenue sur l'API One'o One. Voir /docs pour les endpoints."}

# 🎯 Si votre session est asynchrone, le test doit être marqué
@pytest.mark.asyncio 
async def test_create_guest(client,db_session): # 🎯 session est injectée par Pytest
    
    # 1. Préparation des données d'entrée (simulons l'absence d'ID)
    # Le frontend envoie une requête pour créer un invité
    
    # 2. Exécution de la requête API (SYNCHRONE, si TestClient est utilisé)
    response = client.post(
        "/api/v1/new_guest"
    ) 

    response_data = response.json()
    
    # Désérialisation pour récupérer l'identifiant
    player = User.model_validate(response_data)
    
    #Vérification de l'existence dans la base de données
    query = (
        # 🎯 CORRECTION: Utilise la syntaxe SQLAlchemy/SQLModel
        select(User).where(User.identifier == player.identifier) 
    )

    
    #Exécution de la requête DB (DOIT être await si la session est asynchrone)
    result = await db_session.exec(query)
    user_in_db = result.first()
    
    # Validation de la réponse API
    assert response.status_code == 201 # Le code doit être 200/201 selon votre implémentation
    # Assertion
    assert user_in_db is not None, "L'utilisateur n'a pas été créé en base de données."
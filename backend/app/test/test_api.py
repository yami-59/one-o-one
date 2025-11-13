# /backend/tests/test_api.py
import pytest

# Utilise la fixture 'client' définie dans conftest.py
@pytest.mark.asyncio
async def test_read_root(client):
    """Vérifie que la route de base est fonctionnelle."""
    response = await client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Bienvenue sur l'API One'o One. Voir /docs pour les endpoints."}


@pytest.mark.asyncio
async def test_join_queue_new_user(client):
    """Vérifie qu'un nouvel utilisateur invité est placé en file d'attente."""
    response = await client.post(
        "/api/v1/join-queue", 
        headers={"X-Player-Identifier": None} # Pas d'ID, le backend doit en générer un
    )
    assert response.status_code == 200
    assert response.json()["status"] == "waiting"
    assert "guest-" in response.json()["identifier"] # Vérifie qu'un nouvel ID est généré
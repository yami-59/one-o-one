# /backend/tests/test_api.py
import pytest
from app.models import *


# Utilise la fixture 'client' définie dans conftest.py
def test_read_root(client):
    """Vérifie que la route de base est fonctionnelle."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Bienvenue sur l'API One'o One. Voir /docs pour les endpoints."}


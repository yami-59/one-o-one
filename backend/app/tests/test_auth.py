# /backend/tests/test_auth.py

import pytest
from fastapi import status


class TestGuestLogin:
    """Tests pour l'authentification invité."""

    def test_guest_login_creates_user(self, client):
        """POST /guest/login crée un utilisateur et retourne un token."""
        response = client.post("/api/v1/guest/login")
        
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        
        assert "access_token" in data
        assert "user_info" in data
        assert data["user_info"]["username"].startswith("guest-")

    def test_guest_login_unique_users(self, client):
        """Chaque appel crée un utilisateur différent."""
        response1 = client.post("/api/v1/guest/login")
        response2 = client.post("/api/v1/guest/login")
        
        assert response1.json()["user_info"]["user_id"] != response2.json()["user_info"]["user_id"]


class TestTokenRefresh:
    """Tests pour le rafraîchissement de token."""

    @pytest.mark.asyncio
    async def test_refresh_valid_token(self, async_client, test_user_with_token):
        """POST /refresh avec token valide retourne nouveau token."""
        response = await async_client.post(
            "/api/v1/refresh",
            headers=test_user_with_token["headers"],
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "access_token" in data
        assert data["user_info"]["user_id"] == test_user_with_token["user"].user_id

    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self, async_client):
        """POST /refresh avec token invalide retourne 401."""
        response = await async_client.post(
            "/api/v1/refresh",
            headers={"Authorization": "Bearer invalid_token"},
        )
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
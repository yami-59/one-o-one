# /backend/tests/test_matchmaking.py

import pytest
from fastapi import status


class TestMatchmaking:
    """Tests pour le système de matchmaking."""

    @pytest.mark.asyncio
    async def test_join_queue(self, async_client, test_user_with_token, clean_redis):
        """POST /matchmaking/join ajoute le joueur à la file."""
        response = await async_client.post(
            "/api/v1/matchmaking/join",
            json={"game_name": "wordsearch"},
            headers=test_user_with_token["headers"],
        )
        
        assert response.status_code == status.HTTP_202_ACCEPTED
        assert response.json()["status"] == "waiting"

    @pytest.mark.asyncio
    async def test_leave_queue(self, async_client, test_user_with_token, clean_redis):
        """POST /matchmaking/leave retire le joueur de la file."""
        # D'abord rejoindre
        await async_client.post(
            "/api/v1/matchmaking/join",
            json={"game_name": "wordsearch"},
            headers=test_user_with_token["headers"],
        )
        
        # Puis quitter
        response = await async_client.post(
            "/api/v1/matchmaking/leave",
            json={"game_name": "wordsearch"},
            headers=test_user_with_token["headers"],
        )
        
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["status"] == "left"

    pass
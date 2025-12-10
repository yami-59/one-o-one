from datetime import datetime, timezone
from typing import List,Dict,Any

from pydantic import EmailStr
from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel
from sqlalchemy.dialects.postgresql import JSON # Pour la clarté


class GameSession(SQLModel, table=True):
    game_id: str = Field(index=True, primary_key=True)

    game_name: str = Field(default=None)

    game_data: Dict[str,Any] = Field(default=dict, sa_type=JSON)

    player1_id: str = Field(foreign_key="user.user_id")
    player2_id: str = Field(foreign_key="user.user_id")

    created_at: datetime = Field(
        # Utiliser la bonne factory UTC
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        sa_type=DateTime(timezone=True),
    )

    winner_id: str | None = Field(default=None)


class User(SQLModel, table=True):
    user_id:str = Field(index=True,primary_key=True)
    username: str = Field(index=True, unique=True)
    #  Le champ email peut être NULL, mais s'il est fourni, il doit être unique.
    mail: EmailStr | None = Field(default=None, unique=True)
    victories: int = Field(default=0)
    defeats: int = Field(default=0)
    created_at: datetime = Field(
        # Utiliser la bonne factory UTC
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        sa_type=DateTime(timezone=True),
    )


# Modèle pour les dictionnaires de mots (JSONB pour la liste de mots)
class WordList(SQLModel, table=True):
    theme: str = Field(primary_key=True)  # Rendre le nom unique
    words: List[str] = Field(
        sa_type=JSON,
    )

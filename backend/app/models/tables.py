from sqlmodel import Field, SQLModel
from .schemas import GameStateBase
from datetime import datetime,timezone
from app.utils.utils import Status
from pydantic import EmailStr
from sqlalchemy.types import JSON
from typing import List
from sqlalchemy import DateTime

class GameSession(SQLModel, table=True):
    id: int|None = Field(default=None, primary_key=True)
    game_id: str = Field(index=True, unique=True)
    
    # game_type: str = Field(foreign_key='gametype.type') 
    game_type: str = Field(foreign_key='gametype.type') 
    
    game_data: GameStateBase = Field(sa_type=JSON)
    
    player1_identifier: str = Field(foreign_key='user.identifier')
    player2_identifier: str = Field(foreign_key='user.identifier')
    
    
    status: Status = Field(default=Status.waiting)
    created_at: datetime = Field(
            # Utiliser la bonne factory UTC
            default_factory=lambda: datetime.now(timezone.utc),
            nullable=False,
            sa_type=DateTime(timezone=True) 
        )

# --- NOUVEAU MODÈLE pour valider les types de jeu ---
class GameType(SQLModel, table=True):
    id:int|None = Field(default=None, primary_key=True)
    type: str = Field(unique=True) # Ex: "mot_mele", "quiz"

class User(SQLModel, table=True): 
    id: int|None = Field(default=None, primary_key=True)
    identifier: str = Field(index=True, unique=True)
    #  Le champ email peut être NULL, mais s'il est fourni, il doit être unique.
    mail: EmailStr|None = Field(default=None, unique=True)
    victories: int = Field(default=0)
    defeats : int = Field(default=0)
    created_at: datetime = Field(
            # Utiliser la bonne factory UTC
            default_factory=lambda: datetime.now(timezone.utc),
            nullable=False,
            
   
            sa_type=DateTime(timezone=True) 
        )


# Modèle pour les dictionnaires de mots (JSONB pour la liste de mots)
class WordList(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True) # Rendre le nom unique
    words: List[str] = Field(
        sa_type=JSON,
    )
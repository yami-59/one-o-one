from typing import Optional
from sqlmodel import Field, SQLModel
from gameSchemas import GameStateBase
from datetime import datetime



class Game_session(SQLModel,table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    game_id: str = Field(index=True, unique=True)
    game_type: str = Field(foreign_key='game_types.type')
    
    # 🎯 Déclaration du champ JSONB
    # SQLModel utilise automatiquement JSONB car c'est un modèle Pydantic non-SQLModel
    current_state: GameStateBase 
    
    player1_identifier: str | None
    player2_identifier: str | None
    status: str = Field(default="waiting")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)


    pass
    

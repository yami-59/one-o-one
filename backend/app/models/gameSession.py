from typing import Optional
from sqlmodel import Field, SQLModel
from gameSchemas import GameStateBase
from datetime import datetime


class Game_session(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    game_id: str = Field(index=True, unique=True)
    
    game_type: str = Field(foreign_key='gametype.type') 
    
    # 🎯 CORRECTION JSONB : Utilise le modèle Pydantic parent qui sera sérialisé
    current_state: GameStateBase 
    
    player1_identifier: str = Field(foreign_key='user.identifier')
    player2_identifier: str = Field(foreign_key='user.identifier')
    status: str = Field(default="waiting")
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
from sqlmodel import Field, SQLModel
from gameSchemas import GameStateBase
from datetime import datetime
from utils.enums import Status





class Game_session(SQLModel, table=True):
    id: int|None = Field(default=None, primary_key=True)
    game_id: str = Field(index=True, unique=True)
    
    game_type: str = Field(foreign_key='gametype.type') 
    
    # Utilise le modèle Pydantic parent qui sera sérialisé
    gameData: GameStateBase 
    
    player1_identifier: str = Field(foreign_key='user.identifier')
    player2_identifier: str = Field(foreign_key='user.identifier')
    status: Status = Field(default=Status.waiting)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
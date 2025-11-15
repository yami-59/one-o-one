from sqlmodel import Field, SQLModel
from .gameSchemas import GameStateBase
from datetime import datetime
from app.utils.enums import Status
# Source - https://stackoverflow.com/a
# Posted by Bob, modified by community. See post 'Timeline' for change history
# Retrieved 2025-11-13, License - CC BY-SA 4.0
from sqlalchemy.types import JSON


class GameSession(SQLModel, table=True):
    id: int|None = Field(default=None, primary_key=True)
    game_id: str = Field(index=True, unique=True)
    
    game_type: str = Field(foreign_key='gametype.type') 
    
    gameData: GameStateBase = Field(sa_type=JSON)
    
    player1_identifier: str = Field(foreign_key='user.identifier')
    player2_identifier: str = Field(foreign_key='user.identifier')
    status: Status = Field(default=Status.waiting)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
from typing import Optional
from sqlmodel import Field, SQLModel
from gameSchemas import BoardState
from datetime import datetime



class Game_types(SQLModel,table=True):
    type : Optional[str] = Field(default=None, primary_key=True)

    pass
from typing import Optional
from sqlmodel import Field, SQLModel
from gameSchemas import BoardState
from datetime import datetime
from typing import List, Dict



class word_lists(SQLModel,table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name : str | None
    words : List[str] | None 
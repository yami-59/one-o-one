from sqlmodel import Field, SQLModel
from datetime import datetime
from pydantic import EmailStr

class User(SQLModel, table=True): 
    id: int|None = Field(default=None, primary_key=True)
    identifier: str = Field(index=True, unique=True)
    #  Le champ email peut être NULL, mais s'il est fourni, il doit être unique.
    mail: EmailStr|None = Field(default=None, unique=True)
    victories: int = Field(default=0)
    defeats : int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime

class User(SQLModel, table=True): 
    id: Optional[int] = Field(default=None, primary_key=True)
    identifier: str = Field(index=True, unique=True)
    # Correction : Le champ email peut être NULL, mais s'il est fourni, il doit être unique.
    mail: Optional[str] = Field(default=None, unique=True)
    points: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
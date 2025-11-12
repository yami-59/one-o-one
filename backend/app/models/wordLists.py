from typing import Optional
from sqlmodel import Field, SQLModel
from gameSchemas import BoardState
from datetime import datetime
from typing import List, Dict



# Modèle pour les dictionnaires de mots (JSONB pour la liste de mots)
class WordList(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True) # Rendre le nom unique
    words: List[str] = Field(default_factory=list)
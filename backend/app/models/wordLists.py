from sqlmodel import Field, SQLModel
from typing import List



# Modèle pour les dictionnaires de mots (JSONB pour la liste de mots)
class WordList(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True) # Rendre le nom unique
    words: List[str] = Field(default_factory=list)
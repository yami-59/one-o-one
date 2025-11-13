from sqlmodel import Field, SQLModel
from typing import List
from sqlalchemy import ARRAY, String # Importez le type ARRAY et le type des éléments



# Modèle pour les dictionnaires de mots (JSONB pour la liste de mots)
class WordList(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True) # Rendre le nom unique
    words: List[str] = Field(sa_type=ARRAY(String))
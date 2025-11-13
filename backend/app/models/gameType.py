from typing import Optional
from sqlmodel import Field, SQLModel
from gameSchemas import BoardState
from datetime import datetime


# --- NOUVEAU MODÈLE pour valider les types de jeu ---
class GameType(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    type: str = Field(unique=True) # Ex: "mot_mele", "quiz"
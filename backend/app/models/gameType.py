from sqlmodel import Field, SQLModel


# --- NOUVEAU MODÈLE pour valider les types de jeu ---
class GameType(SQLModel, table=True):
    id:int|None = Field(default=None, primary_key=True)
    type: str = Field(unique=True) # Ex: "mot_mele", "quiz"
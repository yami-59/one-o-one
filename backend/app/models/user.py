from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime


# 1. Hérite de SQLModel et indique table=True
class User(SQLModel, table=True): 
    # Le nom de la table sera 'user' par défaut

    # 2. Clé Primaire (PK) et Auto-incrémentée
    # Optional[int] est utilisé pour les champs que SQLModel doit générer
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 3. Champs Simples avec types Python
    identifier: str = Field(index=True, unique=True) # Clé unique pour l'invité
    mail:Optional[str] = Field(default=None,unique=True)
    points: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    
    pass



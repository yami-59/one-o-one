# /backend/app/utils/json_conversion.py (Nouveau fichier)

from sqlmodel import SQLModel
from typing import Any
from pydantic import BaseModel

def to_json_string(obj: SQLModel | BaseModel) -> str:
    """
    Convertit un objet SQLModel (ou Pydantic) en chaîne JSON.
    Ceci est utile avant d'insérer l'état de jeu dans Redis.
    """
    # Utilise la méthode native de Pydantic/SQLModel pour dumper en JSON
    return obj.model_dump_json()

# Exemple d'utilisation :
# etat_jeu_json = to_json_string(mon_etat_de_partie)


# /backend/app/utils/json_conversion.py (suite)

def from_json_string(json_string: str, model_type: type[SQLModel]|type[BaseModel]) -> SQLModel | BaseModel:
    """
    Convertit une chaîne JSON en un objet SQLModel/Pydantic spécifié.
    Ceci est utile après avoir récupéré l'état de jeu depuis Redis.
    """
    # Utilise la méthode de validation de Pydantic/SQLModel pour parser et valider la chaîne JSON
    return model_type.model_validate_json(json_string)

# Exemple d'utilisation :
# nouvel_etat_jeu = from_json_string(etat_jeu_json, WordSearchState)
# print(nouvel_etat_jeu.grid_data) # Vous avez accès aux attributs typés
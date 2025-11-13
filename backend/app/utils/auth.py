import uuid





def generate_guest_identifier(prefix: str = "guest-") -> str:
    """
    Génère un identifiant unique préfixé pour les utilisateurs invités.
    Exemple: "guest-a1b2c3d4-e5f6-7890-1234-567890abcdef"
    """
    # uuid.uuid4() crée un UUID aléatoire
    unique_id = uuid.uuid4()
    return f"{prefix}{unique_id}"
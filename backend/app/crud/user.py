from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.user import User
from app.utils.auth import generate_guest_identifier
from sqlmodel import select



async def createGuest(session : AsyncSession):
    new_identifier=""

    while True:
        new_identifier = generate_guest_identifier()
        # 1. Vérification en DB (méthode safe pour les invités)
        player = session.exec(select(User).where(User.identifier == new_identifier)).first()
        if not player : 
            break
        # La variable 'new_identifier' est garantie d'exister ici et d'être unique en DB.
        print(f"Nouvel identifiant unique trouvé : {new_identifier}")
    # Créer le joueur en mode invité avec l'identifiant unique
    player = User(new_identifier)
    session.add(player)
    session.commit()
    session.refresh(player)

    return new_identifier
    
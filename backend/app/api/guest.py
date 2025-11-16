from fastapi import APIRouter,status
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.tables import User
from sqlmodel import select,desc
from .dependencies import SessionDep



async def createGuest(session : AsyncSession):

    query = (
        select(User.id) # 🎯 1. Ne sélectionner que l'ID pour optimiser
        .order_by(desc(User.id)) # 🎯 2. Trier par ID (le plus grand est le plus récent)
        .limit(1)                # 🎯 3. Limiter à un seul résultat
    )

    result=await session.exec(query)

    result=result.one_or_none()

    if(result==None):
        result=1

    # Créer le joueur en mode invité avec l'identifiant unique
    player = User(identifier=f"guest_{result}")
    session.add(player)
    await session.commit()
    await session.refresh(player)

    return player
    

router = APIRouter()

@router.post("/new_guest",status_code=status.HTTP_201_CREATED,response_model=User)
async def new_guest(session:SessionDep):
    player=await createGuest(session)
    return player
from fastapi import APIRouter,status
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.tables import User
from sqlmodel import select,desc
from .dependencies import SessionDep
import uuid



async def createGuest(session : AsyncSession):

   
    # Créer le joueur en mode invité avec l'identifiant unique
    player = User(identifier=f"guest_{str(uuid.uuid4())}")
    session.add(player)
    await session.commit()
    await session.refresh(player)

    return player
    

router = APIRouter()

@router.post("/new_guest",status_code=status.HTTP_201_CREATED,response_model=User)
async def new_guest(session:SessionDep):
    player=await createGuest(session)
    return player
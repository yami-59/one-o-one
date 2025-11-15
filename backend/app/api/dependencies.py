# /backend/app/api/dependencies.py (Nouveau fichier)

from fastapi import Depends
from typing import Annotated
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.db import get_session


SessionDep = Annotated[AsyncSession,Depends(get_session)]
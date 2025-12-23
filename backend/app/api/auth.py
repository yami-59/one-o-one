from datetime import timedelta

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.core.db import SessionDep
from app.core.settings import settings
from app.lib.auth import (
    create_access_token,
    generate_guest_username,
    generate_user_id,
    TokenDep,
    get_current_user_id,
)
from app.models.tables import User

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =============================================================================
# Schemas
# =============================================================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user_info: dict  # avoid returning password_hash


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    mail: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    mail: EmailStr
    password: str


def hash_password(p: str) -> str:
    return pwd_context.hash(p)


def verify_password(p: str, h: str) -> bool:
    return pwd_context.verify(p, h)


def build_user_info(u: User) -> dict:
    # return only safe fields
    return {
        "user_id": u.user_id,
        "username": u.username,
        "mail": u.mail,
        "victories": getattr(u, "victories", 0),
        "defeats": getattr(u, "defeats", 0),
        "created_at": getattr(u, "created_at", None),
    }


# =============================================================================
# Guest login
# =============================================================================

@router.post("/guest/login", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def login_guest(session: SessionDep):
    new_id = generate_user_id()
    new_username = generate_guest_username()

    db_user = User(user_id=new_id, username=new_username)

    try:
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création de l'utilisateur invité: {e}",
        )

    expires = timedelta(days=7)
    access_token = create_access_token(new_id, expires)

    return TokenResponse(
        access_token=access_token,
        user_info=build_user_info(db_user),
    )


# =============================================================================
# Email register / login  (NEW)
# =============================================================================

@router.post("/auth_email/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register_email(payload: RegisterRequest, session: SessionDep):
    mail = payload.mail.lower().strip()

    # 1) check email already used
    existing = (await session.exec(select(User).where(User.mail == mail))).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered.",
        )

    # 2) create user
    new_id = generate_user_id()
    db_user = User(
        user_id=new_id,
        username=payload.username.strip(),
        mail=mail,
        password_hash=hash_password(payload.password),
    )

    try:
        session.add(db_user)
        await session.commit()
        await session.refresh(db_user)
    except IntegrityError:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists (unique constraint).",
        )
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {e}",
        )

    # 3) token
    expires = timedelta(days=7)
    access_token = create_access_token(db_user.user_id, expires)

    return TokenResponse(
        access_token=access_token,
        user_info=build_user_info(db_user),
    )


@router.post("/auth_email/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login_email(payload: LoginRequest, session: SessionDep):
    mail = payload.mail.lower().strip()

    user: User | None = (await session.exec(select(User).where(User.mail == mail))).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    if not getattr(user, "password_hash", None):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    expires = timedelta(days=7)
    access_token = create_access_token(user.user_id, expires)

    return TokenResponse(
        access_token=access_token,
        user_info=build_user_info(user),
    )


# =============================================================================
# Refresh
# =============================================================================

@router.post("/refresh", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def refresh_token(token_to_refresh: TokenDep, session: SessionDep):
    try:
        user_id = get_current_user_id(token_to_refresh)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token (signature or format).",
        )

    user: User | None = (await session.exec(select(User).where(User.user_id == user_id))).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    new_access_token = create_access_token(user_id, timedelta(days=7))

    return TokenResponse(
        access_token=new_access_token,
        user_info={"user_id": user_id, "username": user.username},
    )

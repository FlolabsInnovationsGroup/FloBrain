from __future__ import annotations

import uuid
from datetime import datetime, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select

from api.middleware.auth import create_access_token, get_current_user
from api.schemas import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from config.settings import settings
from db.database import AsyncSessionLocal
from db.models import User

router = APIRouter()


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest) -> UserResponse:
    """Create a new user account."""
    async with AsyncSessionLocal() as db:
        # Check uniqueness
        existing = await db.execute(
            select(User).where((User.email == body.email) | (User.username == body.username))
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Email or username already taken")

        user = User(
            id=str(uuid.uuid4()),
            email=body.email,
            username=body.username,
            password_hash=_hash_password(body.password),
            created_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        created_at=user.created_at,
        is_active=user.is_active,
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    """Authenticate and receive a JWT access token."""
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.username == body.username))
        user = result.scalar_one_or_none()

    if user is None or not _verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is inactive")

    token = create_access_token(user.id, user.username)
    return TokenResponse(
        access_token=token,
        expires_in=settings.JWT_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Return the currently authenticated user."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        username=current_user.username,
        created_at=current_user.created_at,
        is_active=current_user.is_active,
    )

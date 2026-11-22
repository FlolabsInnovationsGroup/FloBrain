"""
JWT creation and validation for auth (custom User model, not Django AUTH_USER_MODEL).
"""
import time
from typing import Optional

import jwt
from django.conf import settings

# Token lifetimes (seconds)
ACCESS_LIFETIME = 60 * 60  # 1 hour
REFRESH_LIFETIME = 7 * 24 * 60 * 60  # 7 days
ALGORITHM = "HS256"


def make_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "access",
        "exp": int(time.time()) + ACCESS_LIFETIME,
        "iat": int(time.time()),
    }
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM,
    )


def make_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "type": "refresh",
        "exp": int(time.time()) + REFRESH_LIFETIME,
        "iat": int(time.time()),
    }
    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except jwt.InvalidTokenError:
        return None

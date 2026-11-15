"""
ES256 JWT service for signed request tokens (B-1).

The backend issues a short-lived JWT that travels with every call to the
multimodal service. Multimodal verifies it against our public key, then
calls the credential endpoint to fetch the actual API key.

The signing key pair lives in:
    CREDENTIAL_JWT_PRIVATE_KEY  — PEM-encoded EC P-256 private key
    CREDENTIAL_JWT_KID          — key ID for JWKS (default "key-1")

Generate a key pair:
    python -c "
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives import serialization
    k = ec.generate_private_key(ec.SECP256R1())
    print(k.private_bytes(serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption()).decode())
    "
"""
import base64
import os
import time
import uuid

import jwt
from cryptography.hazmat.primitives import serialization
from django.conf import settings

_ISSUER = "flobrain-backend"
_AUDIENCE = "multimodal-perception"
_ALGORITHM = "ES256"
TOKEN_LIFETIME = 90   # seconds
CLOCK_SKEW = 30       # seconds allowed either side


def _private_key():
    pem = getattr(settings, "CREDENTIAL_JWT_PRIVATE_KEY", "") or os.environ.get(
        "CREDENTIAL_JWT_PRIVATE_KEY", ""
    )
    if not pem:
        raise RuntimeError("CREDENTIAL_JWT_PRIVATE_KEY is not configured")
    return serialization.load_pem_private_key(pem.encode("utf-8"), password=None)


def _kid() -> str:
    return getattr(settings, "CREDENTIAL_JWT_KID", "key-1")


def issue_token(
    *,
    scope_id: str,
    credential_ref: str,
    credential_version: int,
    credential_source: str,
    provider: str,
    kind: str,
    targets: list[dict],
) -> str:
    """Issue a signed request token for one multimodal call."""
    now = int(time.time())
    payload = {
        "iss": _ISSUER,
        "aud": _AUDIENCE,
        "iat": now,
        "nbf": now,
        "exp": now + TOKEN_LIFETIME,
        "jti": str(uuid.uuid4()),
        "kind": kind,
        "binding": {
            "scope_id": scope_id,
            "credential_ref": str(credential_ref),
            "credential_version": credential_version,
            "credential_source": credential_source,
            "provider": provider,
        },
        "targets": targets,
    }
    return jwt.encode(
        payload,
        _private_key(),
        algorithm=_ALGORITHM,
        headers={"kid": _kid()},
    )


def decode_token(token: str) -> dict:
    """Verify and decode a signed request token. Raises jwt.InvalidTokenError on any failure."""
    public_key = _private_key().public_key()
    return jwt.decode(
        token,
        public_key,
        algorithms=[_ALGORITHM],
        audience=_AUDIENCE,
        issuer=_ISSUER,
        leeway=CLOCK_SKEW,
        options={"require": ["exp", "iat", "nbf", "jti", "iss", "aud"]},
    )


def get_jwks() -> dict:
    """Return a JWKS document for multimodal to use when verifying tokens."""
    nums = _private_key().public_key().public_numbers()

    def _b64url(n: int, byte_len: int) -> str:
        return base64.urlsafe_b64encode(n.to_bytes(byte_len, "big")).rstrip(b"=").decode()

    return {
        "keys": [
            {
                "kty": "EC",
                "crv": "P-256",
                "x": _b64url(nums.x, 32),
                "y": _b64url(nums.y, 32),
                "use": "sig",
                "alg": "ES256",
                "kid": _kid(),
            }
        ]
    }

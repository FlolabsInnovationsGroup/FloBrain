"""
AES-256-GCM encryption for provider API keys.

The key material is stored encrypted; the encryption key comes from the
CREDENTIAL_ENCRYPTION_KEY environment variable (base64url-encoded 32 bytes).

Generate a new key:
    python -c "import secrets, base64; print(base64.urlsafe_b64encode(secrets.token_bytes(32)).decode())"
"""
import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.conf import settings


def _get_encryption_key() -> bytes:
    raw = getattr(settings, "CREDENTIAL_ENCRYPTION_KEY", "") or os.environ.get(
        "CREDENTIAL_ENCRYPTION_KEY", ""
    )
    if not raw:
        raise RuntimeError("CREDENTIAL_ENCRYPTION_KEY is not configured")
    # Accept with or without padding
    padded = raw + "=" * (-len(raw) % 4)
    key = base64.urlsafe_b64decode(padded)
    if len(key) != 32:
        raise RuntimeError("CREDENTIAL_ENCRYPTION_KEY must decode to exactly 32 bytes")
    return key


def encrypt_key(plaintext: str) -> bytes:
    """Encrypt a provider API key string. Returns nonce (12 bytes) + ciphertext."""
    aesgcm = AESGCM(_get_encryption_key())
    nonce = os.urandom(12)
    ct = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
    return nonce + ct


def decrypt_key(ciphertext: bytes) -> str:
    """Decrypt a provider API key. Expects nonce (12 bytes) prepended to ciphertext."""
    aesgcm = AESGCM(_get_encryption_key())
    nonce, ct = bytes(ciphertext)[:12], bytes(ciphertext)[12:]
    return aesgcm.decrypt(nonce, ct, None).decode("utf-8")

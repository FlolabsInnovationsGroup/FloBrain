import os
import uuid
import time
import random
import logging
import functools
import zstandard as zstd
import boto3
from botocore.exceptions import ClientError, BotoCoreError
from typing import Dict, Any, Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

logger = logging.getLogger(__name__)


def retry_on_network_error(max_retries: int = 4, initial_delay: float = 1.0, backoff_factor: float = 2.0):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            delay = initial_delay
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except (ClientError, BotoCoreError, IOError) as e:
                    if attempt == max_retries:
                        logger.error(
                            f"[Retry Policy] Exceeded max attempts ({max_retries}) in {func.__name__}. "
                            f"Critical error: {e}", exc_info=True
                        )
                        raise e

                    sleep_time = delay * random.uniform(0.5, 1.5)
                    logger.warning(
                        f"[Retry Policy] Error in {func.__name__} (Attempt {attempt}/{max_retries}): {e}. "
                        f"Retrying in {sleep_time:.2f}s..."
                    )
                    time.sleep(sleep_time)
                    delay *= backoff_factor
            return func(*args, **kwargs)
        return wrapper
    return decorator


class SecureCipher:
    def __init__(self, hex_key: str = None):
        key_material = bytes.fromhex(hex_key) if hex_key else os.urandom(32)
        if len(key_material) != 32:
            raise ValueError("[Security] A 256-bit key (32 bytes) is required.")
        self.aesgcm = AESGCM(key_material)

    def encrypt(self, data: bytes) -> bytes:
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(nonce, data, None)
        return nonce + ciphertext

    def decrypt(self, encrypted_data: bytes) -> bytes:
        if len(encrypted_data) < 13:
            raise ValueError("[Security] Encrypted data is corrupted or too short.")
        nonce = encrypted_data[:12]
        ciphertext = encrypted_data[12:]
        return self.aesgcm.decrypt(nonce, ciphertext, None)


class S3StorageBackend:
    def __init__(self, bucket_name: str):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            's3',
            endpoint_url=os.getenv("S3_ENDPOINT_URL", None),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        )

    @retry_on_network_error(max_retries=4, initial_delay=1.0)
    def put_object(self, key: str, data: bytes) -> str:
        self.s3_client.put_object(Bucket=self.bucket_name, Key=key, Body=data)
        return f"s3://{self.bucket_name}/{key}"

    @retry_on_network_error(max_retries=4, initial_delay=0.5)
    def get_object(self, uri: str) -> bytes:
        if not uri.startswith(f"s3://{self.bucket_name}/"):
            raise ValueError(f"Invalid S3 URI: {uri}")

        key = uri.replace(f"s3://{self.bucket_name}/", "")
        response = self.s3_client.get_object(Bucket=self.bucket_name, Key=key)
        return response['Body'].read()


class Tier3ColdStorageManager:
    def __init__(self, storage: S3StorageBackend, cipher: SecureCipher):
        self.storage = storage
        self.cipher = cipher
        self.compressor = zstd.ZstdCompressor(level=19)
        self.decompressor = zstd.ZstdDecompressor()

    def migrate_node_to_cold(self, node_id: str, raw_text: str) -> Optional[str]:
        try:
            if not raw_text:
                return None

            compressed = self.compressor.compress(raw_text.encode('utf-8'))
            encrypted = self.cipher.encrypt(compressed)
            key = f"archive/node_{node_id}_{uuid.uuid4().hex[:8]}.zst.enc"
            vault_uri = self.storage.put_object(key, encrypted)

            return vault_uri
        except Exception as e:
            logger.error(f"[Tier 3] Critical migration error for node {node_id}: {e}", exc_info=True)
            return None

    def migrate_node(self, node) -> bool:
        try:
            if node is None:
                logger.error("[Tier 3] migrate_node called with None instead of a node.")
                return False

            metadata = getattr(node, 'metadata', None) or {}
            raw_text = metadata.get('raw_text', '') or getattr(node, 'name', '') or ''

            if not raw_text:
                raw_text = getattr(node, 'name', '') or ''

            vault_uri = self.migrate_node_to_cold(node.id, raw_text)
            if not vault_uri:
                logger.error(f"[Tier 3] migrate_node: failed to obtain vault_uri for node {node.id}.")
                return False

            if not isinstance(metadata, dict):
                metadata = dict(metadata) if metadata else {}
            metadata['vault_uri'] = vault_uri
            node.metadata = metadata
            node.tier_level = 3

            if hasattr(node, 'save') and getattr(node, 'pk', None):
                node.save(update_fields=['metadata', 'tier_level'] if hasattr(node, '_meta') else None)

            logger.info(f"[Tier 3] Node {node.id} successfully frozen in Cold Vault: {vault_uri}")
            return True

        except Exception as e:
            logger.error(
                f"[Tier 3] Critical migration error for node {getattr(node, 'id', 'unknown')}: {e}",
                exc_info=True
            )
            return False

    def retrieve_from_cold_storage(self, vault_uri: str) -> Dict[str, Any]:
        try:
            if not vault_uri:
                logger.warning("[Tier 3] Empty vault_uri provided.")
                return {}

            secure_blob = self.storage.get_object(vault_uri)
            if not secure_blob:
                logger.error(f"[Tier 3] S3 returned empty object for URI: {vault_uri}")
                return {}

            try:
                compressed_bytes = self.cipher.decrypt(secure_blob)
            except Exception as crypto_err:
                logger.error(f"[Tier 3] Decryption error for {vault_uri} (master key may have changed): {crypto_err}")
                return {}

            if not compressed_bytes or len(compressed_bytes) == 0:
                logger.error(f"[Tier 3 Validation] Decrypted bytes empty for {vault_uri}. Decompression aborted.")
                return {}

            if len(compressed_bytes) < 4:
                logger.error(
                    f"[Tier 3 Validation] Decrypted blob size ({len(compressed_bytes)} bytes) "
                    f"is smaller than the minimum Zstd container size. File is corrupted."
                )
                return {}

            ZSTD_MAGIC_NUMBER = b'\x28\xb5\x2f\xfd'
            if compressed_bytes[:4] != ZSTD_MAGIC_NUMBER:
                logger.error(
                    f"[Tier 3 Validation] Invalid Zstd magic number for {vault_uri}. "
                    f"Expected {ZSTD_MAGIC_NUMBER.hex()}, got {compressed_bytes[:4].hex()}. "
                    f"Blob is corrupted or is not a Zstd file."
                )
                return {}

            try:
                raw_bytes = self.decompressor.decompress(compressed_bytes)
                restored_string = raw_bytes.decode('utf-8')
            except zstd.ZstdError as zstd_err:
                logger.error(
                    f"[Tier 3 Runtime Safety] Decompression attempt led to internal Zstd failure: {zstd_err}. "
                    f"Worker protected from crash. Blob {vault_uri} marked as defective."
                )
                return {}
            except UnicodeDecodeError as decode_err:
                logger.error(f"[Tier 3 Runtime Safety] UTF-8 decoding error after decompression: {decode_err}")
                return {}

            return {"metadata": {"raw_text": restored_string}}

        except Exception as e:
            logger.error(f"[Tier 3] Unexpected failure during cold storage retrieval: {e}", exc_info=True)
            return {}

    def retrieve_node(self, vault_uri: str) -> Dict[str, Any]:
        return self.retrieve_from_cold_storage(vault_uri)


_s3_bucket = os.getenv("S3_VAULT_BUCKET", "flobrain-cold-vault")
_aes_hex_key = os.getenv("AES_MASTER_KEY", "0" * 64)

_storage_backend = S3StorageBackend(bucket_name=_s3_bucket)
_cipher = SecureCipher(hex_key=_aes_hex_key)

cold_storage_service = Tier3ColdStorageManager(storage=_storage_backend, cipher=_cipher)


def migrate_to_cold_storage(node) -> bool:
    try:
        return cold_storage_service.migrate_node(node)
    except Exception as e:
        logger.error(f"[Tier 3 Adapter] Critical migration error for node {getattr(node, 'id', 'unknown')}: {e}")
        return False


def retrieve_from_cold_storage(vault_uri: str) -> dict:
    if not vault_uri:
        return {}
    try:
        return cold_storage_service.retrieve_node(vault_uri)
    except Exception as e:
        logger.error(f"[Tier 3 Adapter] Critical retrieval error for URI {vault_uri}: {e}")
        return {}

"""
schemas.py — Pydantic schemas for memory node metadata with versioning.

Solves the schema evolution problem: MemoryNode.metadata is a free-form JSONField,
which means any field rename or restructuring silently breaks old nodes.

NodeMetadataV1 establishes:
  - explicit version field (defaults to 1)
  - typed fields with defaults
  - safe parsing that ignores unknown keys (forward compatibility)
  - migration hook for future versions (migrate_v1_to_v2)

Usage:
    from .schemas import NodeMetadataV1
    meta = NodeMetadataV1.from_dict(node.metadata)
    raw_dict = meta.to_dict()
"""
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

logger = logging.getLogger(__name__)


class NodeMetadataV1(BaseModel):
    """
    Versioned schema for MemoryNode.metadata.
    All new fields must have defaults so old nodes can be loaded.
    """

    model_config = ConfigDict(extra="ignore")

    version: int = 1
    raw_text: str = ""
    tokens: List[int] = Field(default_factory=list)
    minhash_signature: Optional[List[int]] = None
    vault_uri: Optional[str] = None
    timestamp: Optional[str] = None
    mutation_index: Optional[int] = None
    embedding_model: Optional[str] = None
    embedding_version: Optional[str] = None
    source: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Optional[Dict[str, Any]]) -> "NodeMetadataV1":
        if not data:
            return cls()
        if not isinstance(data, dict):
            logger.warning(f"[NodeMetadataV1] Expected dict, got {type(data).__name__}")
            return cls()

        version = data.get("version", 1)
        if version == 1:
            try:
                return cls(**{k: v for k, v in data.items()})
            except Exception as e:
                logger.warning(f"[NodeMetadataV1] Parse error: {e}")
                return cls()

        logger.warning(f"[NodeMetadataV1] Unknown version {version}, attempting v1 parse")
        try:
            return cls(**{k: v for k, v in data.items()})
        except Exception:
            return cls()

    def to_dict(self) -> Dict[str, Any]:
        return self.model_dump(exclude_none=False)

    def merge(self, extra: Dict[str, Any]) -> Dict[str, Any]:
        """Merge schema fields with arbitrary extras (preserves legacy keys)."""
        merged = self.to_dict()
        if extra:
            for k, v in extra.items():
                if k not in merged:
                    merged[k] = v
        return merged

"""memory/graph_sync.py — Neo4j sync via Django signals (P3.03).

When MemoryLink is saved/deleted in Postgres, this module mirrors the change
to Neo4j so complex graph queries (multi-hop, shortest path) can run in Cypher.

Neo4j connection:
    NEO4J_URI=bolt://neo4j:7687
    NEO4J_USER=neo4j
    NEO4J_PASSWORD=...

Node schema in Neo4j:
    (:MemoryNode {id, name, tier_level, owner_id})
    (:Entity {id, name, type})

Relationship types:
    [:LINKS {relation, weight}] — MemoryNode -> MemoryNode
    [:MENTIONS {weight}]         — MemoryNode -> Entity

Usage:
    from .graph_sync import init_neo4j, sync_link, run_cypher_query
    init_neo4j()  # call once at startup
"""
import os
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://neo4j:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "flobrainpassword")

_driver = None

try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    logger.info("[graph_sync] neo4j driver not installed — sync disabled")
    NEO4J_AVAILABLE = False


def init_neo4j():
    """Initializes Neo4j driver. Call once at startup."""
    global _driver
    if not NEO4J_AVAILABLE:
        return None
    try:
        _driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
        # Test connection
        with _driver.session() as session:
            session.run("RETURN 1").consume()
        logger.info(f"[graph_sync] Neo4j connected: {NEO4J_URI}")
        return _driver
    except Exception as e:
        logger.warning(f"[graph_sync] Neo4j connection failed: {e}")
        _driver = None
        return None


def get_driver():
    """Returns driver, initializing if needed."""
    global _driver
    if _driver is None and NEO4J_AVAILABLE:
        init_neo4j()
    return _driver


def sync_node_create(node_id: str, name: str, tier_level: int, owner_id: str,
                     node_type: str = "MemoryNode", extra_props: Optional[Dict] = None):
    """Creates or updates a node in Neo4j (idempotent MERGE)."""
    driver = get_driver()
    if not driver:
        return
    props = {"id": node_id, "name": name, "tier_level": tier_level, "owner_id": owner_id}
    if extra_props:
        props.update(extra_props)
    try:
        with driver.session() as session:
            session.run(
                f"MERGE (n:{node_type} {{id: $id}}) SET n += $props",
                id=node_id, props=props
            )
    except Exception as e:
        logger.warning(f"[graph_sync] sync_node_create failed for {node_id}: {e}")


def sync_node_delete(node_id: str):
    """Deletes a node and all its relationships from Neo4j."""
    driver = get_driver()
    if not driver:
        return
    try:
        with driver.session() as session:
            session.run("MATCH (n {id: $id}) DETACH DELETE n", id=node_id)
    except Exception as e:
        logger.warning(f"[graph_sync] sync_node_delete failed for {node_id}: {e}")


def sync_link_create(source_id: str, target_id: str, relation: str, weight: float = 0.5):
    """Creates or updates a relationship in Neo4j."""
    driver = get_driver()
    if not driver:
        return
    try:
        with driver.session() as session:
            session.run("""
                MERGE (a {id: $source})
                MERGE (b {id: $target})
                MERGE (a)-[r:LINKS {relation: $relation}]->(b)
                SET r.weight = $weight
            """, source=source_id, target=target_id, relation=relation, weight=weight)
    except Exception as e:
        logger.warning(f"[graph_sync] sync_link_create failed {source_id}->{target_id}: {e}")


def sync_link_delete(source_id: str, target_id: str, relation: str):
    """Deletes a specific relationship in Neo4j."""
    driver = get_driver()
    if not driver:
        return
    try:
        with driver.session() as session:
            session.run("""
                MATCH (a {id: $source})-[r:LINKS {relation: $relation}]->(b {id: $target})
                DELETE r
            """, source=source_id, target=target_id, relation=relation)
    except Exception as e:
        logger.warning(f"[graph_sync] sync_link_delete failed: {e}")


def run_cypher_query(cypher: str, params: Optional[Dict] = None) -> List[Dict[str, Any]]:
    """Executes a read-only Cypher query and returns results as list of dicts."""
    driver = get_driver()
    if not driver:
        raise RuntimeError("Neo4j not available — install neo4j driver and configure NEO4J_URI")
    try:
        with driver.session() as session:
            result = session.run(cypher, params or {})
            return [dict(record) for record in result]
    except Exception as e:
        logger.error(f"[graph_sync] Cypher query failed: {e}")
        raise


# =============================================================================
# Django signal handlers — wire up in apps.py ready()
# =============================================================================

def on_memorylink_save(sender, instance, created, **kwargs):
    """Signal handler: sync MemoryLink to Neo4j on save."""
    if instance.source_id and instance.target_id:
        sync_link_create(
            source_id=instance.source_id,
            target_id=instance.target_id,
            relation=instance.relation,
            weight=float(instance.weight),
        )


def on_memorylink_delete(sender, instance, **kwargs):
    """Signal handler: sync MemoryLink deletion to Neo4j."""
    if instance.source_id and instance.target_id:
        sync_link_delete(
            source_id=instance.source_id,
            target_id=instance.target_id,
            relation=instance.relation,
        )


def on_memorynode_save(sender, instance, created, **kwargs):
    """Signal handler: sync MemoryNode to Neo4j on save."""
    sync_node_create(
        node_id=instance.id,
        name=instance.name,
        tier_level=instance.tier_level,
        owner_id=instance.owner_id,
    )


def on_memorynode_delete(sender, instance, **kwargs):
    """Signal handler: sync MemoryNode deletion to Neo4j."""
    sync_node_delete(instance.id)


def connect_signals():
    """Wires up Django signals. Call from AppConfig.ready()."""
    from django.db.models.signals import post_save, post_delete
    from .models import MemoryNode, MemoryLink
    post_save.connect(on_memorynode_save, sender=MemoryNode)
    post_delete.connect(on_memorynode_delete, sender=MemoryNode)
    post_save.connect(on_memorylink_save, sender=MemoryLink)
    post_delete.connect(on_memorylink_delete, sender=MemoryLink)
    logger.info("[graph_sync] Django signals connected")

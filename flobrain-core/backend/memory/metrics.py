"""memory/metrics.py — Prometheus metrics for memory subsystem (P1.W4.02).

Metrics exposed at /metrics endpoint (configure django_prometheus in settings).

Metrics:
  flobrain_sm_calls_total{method, status}      — Counter
  flobrain_sm_latency_seconds{method}          — Histogram
  flobrain_recall_results_count                — Histogram (results per recall)
  flobrain_memorize_chunks_count               — Histogram (chunks per memorize)
  flobrain_gc_migrated_nodes_total             — Counter (already in reclassification.py)
  flobrain_hebbian_links_updated_total         — Counter
  flobrain_vector_backend_info{backend}        — Gauge (info metric)
"""
import os
from prometheus_client import Counter, Histogram, Gauge, Info

# SuperMemory connector metrics
SM_CALLS_TOTAL = Counter(
    'flobrain_sm_calls_total',
    'Total SuperMemory API calls',
    ['method', 'status']
)

SM_LATENCY_SECONDS = Histogram(
    'flobrain_sm_latency_seconds',
    'SuperMemory API call latency',
    ['method'],
    buckets=(0.05, 0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0)
)

# Recall metrics
RECALL_RESULTS_COUNT = Histogram(
    'flobrain_recall_results_count',
    'Number of results returned per recall call',
    buckets=(0, 1, 3, 5, 10, 20, 50, 100)
)

# Memorize metrics
MEMORIZE_CHUNKS_COUNT = Histogram(
    'flobrain_memorize_chunks_count',
    'Number of chunks created per memorize call',
    buckets=(1, 2, 5, 10, 20, 50, 100)
)

MEMORIZE_ENTITIES_COUNT = Histogram(
    'flobrain_memorize_entities_count',
    'Number of entities extracted per memorize call',
    buckets=(0, 1, 3, 5, 10, 20, 50)
)

# Hebbian metrics (incremented from tasks.py)
HEBBIAN_LINKS_UPDATED_TOTAL = Counter(
    'flobrain_hebbian_links_updated_total',
    'Total Hebbian link updates'
)

# System info metrics
VECTOR_BACKEND_INFO = Info(
    'flobrain_vector_backend',
    'Active vector backend (chromadb|qdrant)'
)
VECTOR_BACKEND_INFO.info({'backend': os.getenv('VECTOR_BACKEND', 'chromadb')})

SUPERMEMORY_MODE_INFO = Info(
    'flobrain_supermemory_mode',
    'SuperMemory connector mode (stub|remote)'
)
SUPERMEMORY_MODE_INFO.info({'mode': 'remote' if os.getenv('SUPERMEMORY_BASE_URL') else 'stub'})

# Storage tier distribution
TIER_NODE_COUNT = Gauge(
    'flobrain_tier_node_count',
    'Memory nodes per tier',
    ['tier']
)


def record_sm_call(method: str, status: str, latency_seconds: float):
    """Helper: record SM API call metric."""
    SM_CALLS_TOTAL.labels(method=method, status=status).inc()
    SM_LATENCY_SECONDS.labels(method=method).observe(latency_seconds)


def update_tier_counts():
    """Updates flobrain_tier_node_count gauge. Call periodically."""
    from .models import MemoryNode
    from django.db.models import Count
    for tier in [1, 2, 3]:
        count = MemoryNode.objects.filter(tier_level=tier).count()
        TIER_NODE_COUNT.labels(tier=str(tier)).set(count)

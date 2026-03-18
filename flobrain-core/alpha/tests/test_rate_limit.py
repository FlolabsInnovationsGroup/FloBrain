"""Tests for api/middleware/rate_limit.py — TokenBucket and RateLimiter."""
from __future__ import annotations

import time
from unittest.mock import patch

import pytest

from api.middleware.rate_limit import TokenBucket, RateLimiter


# ---------------------------------------------------------------------------
# TokenBucket
# ---------------------------------------------------------------------------

def test_token_bucket_allows_within_limit():
    bucket = TokenBucket(capacity=10, refill_rate=1.0)
    for _ in range(5):
        assert bucket.consume() is True


def test_token_bucket_denies_over_limit():
    bucket = TokenBucket(capacity=3, refill_rate=0.01)
    for _ in range(3):
        bucket.consume()
    # 4th should be denied
    assert bucket.consume() is False


def test_token_bucket_retry_after_positive():
    bucket = TokenBucket(capacity=1, refill_rate=1.0)
    bucket.consume()  # exhaust
    bucket.consume()  # denied
    assert bucket.retry_after > 0


def test_token_bucket_refills_over_time():
    bucket = TokenBucket(capacity=10, refill_rate=10.0)
    # Exhaust the bucket
    for _ in range(10):
        bucket.consume()
    assert bucket.consume() is False

    # Advance time by 60 seconds → should refill completely
    with patch("time.monotonic", return_value=time.monotonic() + 60):
        # Force a consume call so refill logic runs
        bucket2 = TokenBucket(capacity=10, refill_rate=10.0)
        bucket2._tokens = 0.0
        bucket2._last_refill = time.monotonic() - 60  # pretend last refill was 60s ago
        assert bucket2.consume() is True


# ---------------------------------------------------------------------------
# RateLimiter
# ---------------------------------------------------------------------------

def test_rate_limiter_check_returns_true_within_limit():
    rl = RateLimiter()
    allowed, retry_after = rl.check("1.2.3.4", "general", capacity=10, rate=1.0)
    assert allowed is True
    assert retry_after == 0.0


def test_rate_limiter_check_returns_false_over_limit():
    rl = RateLimiter()
    # Exhaust all tokens
    for _ in range(5):
        rl.check("5.6.7.8", "general", capacity=5, rate=0.001)
    allowed, retry_after = rl.check("5.6.7.8", "general", capacity=5, rate=0.001)
    assert allowed is False
    assert retry_after > 0


def test_rate_limiter_different_ips_independent():
    rl = RateLimiter()
    # Exhaust IP 1
    for _ in range(3):
        rl.check("10.0.0.1", "general", capacity=3, rate=0.001)
    denied, _ = rl.check("10.0.0.1", "general", capacity=3, rate=0.001)
    assert denied is False

    # IP 2 should still be allowed
    allowed, _ = rl.check("10.0.0.2", "general", capacity=3, rate=0.001)
    assert allowed is True

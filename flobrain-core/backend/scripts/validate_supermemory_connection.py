#!/usr/bin/env python
"""scripts/validate_supermemory_connection.py — Prototype connection validator.

Validates FloBrain can communicate with SuperMemory via REST API.
Runs in 2 modes:
  - STUB mode (SUPERMEMORY_BASE_URL not set): checks stub responses
  - REMOTE mode (SUPERMEMORY_BASE_URL set): pings real server, exercises all 5 methods

Usage:
    python scripts/validate_supermemory_connection.py
"""
import os
import sys
import time
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "flobrain.settings")

import django
django.setup()

from memory import supermemory_connector as smc


def check(label, fn):
    t0 = time.monotonic()
    try:
        result = fn()
        ms = int((time.monotonic() - t0) * 1000)
        print(f"  [OK]   {label:40s} {ms}ms")
        if isinstance(result, dict) and len(str(result)) < 200:
            print(f"         response: {result}")
        return True
    except Exception as e:
        print(f"  [ERR]  {label:40s} {e}")
        return False


def main():
    mode = "remote" if smc.is_configured() else "stub"
    print(f"\n=== SuperMemory connection check (mode={mode}) ===\n")
    print(f"  SUPERMEMORY_BASE_URL = {os.getenv('SUPERMEMORY_BASE_URL', '(not set)')}")
    print()

    all_ok = True

    # 1. Health check
    all_ok &= check("health()", smc.health)

    # 2. Create document
    doc_id = f"validation_{int(time.time())}"
    all_ok &= check(f"create_document({doc_id})", lambda: smc.create_document(
        content="Validation test from FloBrain. This is a stub-mode probe.",
        metadata={"owner_id": "validation", "source": "prototype"},
        doc_id=doc_id,
    ))

    # 3. Search
    all_ok &= check("search(validation)", lambda: smc.search(
        query="validation test",
        top_n=5,
        filters={"owner_id": "validation"},
    ))

    # 4. Get document
    all_ok &= check(f"get_document({doc_id})", lambda: smc.get_document(doc_id))

    # 5. Get profile (NEW — Phase 1 W2)
    all_ok &= check("get_profile(validation)", lambda: smc.get_profile(
        owner_id="validation", q="test"
    ))

    # 6. List connections (NEW — Phase 1 W2)
    all_ok &= check("list_connections()", lambda: smc.list_connections())

    # 7. Delete document
    all_ok &= check(f"delete_document({doc_id})", lambda: smc.delete_document(doc_id))

    print(f"\n=== Done ===")
    if all_ok:
        print("  RESULT: ALL CHECKS PASSED ✅")
        if mode == "stub":
            print("  Note: running in STUB mode. When SuperMemory server is ready,")
            print("        set SUPERMEMORY_BASE_URL and re-run this script.")
        sys.exit(0)
    else:
        print("  RESULT: SOME CHECKS FAILED ❌ — see errors above")
        sys.exit(1)


if __name__ == "__main__":
    main()

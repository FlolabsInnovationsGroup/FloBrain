"""memory/wearables/oura.py — Oura Ring API importer (P3.07).

Fetches health data from Oura Ring API v2 and pushes it to FloBrain via
/api/health/measurements/ endpoint.

Oura API v2 endpoints used:
  - GET /v2/usercollection/daily_sleep          — daily sleep summary
  - GET /v2/usercollection/daily_activity       — daily activity (steps, calories)
  - GET /v2/usercollection/daily_readiness      — daily readiness score
  - GET /v2/usercollection/heart_rate           — heart rate data

Configuration:
    OURA_API_TOKEN — personal access token from https://cloud.ouraring.com/personal-access-tokens
    OURA_START_DATE — start date YYYY-MM-DD (default: 7 days ago)

Usage:
    from memory.wearables.oura import OuraImporter
    importer = OuraImporter(api_token="...", user_id="user_123", api_base="http://localhost:8000")
    importer.import_sleep_data(days_back=7)
    importer.import_activity_data(days_back=7)
    importer.import_heart_rate_data(hours_back=24)
"""
import os
import logging
import requests
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

OURA_API_BASE = "https://api.ouraring.com/v2"
DEFAULT_API_BASE = "http://localhost:8000"


class OuraImporter:
    """Imports Oura Ring data into FloBrain via Health Buddy API."""

    def __init__(
        self,
        api_token: Optional[str] = None,
        user_id: str = "system",
        flobrain_api_base: str = DEFAULT_API_BASE,
        flobrain_token: Optional[str] = None,
    ):
        self.api_token = api_token or os.getenv("OURA_API_TOKEN")
        if not self.api_token:
            raise ValueError("OURA_API_TOKEN not set")
        self.user_id = user_id
        self.api_base = flobrain_api_base.rstrip("/")
        self.flobrain_token = flobrain_token
        self.session = requests.Session()
        self.session.headers["Authorization"] = f"Bearer {self.api_token}"

    def _date_range(self, days_back: int) -> tuple:
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=days_back)
        return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")

    def _post_measurement(self, m_type: str, value: Any, unit: str,
                          timestamp: Optional[str] = None, extra: Optional[Dict] = None):
        """Pushes a single measurement to FloBrain /api/health/measurements/."""
        headers = {"Content-Type": "application/json"}
        if self.flobrain_token:
            headers["Authorization"] = f"Bearer {self.flobrain_token}"
        payload = {
            "type": m_type,
            "value": value,
            "unit": unit,
            "timestamp": timestamp or datetime.now(timezone.utc).isoformat(),
            "metadata": {"source": "oura", **(extra or {})},
        }
        try:
            resp = requests.post(
                f"{self.api_base}/api/health/measurements",
                json=payload,
                headers=headers,
                timeout=5,
            )
            if resp.status_code == 201:
                logger.debug(f"[oura] {m_type}={value}{unit} → stored")
            else:
                logger.warning(f"[oura] {m_type} failed: {resp.status_code} {resp.text}")
        except Exception as e:
            logger.error(f"[oura] POST measurement failed: {e}")

    def import_sleep_data(self, days_back: int = 7) -> int:
        """Imports daily sleep summaries for the last N days."""
        start, end = self._date_range(days_back)
        try:
            resp = self.session.get(
                f"{OURA_API_BASE}/usercollection/daily_sleep",
                params={"start_date": start, "end_date": end},
                timeout=10,
            )
            if resp.status_code != 200:
                logger.error(f"[oura] sleep API failed: {resp.status_code}")
                return 0
            data = resp.json().get("data", [])
            count = 0
            for entry in data:
                sleep_score = entry.get("score", 0)
                day = entry.get("day", start)
                self._post_measurement(
                    "sleep", sleep_score, "score", timestamp=f"{day}T23:59:59Z",
                    extra={"deep_sleep": entry.get("contributors", {}).get("deep_sleep", 0)}
                )
                count += 1
            logger.info(f"[oura] Imported {count} sleep records")
            return count
        except Exception as e:
            logger.error(f"[oura] import_sleep_data failed: {e}")
            return 0

    def import_activity_data(self, days_back: int = 7) -> int:
        """Imports daily activity (steps, calories) for the last N days."""
        start, end = self._date_range(days_back)
        try:
            resp = self.session.get(
                f"{OURA_API_BASE}/usercollection/daily_activity",
                params={"start_date": start, "end_date": end},
                timeout=10,
            )
            if resp.status_code != 200:
                logger.error(f"[oura] activity API failed: {resp.status_code}")
                return 0
            data = resp.json().get("data", [])
            count = 0
            for entry in data:
                steps = entry.get("steps", 0)
                active_calories = entry.get("active_calories", 0)
                day = entry.get("day", start)
                self._post_measurement(
                    "steps", steps, "count", timestamp=f"{day}T23:59:59Z"
                )
                self._post_measurement(
                    "calories", active_calories, "kcal", timestamp=f"{day}T23:59:59Z"
                )
                count += 2
            logger.info(f"[oura] Imported {count} activity records")
            return count
        except Exception as e:
            logger.error(f"[oura] import_activity_data failed: {e}")
            return 0

    def import_heart_rate_data(self, hours_back: int = 24) -> int:
        """Imports heart rate data for the last N hours."""
        end = datetime.now(timezone.utc)
        start = end - timedelta(hours=hours_back)
        try:
            resp = self.session.get(
                f"{OURA_API_BASE}/usercollection/heartrate",
                params={"start_datetime": start.isoformat(), "end_datetime": end.isoformat()},
                timeout=10,
            )
            if resp.status_code != 200:
                logger.error(f"[oura] heart_rate API failed: {resp.status_code}")
                return 0
            data = resp.json().get("data", [])
            count = 0
            # Sample every 10th entry to avoid flooding
            for entry in data[::10]:
                bpm = entry.get("bpm", 0)
                ts = entry.get("timestamp")
                self._post_measurement("heart_rate", bpm, "bpm", timestamp=ts)
                count += 1
            logger.info(f"[oura] Imported {count} heart rate samples")
            return count
        except Exception as e:
            logger.error(f"[oura] import_heart_rate_data failed: {e}")
            return 0

    def import_all(self, days_back: int = 7) -> Dict[str, int]:
        """Convenience: imports sleep + activity + heart rate."""
        return {
            "sleep": self.import_sleep_data(days_back),
            "activity": self.import_activity_data(days_back),
            "heart_rate": self.import_heart_rate_data(hours_back=24),
        }

#!/usr/bin/env python3
"""
Daily posting limit helper for Futbol Laboratuvarı Instagram automation.

This module is intentionally dependency-free so it can run on GitHub Actions
without installing packages. It reads logs/instagram_posts.json and decides
whether another Instagram post may be published today in Europe/Istanbul time.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List
from zoneinfo import ZoneInfo

DEFAULT_LOG_PATH = Path("logs/instagram_posts.json")
DEFAULT_TIMEZONE = "Europe/Istanbul"
DEFAULT_DAILY_LIMIT = 3


def now_in_timezone(timezone_name: str = DEFAULT_TIMEZONE) -> datetime:
    """Return the current time in the configured timezone."""
    return datetime.now(ZoneInfo(timezone_name))


def load_logs(log_path: Path = DEFAULT_LOG_PATH) -> List[Dict[str, Any]]:
    """Load JSON log entries. Invalid or missing files are treated as empty logs."""
    if not log_path.exists():
        return []

    try:
        data = json.loads(log_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []

    if isinstance(data, list):
        return [entry for entry in data if isinstance(entry, dict)]

    # Future-proof in case the log is ever wrapped in an object.
    if isinstance(data, dict) and isinstance(data.get("posts"), list):
        return [entry for entry in data["posts"] if isinstance(entry, dict)]

    return []


def entry_date(entry: Dict[str, Any]) -> str | None:
    """Extract YYYY-MM-DD from a log entry."""
    value = entry.get("tarih") or entry.get("date")
    if isinstance(value, str) and len(value) >= 10:
        return value[:10]

    timestamp = entry.get("timestamp")
    if isinstance(timestamp, str) and len(timestamp) >= 10:
        return timestamp[:10]

    return None


def successful_posts_for_date(logs: List[Dict[str, Any]], date_str: str) -> List[Dict[str, Any]]:
    """Return successful post entries for the given date."""
    return [
        entry
        for entry in logs
        if entry_date(entry) == date_str and entry.get("durum") == "success"
    ]


def today_post_count(log_path: Path = DEFAULT_LOG_PATH, timezone_name: str = DEFAULT_TIMEZONE) -> int:
    """Count successful posts for today."""
    today = now_in_timezone(timezone_name).date().isoformat()
    return len(successful_posts_for_date(load_logs(log_path), today))


def can_post_today(
    log_path: Path = DEFAULT_LOG_PATH,
    timezone_name: str = DEFAULT_TIMEZONE,
    daily_limit: int = DEFAULT_DAILY_LIMIT,
) -> bool:
    """Return True when the daily successful-post limit has not been reached."""
    return today_post_count(log_path, timezone_name) < daily_limit


def build_limit_report(
    log_path: Path = DEFAULT_LOG_PATH,
    timezone_name: str = DEFAULT_TIMEZONE,
    daily_limit: int = DEFAULT_DAILY_LIMIT,
) -> Dict[str, Any]:
    """Build a small report used by scripts and terminal output."""
    now = now_in_timezone(timezone_name)
    count = today_post_count(log_path, timezone_name)
    return {
        "date": now.date().isoformat(),
        "time": now.strftime("%H:%M:%S"),
        "timezone": timezone_name,
        "today_success_count": count,
        "daily_limit": daily_limit,
        "can_post": count < daily_limit,
    }


def main() -> int:
    report = build_limit_report()
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["can_post"] else 1


if __name__ == "__main__":
    raise SystemExit(main())

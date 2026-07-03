#!/usr/bin/env python3
"""
Instagram publisher for Futbol Laboratuvarı.

Uses only the official Meta/Instagram Graph API endpoints and GitHub Secrets.
No username/password login, Selenium, browser automation, follow/like/comment/DM
automation, or other risky behavior is implemented.
"""

from __future__ import annotations

import argparse
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple
from zoneinfo import ZoneInfo

from instagram_daily_limit import (
    DEFAULT_DAILY_LIMIT,
    DEFAULT_LOG_PATH,
    DEFAULT_TIMEZONE,
    build_limit_report,
    can_post_today,
    load_logs,
)
from instagram_generate_content import generate_instagram_content

MEDIA_DIR = Path("content/instagram/media")
LOG_PATH = DEFAULT_LOG_PATH
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov"}
DEFAULT_SITE_URL = "https://www.futbollaboratuuvari.org"
DEFAULT_GRAPH_API_VERSION = "v23.0"
FACEBOOK_LOGIN_MODE = "facebook_login"
INSTAGRAM_LOGIN_MODE = "instagram_login"


class InstagramAutomationError(Exception):
    """Raised for controlled automation errors that should be logged safely."""


def now_local(timezone_name: str = DEFAULT_TIMEZONE) -> datetime:
    return datetime.now(ZoneInfo(timezone_name))


def safe_error(message: Any) -> str:
    """Remove secrets from error strings before logging or printing."""
    text = str(message)
    for env_name in ("INSTAGRAM_ACCESS_TOKEN", "OPENAI_API_KEY"):
        secret = os.getenv(env_name, "")
        if secret:
            text = text.replace(secret, "***")
    return text[:1000]


def save_logs(logs: List[Dict[str, Any]], path: Path = LOG_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(logs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def append_log(entry: Dict[str, Any], path: Path = LOG_PATH) -> None:
    logs = load_logs(path)
    logs.append(entry)
    save_logs(logs, path)


def base_log_entry(status: str, timezone_name: str = DEFAULT_TIMEZONE) -> Dict[str, Any]:
    now = now_local(timezone_name)
    return {
        "tarih": now.date().isoformat(),
        "saat": now.strftime("%H:%M:%S"),
        "timezone": timezone_name,
        "durum": status,
    }


def successful_media_used_today(logs: List[Dict[str, Any]], timezone_name: str = DEFAULT_TIMEZONE) -> set[str]:
    today = now_local(timezone_name).date().isoformat()
    used = set()
    for entry in logs:
        if entry.get("durum") == "success" and str(entry.get("tarih", ""))[:10] == today:
            media = entry.get("kullanılan_medya") or entry.get("media_file")
            if isinstance(media, str) and media:
                used.add(media)
    return used


def list_media_files(media_dir: Path = MEDIA_DIR) -> List[Path]:
    if not media_dir.exists():
        return []

    allowed = ALLOWED_IMAGE_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS
    files = [
        path
        for path in media_dir.iterdir()
        if path.is_file() and not path.name.startswith(".") and path.suffix.lower() in allowed
    ]
    return sorted(files, key=lambda item: item.name.lower())


def choose_media_file() -> Path:
    files = list_media_files()
    if not files:
        raise InstagramAutomationError(
            "Medya dosyası bulunamadı. content/instagram/media/ içine .jpg, .png veya .mp4 dosyası ekleyin."
        )

    used_today = successful_media_used_today(load_logs(LOG_PATH))
    available = [path for path in files if str(path).replace("\\", "/") not in used_today]

    if not available:
        raise InstagramAutomationError("Bugün kullanılmamış medya dosyası kalmadı.")

    # Rotate deterministically by today's successful count to reduce repeats.
    count = build_limit_report()["today_success_count"]
    return available[count % len(available)]


def raw_github_media_url(path: Path) -> str:
    media_base_url = os.getenv("MEDIA_BASE_URL", "").strip().rstrip("/")
    normalized_path = str(path).replace("\\", "/")

    if media_base_url:
        return f"{media_base_url}/{urllib.parse.quote(path.name)}"

    repository = os.getenv("GITHUB_REPOSITORY", "").strip()
    ref_name = os.getenv("GITHUB_REF_NAME", "main").strip() or "main"

    if not repository:
        raise InstagramAutomationError(
            "MEDIA_BASE_URL veya GITHUB_REPOSITORY bulunamadı. GitHub Actions içinde çalıştırın ya da MEDIA_BASE_URL verin."
        )

    quoted_path = urllib.parse.quote(normalized_path)
    return f"https://raw.githubusercontent.com/{repository}/{ref_name}/{quoted_path}"


def normalize_secret_value(value: str) -> str:
    """Normalize safely pasted secret values without logging them."""
    cleaned = str(value or "").strip()
    if len(cleaned) >= 2 and cleaned[0] == cleaned[-1] and cleaned[0] in {"'", '"'}:
        cleaned = cleaned[1:-1].strip()
    if cleaned.lower().startswith("bearer "):
        cleaned = cleaned[7:].strip()
    return "".join(cleaned.split())


def detect_api_mode(access_token: str) -> str:
    """Choose the correct Meta graph host without printing token contents."""
    token = access_token.strip().upper()
    if token.startswith("IG"):
        return INSTAGRAM_LOGIN_MODE
    if token.startswith("EA"):
        return FACEBOOK_LOGIN_MODE

    configured = os.getenv("INSTAGRAM_API_MODE", "").strip().lower().replace("-", "_")
    if configured in {"instagram", "instagram_login", "graph_instagram"}:
        return INSTAGRAM_LOGIN_MODE
    if configured in {"facebook", "facebook_login", "graph_facebook"}:
        return FACEBOOK_LOGIN_MODE

    return FACEBOOK_LOGIN_MODE


def graph_api_base(api_mode: str = FACEBOOK_LOGIN_MODE) -> str:
    version = os.getenv("META_GRAPH_API_VERSION", DEFAULT_GRAPH_API_VERSION).strip() or DEFAULT_GRAPH_API_VERSION
    host = "graph.instagram.com" if api_mode == INSTAGRAM_LOGIN_MODE else "graph.facebook.com"
    return f"https://{host}/{version}"


def api_post(path: str, data: Dict[str, Any], api_mode: str = FACEBOOK_LOGIN_MODE) -> Dict[str, Any]:
    encoded = urllib.parse.urlencode(data).encode("utf-8")
    request = urllib.request.Request(
        f"{graph_api_base(api_mode)}/{path.lstrip('/')}",
        data=encoded,
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise InstagramAutomationError(safe_error(body)) from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise InstagramAutomationError(safe_error(exc)) from exc


def api_get(path: str, params: Dict[str, Any], api_mode: str = FACEBOOK_LOGIN_MODE) -> Dict[str, Any]:
    query = urllib.parse.urlencode(params)
    url = f"{graph_api_base(api_mode)}/{path.lstrip('/')}?{query}"

    try:
        with urllib.request.urlopen(url, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise InstagramAutomationError(safe_error(body)) from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise InstagramAutomationError(safe_error(exc)) from exc


def print_safe_env_debug() -> None:
    """Print secret presence and length without exposing secret values."""
    if os.getenv("IG_SAFE_DEBUG", "").strip().lower() not in {"1", "true", "yes"}:
        return

    print("\n--- Instagram Secret Debug ---")
    access_token = ""
    for name in ("INSTAGRAM_ACCESS_TOKEN", "INSTAGRAM_USER_ID", "SITE_URL"):
        raw_value = os.getenv(name, "")
        normalized_value = normalize_secret_value(raw_value) if name == "INSTAGRAM_ACCESS_TOKEN" else str(raw_value or "").strip()
        if name == "INSTAGRAM_ACCESS_TOKEN":
            access_token = normalized_value
        print(f"{name}: {'VAR' if normalized_value else 'YOK'}")
        print(f"{name}_UZUNLUK: {len(normalized_value)}")
    if access_token:
        print(f"INSTAGRAM_API_MODE: {detect_api_mode(access_token)}")
    print("------------------------------\n")


def validate_required_env() -> Tuple[str, str]:
    access_token = normalize_secret_value(os.getenv("INSTAGRAM_ACCESS_TOKEN", ""))
    instagram_user_id = str(os.getenv("INSTAGRAM_USER_ID", "")).strip()

    missing = []
    if not access_token:
        missing.append("INSTAGRAM_ACCESS_TOKEN")
    if not instagram_user_id:
        missing.append("INSTAGRAM_USER_ID")

    if missing:
        raise InstagramAutomationError(f"Eksik GitHub Secret: {', '.join(missing)}")

    return access_token, instagram_user_id


def validate_instagram_access(instagram_user_id: str, access_token: str) -> str:
    """Fail early with actionable diagnostics before trying to publish."""
    api_mode = detect_api_mode(access_token)

    if api_mode == INSTAGRAM_LOGIN_MODE:
        try:
            api_get(
                instagram_user_id,
                {
                    "fields": "id,username",
                    "access_token": access_token,
                },
                api_mode,
            )
        except InstagramAutomationError as exc:
            raise InstagramAutomationError(
                "Instagram Login tokeni kullaniliyor ama INSTAGRAM_USER_ID bu token ile okunamiyor. "
                "INSTAGRAM_USER_ID degeri Instagram API setup ekranindaki Instagram account ID olmali. "
                f"Meta hata ozeti: {safe_error(exc)}"
            ) from exc
        return api_mode

    accounts = api_get(
        "me/accounts",
        {
            "fields": "id,name,instagram_business_account",
            "access_token": access_token,
        },
        api_mode,
    )
    pages = accounts.get("data") if isinstance(accounts, dict) else None
    if not isinstance(pages, list) or not pages:
        raise InstagramAutomationError(
            "Facebook Login tokeni kullaniliyor ama /me/accounts bos donuyor. "
            "Token izin ekraninda futbollaboratuvari Facebook sayfasi secilmeli ve hesapta sayfa icin tam kontrol/admin yetkisi olmali."
        )

    linked_instagram_ids = []
    for page in pages:
        if isinstance(page, dict) and isinstance(page.get("instagram_business_account"), dict):
            linked_id = str(page["instagram_business_account"].get("id") or "").strip()
            if linked_id:
                linked_instagram_ids.append(linked_id)

    if not linked_instagram_ids:
        raise InstagramAutomationError(
            "Token Facebook sayfalarini goruyor ama hicbir sayfada instagram_business_account yok. "
            "Business Suite > Settings > Accounts > Instagram accounts icinden Instagram hesabini Facebook sayfasina bagla."
        )

    if instagram_user_id not in linked_instagram_ids:
        raise InstagramAutomationError(
            "INSTAGRAM_USER_ID tokenin erisebildigi instagram_business_account.id ile eslesmiyor. "
            "Graph API Explorer'da /me/accounts?fields=id,name,instagram_business_account sonucu icindeki "
            "instagram_business_account.id degerini GitHub secret INSTAGRAM_USER_ID olarak kaydet."
        )

    try:
        api_get(
            instagram_user_id,
            {
                "fields": "id,username,account_type",
                "access_token": access_token,
            },
            api_mode,
        )
    except InstagramAutomationError as exc:
        raise InstagramAutomationError(
            "INSTAGRAM_USER_ID gorunuyor ama bu token o Instagram hesabina erisemiyor. "
            "Tokeni sayfa/Instagram secimi yaparak yeniden uret ve INSTAGRAM_USER_ID degerini tekrar kontrol et. "
            f"Meta hata ozeti: {safe_error(exc)}"
        ) from exc

    return api_mode


def create_media_container(
    instagram_user_id: str,
    access_token: str,
    media_path: Path,
    media_url: str,
    caption: str,
    api_mode: str,
) -> str:
    suffix = media_path.suffix.lower()

    payload: Dict[str, Any] = {
        "caption": caption,
        "access_token": access_token,
    }

    if suffix in ALLOWED_IMAGE_EXTENSIONS:
        payload["image_url"] = media_url
    elif suffix in ALLOWED_VIDEO_EXTENSIONS:
        payload["media_type"] = "REELS"
        payload["video_url"] = media_url
        payload["share_to_feed"] = "true"
    else:
        raise InstagramAutomationError(f"Desteklenmeyen medya uzantısı: {suffix}")

    result = api_post(f"{instagram_user_id}/media", payload, api_mode)
    container_id = result.get("id")
    if not container_id:
        raise InstagramAutomationError(f"Instagram media container oluşturulamadı: {safe_error(result)}")
    return str(container_id)


def wait_until_container_ready(container_id: str, access_token: str, api_mode: str) -> None:
    # Images are usually ready very quickly; videos/Reels can take longer.
    max_attempts = int(os.getenv("IG_CONTAINER_STATUS_ATTEMPTS", "18"))
    sleep_seconds = int(os.getenv("IG_CONTAINER_STATUS_SLEEP", "10"))

    for _ in range(max_attempts):
        result = api_get(
            container_id,
            {
                "fields": "status_code,status",
                "access_token": access_token,
            },
            api_mode,
        )

        status_code = str(result.get("status_code", "")).upper()
        status = str(result.get("status", ""))

        if status_code == "FINISHED":
            return
        if status_code in {"ERROR", "EXPIRED"}:
            raise InstagramAutomationError(f"Container hazır değil: {safe_error(status or result)}")

        time.sleep(sleep_seconds)

    raise InstagramAutomationError("Instagram media container zamanında hazır olmadı.")


def publish_media(instagram_user_id: str, access_token: str, container_id: str, api_mode: str) -> str:
    result = api_post(
        f"{instagram_user_id}/media_publish",
        {
            "creation_id": container_id,
            "access_token": access_token,
        },
        api_mode,
    )
    media_id = result.get("id")
    if not media_id:
        raise InstagramAutomationError(f"Instagram paylaşımı yayınlanamadı: {safe_error(result)}")
    return str(media_id)


def print_report(report: Dict[str, Any]) -> None:
    print("\n--- Instagram Robot Raporu ---")
    print(f"Bugünkü başarılı paylaşım sayısı: {report.get('today_success_count')}/{report.get('daily_limit')}")
    print(f"Paylaşım yapıldı mı?: {report.get('posted')}")
    print(f"Kullanılan medya: {report.get('media_file') or '-'}")
    print(f"Kullanılan caption: {report.get('caption') or '-'}")
    print(f"Kullanılan hashtagler: {' '.join(report.get('hashtags') or []) or '-'}")
    print(f"Hata özeti: {report.get('error') or '-'}")
    print("------------------------------\n")


def run(dry_run: bool = False) -> int:
    print_safe_env_debug()
    timezone_name = os.getenv("TZ", DEFAULT_TIMEZONE)
    daily_limit = int(os.getenv("INSTAGRAM_DAILY_LIMIT", str(DEFAULT_DAILY_LIMIT)))

    limit_report = build_limit_report(LOG_PATH, timezone_name, daily_limit)
    terminal_report: Dict[str, Any] = {
        **limit_report,
        "posted": False,
        "media_file": None,
        "caption": None,
        "hashtags": [],
        "error": None,
    }

    try:
        if not can_post_today(LOG_PATH, timezone_name, daily_limit):
            terminal_report["error"] = "Günlük paylaşım limiti doldu."
            print_report(terminal_report)
            return 0

        media_path = choose_media_file()
        content = generate_instagram_content()
        caption = str(content.get("caption", "")).strip()
        hashtags = content.get("hashtags", [])

        if not caption:
            raise InstagramAutomationError("Caption boş olduğu için paylaşım yapılmadı.")

        terminal_report.update(
            {
                "media_file": str(media_path).replace("\\", "/"),
                "caption": caption,
                "hashtags": hashtags if isinstance(hashtags, list) else [],
            }
        )

        if dry_run:
            entry = base_log_entry("dry_run", timezone_name)
            entry.update(
                {
                    "kullanılan_medya": terminal_report["media_file"],
                    "caption": caption,
                    "hashtagler": terminal_report["hashtags"],
                    "hata_özeti": "Dry-run modu: Instagram API paylaşımı yapılmadı.",
                }
            )
            append_log(entry)
            terminal_report["error"] = "Dry-run tamamlandı; paylaşım yapılmadı."
            print_report(terminal_report)
            return 0

        access_token, instagram_user_id = validate_required_env()
        api_mode = validate_instagram_access(instagram_user_id, access_token)
        media_url = raw_github_media_url(media_path)

        container_id = create_media_container(instagram_user_id, access_token, media_path, media_url, caption, api_mode)
        wait_until_container_ready(container_id, access_token, api_mode)
        instagram_media_id = publish_media(instagram_user_id, access_token, container_id, api_mode)

        entry = base_log_entry("success", timezone_name)
        entry.update(
            {
                "instagram_media_id": instagram_media_id,
                "instagram_container_id": container_id,
                "kullanılan_medya": terminal_report["media_file"],
                "media_url": media_url,
                "caption": caption,
                "hashtagler": terminal_report["hashtags"],
                "api_mode": api_mode,
            }
        )
        append_log(entry)

        terminal_report["posted"] = True
        print_report(terminal_report)
        return 0

    except Exception as exc:
        error_text = safe_error(exc)
        entry = base_log_entry("failed", timezone_name)
        entry.update(
            {
                "hata_özeti": error_text,
                "kullanılan_medya": terminal_report.get("media_file"),
                "caption": terminal_report.get("caption"),
                "hashtagler": terminal_report.get("hashtags"),
            }
        )
        append_log(entry)

        terminal_report["error"] = error_text
        print_report(terminal_report)
        return 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Publish a Futbol Laboratuvarı Instagram post.")
    parser.add_argument("--dry-run", action="store_true", help="Generate and log content without publishing to Instagram.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    return run(dry_run=args.dry_run)


if __name__ == "__main__":
    raise SystemExit(main())
"""
Futbol Laboratuvari API secret yukleme ve secim yardimcilari.

Oncelik zinciri:

1. FOOTBALL_DATA_API_KEY
2. API_FOOTBALL_KEY
3. API_FOOTBALL_KEY2
4. DEMO MODE

GitHub Repository Secrets ve Environment Secrets calisma aninda ortam
degiskeni olarak gelir. Yerel kullanim icin proje kokundeki `.env` dosyasi da
desteklenir.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


FOOTBALL_DATA_KEY = "FOOTBALL_DATA_API_KEY"
API_FOOTBALL_KEY = "API_FOOTBALL_KEY"
API_FOOTBALL_KEY2 = "API_FOOTBALL_KEY2"

SECRET_PRIORITY = [
    FOOTBALL_DATA_KEY,
    API_FOOTBALL_KEY,
    API_FOOTBALL_KEY2,
]

PLACEHOLDER_VALUES = {
    "",
    "BURAYA_FOOTBALL_DATA_ORG_ANAHTARI",
    "BURAYA_API_FOOTBALL_ANAHTARI",
    "BURAYA_FOOTBALL_DATA_API_ANAHTARI_GELECEK",
    "BURAYA_API_FOOTBALL_ANAHTARI_GELECEK",
}


@dataclass(frozen=True)
class ActiveApiSecret:
    """Secilen API secret bilgisini tasir; anahtar degeri loglanmaz."""

    env_name: str | None
    data_source: str
    is_demo: bool

    @property
    def startup_log(self) -> str:
        """Baslangicta yazilacak standart log satirini doner."""
        if self.env_name:
            return f"[OK] {self.env_name} bulundu"
        return "[WARNING] API anahtarı bulunamadı. Demo mod aktif."


def project_root_from_file(file_path: str | Path) -> Path:
    """src icindeki bir dosyadan proje kokunu bulur."""
    return Path(file_path).resolve().parents[1]


def clean_env_value(value: str | None) -> str | None:
    """Bos veya placeholder degerleri kullanilabilir secret saymaz."""
    if value is None:
        return None
    cleaned = value.strip().strip('"').strip("'")
    if cleaned in PLACEHOLDER_VALUES:
        return None
    return cleaned or None


def load_dotenv(project_root: str | Path | None = None) -> Path | None:
    """
    Proje kokundeki `.env` dosyasini basit KEY=VALUE formatinda yukler.

    Mevcut ortam degiskenlerinin uzerine yazmaz; GitHub Secrets ve Windows
    ortam degiskenleri `.env` dosyasindan onceliklidir.
    """
    root = Path(project_root) if project_root is not None else Path.cwd()
    env_path = root / ".env"
    if not env_path.exists():
        return None

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        cleaned_value = clean_env_value(value)
        if key and cleaned_value is not None and not os.getenv(key):
            os.environ[key] = cleaned_value

    return env_path


def get_secret(env_name: str) -> str | None:
    """Tek bir secret ortam degiskenini temizlenmis halde okur."""
    return clean_env_value(os.getenv(env_name))


def get_active_api_secret() -> ActiveApiSecret:
    """Fallback zincirine gore aktif API secret kaynagini secer."""
    if get_secret(FOOTBALL_DATA_KEY):
        return ActiveApiSecret(
            env_name=FOOTBALL_DATA_KEY,
            data_source="Football-Data API",
            is_demo=False,
        )
    if get_secret(API_FOOTBALL_KEY):
        return ActiveApiSecret(
            env_name=API_FOOTBALL_KEY,
            data_source="API-Football",
            is_demo=False,
        )
    if get_secret(API_FOOTBALL_KEY2):
        return ActiveApiSecret(
            env_name=API_FOOTBALL_KEY2,
            data_source="API-Football-2",
            is_demo=False,
        )
    return ActiveApiSecret(
        env_name=None,
        data_source="Demo Mode",
        is_demo=True,
    )


def get_api_football_secret() -> tuple[str | None, str | None]:
    """API-Football icin birincil ve ikincil secret adlarini sirayla dener."""
    if get_secret(API_FOOTBALL_KEY):
        return get_secret(API_FOOTBALL_KEY), API_FOOTBALL_KEY
    if get_secret(API_FOOTBALL_KEY2):
        return get_secret(API_FOOTBALL_KEY2), API_FOOTBALL_KEY2
    return None, None

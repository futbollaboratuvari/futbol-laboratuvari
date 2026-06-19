"""
API-Football / API-Sports Football istemcisi.

Bu modul Futbol Laboratuvari V1 icin ikinci veri kaynagi hazirligidir.
API anahtari dosyaya yazilmaz; `API_FOOTBALL_KEY` ortam degiskeninden okunur.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

try:
    from api_secrets import (
        API_FOOTBALL_KEY,
        API_FOOTBALL_KEY2,
        get_api_football_secret,
        load_dotenv,
        project_root_from_file,
    )
except ImportError:
    from src.api_secrets import (
        API_FOOTBALL_KEY,
        API_FOOTBALL_KEY2,
        get_api_football_secret,
        load_dotenv,
        project_root_from_file,
    )

ENV_API_FOOTBALL_KEY = API_FOOTBALL_KEY
ENV_API_FOOTBALL_KEY2 = API_FOOTBALL_KEY2
API_FOOTBALL_KEY_PLACEHOLDER = "BURAYA_API_FOOTBALL_ANAHTARI_GELECEK"

CONFIG = {
    "base_url": "https://v3.football.api-sports.io",
    "timeout_seconds": 30,
}


class ApiFootballError(RuntimeError):
    """API-Football istegi basarisiz oldugunda kullanilir."""

    def __init__(
        self,
        message: str,
        status_code: int | None = None,
        headers: dict[str, str] | None = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.headers = headers or {}


@dataclass
class ApiFootballClient:
    """
    API-Football v3 icin kucuk HTTP istemcisi.
    """

    api_key: str | None = None
    base_url: str = CONFIG["base_url"]
    timeout_seconds: int = CONFIG["timeout_seconds"]
    last_status_code: int | None = None
    last_response_headers: dict[str, str] | None = None
    api_key_env_name: str | None = None

    def __post_init__(self) -> None:
        load_dotenv(project_root_from_file(__file__))
        if self.api_key is None:
            self.api_key, self.api_key_env_name = get_api_football_secret()
        elif self.api_key_env_name is None:
            self.api_key_env_name = "direct"

        if self.api_key == API_FOOTBALL_KEY_PLACEHOLDER:
            self.api_key = None
            self.api_key_env_name = None

    def api_key_var_mi(self) -> bool:
        """API anahtarinin kullanilabilir olup olmadigini doner."""
        return bool(self.api_key)

    def _build_url(self, endpoint: str, params: dict[str, Any] | None = None) -> str:
        clean_base_url = self.base_url.rstrip("/")
        clean_endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        url = f"{clean_base_url}{clean_endpoint}"

        if not params:
            return url

        filtered = {key: value for key, value in params.items() if value is not None}
        if not filtered:
            return url

        return f"{url}?{urlencode(filtered)}"

    def request_json(
        self, endpoint: str, params: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        API-Football endpointine GET istegi atar ve JSON yaniti doner.
        """
        if not self.api_key:
            raise ApiFootballError(
                "API-Football anahtari bulunamadi. "
                f"{ENV_API_FOOTBALL_KEY} veya {ENV_API_FOOTBALL_KEY2} "
                "ortam degiskenlerinden birini ayarlayin."
            )

        request = Request(
            self._build_url(endpoint, params),
            headers={
                "x-apisports-key": self.api_key,
                "Accept": "application/json",
            },
            method="GET",
        )

        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                self.last_status_code = response.status
                self.last_response_headers = dict(response.headers.items())
                charset = response.headers.get_content_charset() or "utf-8"
                body = response.read().decode(charset)
        except HTTPError as exc:
            self.last_status_code = exc.code
            self.last_response_headers = dict(exc.headers.items())
            error_body = exc.read().decode("utf-8", errors="replace")
            raise ApiFootballError(
                f"API-Football HTTP hatasi: {exc.code}. Yanit: {error_body}",
                status_code=exc.code,
                headers=dict(exc.headers.items()),
            ) from exc
        except URLError as exc:
            raise ApiFootballError(f"API-Football baglanti hatasi: {exc.reason}") from exc

        try:
            parsed = json.loads(body)
        except json.JSONDecodeError as exc:
            raise ApiFootballError("API-Football yaniti JSON degil.") from exc

        if not isinstance(parsed, dict):
            raise ApiFootballError("API-Football yaniti obje formatinda degil.")

        return parsed

    def get_leagues(
        self,
        country: str | None = None,
        season: int | None = None,
    ) -> dict[str, Any]:
        """Lig listesini ceker."""
        return self.request_json("/leagues", {"country": country, "season": season})

    def get_fixtures(
        self,
        league_id: int | str | None = None,
        season: int | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
        next_matches: int | None = None,
        last_matches: int | None = None,
    ) -> dict[str, Any]:
        """Fixture listesini ceker."""
        return self.request_json(
            "/fixtures",
            {
                "league": league_id,
                "season": season,
                "from": date_from,
                "to": date_to,
                "next": next_matches,
                "last": last_matches,
            },
        )

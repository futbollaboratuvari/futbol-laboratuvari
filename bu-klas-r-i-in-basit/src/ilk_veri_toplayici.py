"""
Futbol Laboratuvari V1 icin ilk football-data.org veri toplayici.

Bu modul, API anahtari daha sonra eklenecek sekilde tasarlanmistir.
Ana hedefler:

- Belirli bir ligin puan durumunu cekmek.
- Belirli bir lig veya genel kapsam icin son mac sonuclarini cekmek.
- Gelen ham JSON yanitlarini sade, uygulama icinde kullanilabilir listelere donusturmek.

football-data.org API anahtari `FOOTBALL_DATA_API_KEY` ortam degiskeniyle
verilebilir veya `FootballDataClient(api_key="...")` seklinde dogrudan
sinifa aktarilabilir.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

try:
    from api_secrets import FOOTBALL_DATA_KEY, get_secret, load_dotenv, project_root_from_file
except ImportError:
    from src.api_secrets import (
        FOOTBALL_DATA_KEY,
        get_secret,
        load_dotenv,
        project_root_from_file,
    )


# -----------------------------------------------------------------------------
# CONFIG
# -----------------------------------------------------------------------------
API_KEY_PLACEHOLDER = "BURAYA_FOOTBALL_DATA_API_ANAHTARI_GELECEK"
ENV_API_KEY_NAME = FOOTBALL_DATA_KEY

CONFIG = {
    "base_url": "https://api.football-data.org/v4",
    "timeout_seconds": 30,
    "default_competition_code": "PL",
    "default_recent_match_limit": 5,
    "output_file": "data/football_data_org_ornek.json",
}


class FootballDataApiError(RuntimeError):
    """football-data.org API istegi basarisiz oldugunda firlatilan hata."""

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
class FootballDataClient:
    """
    football-data.org API icin kucuk ve moduler istemci.

    Attributes:
        api_key: football-data.org API anahtari. Bos birakilirsa
            `FOOTBALL_DATA_API_KEY` ortam degiskeninden okunur.
        base_url: API kok adresi. Testlerde veya farkli surumlerde
            degistirilebilir.
        timeout_seconds: HTTP istegi icin zaman asimi suresi.
    """

    api_key: str | None = None
    base_url: str = CONFIG["base_url"]
    timeout_seconds: int = CONFIG["timeout_seconds"]
    last_status_code: int | None = None
    last_response_headers: dict[str, str] | None = None

    def __post_init__(self) -> None:
        """API anahtari verilmediyse ortam degiskeninden veya yer tutucudan okur."""
        load_dotenv(project_root_from_file(__file__))
        if self.api_key is None:
            self.api_key = get_secret(ENV_API_KEY_NAME)

        if self.api_key == API_KEY_PLACEHOLDER:
            self.api_key = None

    def _build_url(self, endpoint: str, params: dict[str, Any] | None = None) -> str:
        """
        Endpoint ve sorgu parametrelerinden tam API adresi olusturur.

        Args:
            endpoint: `/competitions/PL/standings` gibi API yolu.
            params: `season`, `matchday`, `status` gibi opsiyonel filtreler.

        Returns:
            Sorgu parametreleri eklenmis tam URL.
        """
        clean_base_url = self.base_url.rstrip("/")
        clean_endpoint = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        url = f"{clean_base_url}{clean_endpoint}"

        if not params:
            return url

        filtered_params = {
            key: value for key, value in params.items() if value is not None
        }
        if not filtered_params:
            return url

        return f"{url}?{urlencode(filtered_params)}"

    def _request_json(
        self, endpoint: str, params: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """
        football-data.org API'ye GET istegi atar ve JSON yanitini doner.

        Args:
            endpoint: API endpoint yolu.
            params: Endpoint icin opsiyonel sorgu parametreleri.

        Returns:
            API'den gelen JSON yaniti `dict` olarak doner.

        Raises:
            FootballDataApiError: API anahtari eksikse, HTTP hatasi olursa
                veya yanit JSON olarak okunamazsa firlatilir.
        """
        if not self.api_key:
            raise FootballDataApiError(
                f"API anahtari bulunamadi. {ENV_API_KEY_NAME} ortam "
                "degiskenini ayarlayin veya FootballDataClient(api_key=...) kullanin."
            )

        url = self._build_url(endpoint, params)
        request = Request(
            url,
            headers={
                "X-Auth-Token": self.api_key,
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
            raise FootballDataApiError(
                f"API HTTP hatasi: {exc.code} {exc.reason}. Yanit: {error_body}",
                status_code=exc.code,
                headers=dict(exc.headers.items()),
            ) from exc
        except URLError as exc:
            raise FootballDataApiError(f"API baglanti hatasi: {exc.reason}") from exc

        try:
            parsed = json.loads(body)
        except json.JSONDecodeError as exc:
            raise FootballDataApiError("API yaniti JSON formatinda degil.") from exc

        if not isinstance(parsed, dict):
            raise FootballDataApiError("API yaniti beklenen obje formatinda degil.")

        return parsed

    def get_standings(
        self, competition_code: str, season: int | None = None
    ) -> dict[str, Any]:
        """
        Belirli bir ligin puan durumunu ham API yaniti olarak ceker.

        Args:
            competition_code: football-data.org lig kodu. Ornekler:
                `PL`, `BL1`, `SA`, `PD`, `FL1`, `CL`.
            season: Opsiyonel sezon baslangic yili. Ornek: `2025`.

        Returns:
            Puan durumu endpointinden gelen ham JSON yaniti.
        """
        endpoint = f"/competitions/{competition_code}/standings"
        return self._request_json(endpoint, {"season": season})

    def get_recent_matches(
        self,
        competition_code: str | None = None,
        limit: int = 10,
        status: str = "FINISHED",
        date_from: str | None = None,
        date_to: str | None = None,
    ) -> dict[str, Any]:
        """
        Son mac sonuclarini ham API yaniti olarak ceker.

        Args:
            competition_code: Opsiyonel lig kodu. Verilirse sadece o ligdeki
                maclar cekilir; verilmezse abonelige dahil maclar endpointinden
                genel liste istenir.
            limit: Donusturme asamasinda kullanilacak maksimum mac sayisi.
                API bu parametreyi tum endpointlerde desteklemeyebilir; ham
                istek yerine `parse_matches(..., limit=...)` ile sinirlanir.
            status: Mac durumu. Sonuclar icin varsayilan `FINISHED`.
            date_from: Opsiyonel baslangic tarihi, `YYYY-MM-DD`.
            date_to: Opsiyonel bitis tarihi, `YYYY-MM-DD`.

        Returns:
            Maclar endpointinden gelen ham JSON yaniti.
        """
        if competition_code:
            endpoint = f"/competitions/{competition_code}/matches"
            params = {
                "status": status,
                "dateFrom": date_from,
                "dateTo": date_to,
            }
        else:
            endpoint = "/matches"
            params = {
                "competitions": None,
                "status": status,
                "dateFrom": date_from,
                "dateTo": date_to,
            }

        response = self._request_json(endpoint, params)
        response["_local_limit"] = limit
        return response


def parse_standings(api_response: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Ham puan durumu yanitini sade takim satirlarina donusturur.

    Args:
        api_response: `FootballDataClient.get_standings` fonksiyonundan gelen
            ham JSON sozlugu.

    Returns:
        Her takim icin puan, galibiyet, beraberlik, maglubiyet, gol ve averaj
        bilgilerini iceren liste.
    """
    standings = api_response.get("standings", [])
    if not standings:
        return []

    total_table = next(
        (
            standing
            for standing in standings
            if standing.get("type") in {"TOTAL", "REGULAR_SEASON"}
        ),
        standings[0],
    )

    rows: list[dict[str, Any]] = []
    for row in total_table.get("table", []):
        team = row.get("team", {})
        rows.append(
            {
                "position": row.get("position"),
                "team_id": team.get("id"),
                "team_name": team.get("name"),
                "played_games": row.get("playedGames"),
                "won": row.get("won"),
                "draw": row.get("draw"),
                "lost": row.get("lost"),
                "points": row.get("points"),
                "goals_for": row.get("goalsFor"),
                "goals_against": row.get("goalsAgainst"),
                "goal_difference": row.get("goalDifference"),
            }
        )

    return rows


def parse_matches(
    api_response: dict[str, Any], limit: int | None = None
) -> list[dict[str, Any]]:
    """
    Ham mac yanitini sade mac sonucu satirlarina donusturur.

    Args:
        api_response: `FootballDataClient.get_recent_matches` fonksiyonundan
            gelen ham JSON sozlugu.
        limit: Donulecek maksimum mac sayisi. Verilmezse yanittaki `_local_limit`
            kullanilir.

    Returns:
        Mac tarihi, takimlar, skor ve durum bilgilerini iceren liste.
    """
    matches = api_response.get("matches", [])
    result_limit = limit if limit is not None else api_response.get("_local_limit")

    parsed_matches: list[dict[str, Any]] = []
    for match in matches:
        score = match.get("score", {})
        full_time = score.get("fullTime", {})
        home_team = match.get("homeTeam", {})
        away_team = match.get("awayTeam", {})
        competition = match.get("competition", {})

        parsed_matches.append(
            {
                "match_id": match.get("id"),
                "utc_date": match.get("utcDate"),
                "competition_id": competition.get("id"),
                "competition_name": competition.get("name"),
                "matchday": match.get("matchday"),
                "status": match.get("status"),
                "home_team_id": home_team.get("id"),
                "home_team_name": home_team.get("name"),
                "away_team_id": away_team.get("id"),
                "away_team_name": away_team.get("name"),
                "home_goals": full_time.get("home"),
                "away_goals": full_time.get("away"),
                "winner": score.get("winner"),
            }
        )

    if result_limit is None:
        return parsed_matches

    return parsed_matches[: int(result_limit)]


def get_league_standings_table(
    client: FootballDataClient, competition_code: str, season: int | None = None
) -> list[dict[str, Any]]:
    """
    Bir ligin puan durumunu ceker ve sade tablo formatinda doner.

    Args:
        client: Hazir `FootballDataClient` ornegi.
        competition_code: football-data.org lig kodu.
        season: Opsiyonel sezon baslangic yili.

    Returns:
        Uygulama icinde kullanilabilecek sade puan durumu listesi.
    """
    response = client.get_standings(competition_code, season=season)
    return parse_standings(response)


def get_recent_match_results(
    client: FootballDataClient,
    competition_code: str | None = None,
    limit: int = 10,
    date_from: str | None = None,
    date_to: str | None = None,
) -> list[dict[str, Any]]:
    """
    Son mac sonuclarini ceker ve sade liste formatinda doner.

    Args:
        client: Hazir `FootballDataClient` ornegi.
        competition_code: Opsiyonel lig kodu.
        limit: Maksimum mac sayisi.
        date_from: Opsiyonel baslangic tarihi, `YYYY-MM-DD`.
        date_to: Opsiyonel bitis tarihi, `YYYY-MM-DD`.

    Returns:
        Uygulama icinde kullanilabilecek sade mac sonucu listesi.
    """
    response = client.get_recent_matches(
        competition_code=competition_code,
        limit=limit,
        date_from=date_from,
        date_to=date_to,
    )
    return parse_matches(response, limit=limit)


def save_results_to_file(results: dict[str, Any], output_file: str) -> Path:
    """
    Cekilen API sonuclarini JSON dosyasina kaydeder.

    Args:
        results: Kaydedilecek puan durumu ve son mac verileri.
        output_file: Proje kokune gore dosya yolu.

    Returns:
        Kaydedilen dosyanin `Path` nesnesi.
    """
    project_root = Path(__file__).resolve().parents[1]
    output_path = project_root / output_file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return output_path


if __name__ == "__main__":
    configured_api_key = os.getenv(ENV_API_KEY_NAME) or API_KEY_PLACEHOLDER
    client = FootballDataClient(api_key=configured_api_key)

    try:
        competition_code = CONFIG["default_competition_code"]
        recent_match_limit = CONFIG["default_recent_match_limit"]

        standings_table = get_league_standings_table(client, competition_code)

        recent_results = get_recent_match_results(
            client, competition_code, limit=recent_match_limit
        )

        results = {
            "competition_code": competition_code,
            "standings": standings_table,
            "recent_results": recent_results,
        }
        print(json.dumps(results, ensure_ascii=False, indent=2))
    except FootballDataApiError as exc:
        print(f"Veri cekme hatasi: {exc}")

"""
Futbol Laboratuvari V1 veri havuzu guncelleyici.

Bu modul football-data.org API'den gercek veriyi cekerek kalici veri havuzunu
buyutur.

Her calistirmada:

- Lig puan durumu guncellenir.
- Son bitmis maclar guncellenir.
- Takim gecmisi guncellenir.
- Ayni mac `match_id` ile ikinci kez kaydedilmez.
- Takim bazli veri buyume raporu uretilir.
- Confidence seviyeleri yeni V1 standardina gore yeniden hesaplanir:
  - 0-5 mac: low
  - 6-15 mac: medium
  - 16+ mac: high
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from ilk_veri_toplayici import (
        FootballDataClient,
        parse_matches,
        parse_standings,
    )
    from veri_havuzu import confidence_hesapla, veri_havuzu_olustur
except ImportError:
    from src.ilk_veri_toplayici import (
        FootballDataClient,
        parse_matches,
        parse_standings,
    )
    from src.veri_havuzu import confidence_hesapla, veri_havuzu_olustur


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_POOL_FILE = PROJECT_ROOT / "data" / "veri_havuzu.json"
DEFAULT_COMPETITION_CODE = "PL"


class VeriHavuzuGuncellemeHatasi(RuntimeError):
    """Veri havuzu guncelleme surecinde olusan hatalar icin kullanilir."""


def json_dosyasi_oku(path: Path) -> dict[str, Any] | None:
    """
    Var olan JSON dosyasini okur. Dosya yoksa `None` doner.
    """
    if not path.exists():
        return None

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise VeriHavuzuGuncellemeHatasi(f"JSON dosyasi bozuk: {path}") from exc
    except OSError as exc:
        raise VeriHavuzuGuncellemeHatasi(f"JSON dosyasi okunamadi: {path}") from exc

    if not isinstance(data, dict):
        raise VeriHavuzuGuncellemeHatasi("Veri havuzu kok verisi obje olmali.")

    return data


def json_dosyasi_yaz(path: Path, data: dict[str, Any]) -> None:
    """
    JSON verisini diske yazar.
    """
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def simdi_iso() -> str:
    """
    UTC zaman damgasini ISO formatinda doner.
    """
    return datetime.now(timezone.utc).isoformat()


def api_verisini_cek(
    competition_code: str = DEFAULT_COMPETITION_CODE,
    client: FootballDataClient | None = None,
) -> dict[str, Any]:
    """
    football-data.org API'den puan durumu ve bitmis maclari ceker.

    Args:
        competition_code: Lig kodu. Varsayilan `PL`.
        client: Testlerde verilebilecek hazir API istemcisi.

    Returns:
        Standings, matches ve lig metadata'sini iceren sozluk.
    """
    active_client = client or FootballDataClient()

    standings_response = active_client.get_standings(competition_code)
    matches_response = active_client.get_recent_matches(
        competition_code=competition_code,
        limit=10_000,
        status="FINISHED",
    )

    standings = parse_standings(standings_response)
    matches = parse_matches(matches_response, limit=None)

    competition = matches_response.get("competition") or standings_response.get("competition") or {}

    return {
        "competition_code": competition_code,
        "competition_id": competition.get("id"),
        "competition_name": competition.get("name"),
        "standings": standings,
        "matches": matches,
    }


def maclari_birlestir(
    existing_matches: list[dict[str, Any]],
    new_matches: list[dict[str, Any]],
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    """
    Mac listelerini `match_id` ile tekrar etmeden birlestirir.

    Returns:
        Birlesmis mac listesi ve eklenen/tekrar sayilarini iceren rapor.
    """
    merged_by_id: dict[str, dict[str, Any]] = {}

    for match in existing_matches:
        match_id = match.get("match_id")
        if match_id is not None:
            merged_by_id[str(match_id)] = match

    before_count = len(merged_by_id)
    duplicate_count = 0

    for match in new_matches:
        match_id = match.get("match_id")
        if match_id is None:
            continue

        key = str(match_id)
        if key in merged_by_id:
            duplicate_count += 1
        merged_by_id[key] = match

    merged_matches = sorted(
        merged_by_id.values(),
        key=lambda item: item.get("utc_date") or "",
        reverse=True,
    )
    after_count = len(merged_matches)

    return merged_matches, {
        "existing_unique_matches": before_count,
        "incoming_matches": len(new_matches),
        "duplicate_matches": duplicate_count,
        "new_matches_added": after_count - before_count,
        "total_unique_matches": after_count,
    }


def takim_listesi_standings_uzerinden(standings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Puan durumu satirlarindan takim listesi uretir.
    """
    return [
        {
            "team_id": row.get("team_id"),
            "team_name": row.get("team_name"),
            "position": row.get("position"),
        }
        for row in standings
    ]


def takim_buyume_raporu_uret(
    previous_pool: dict[str, Any] | None,
    current_pool: dict[str, Any],
) -> list[dict[str, Any]]:
    """
    Takim bazli mac sayisi buyume raporu uretir.
    """
    previous_teams = (previous_pool or {}).get("teams", {})
    current_teams = current_pool.get("teams", {})
    report = []

    for team_id, current in current_teams.items():
        previous = previous_teams.get(team_id, {})
        previous_count = int(previous.get("match_count") or 0)
        current_count = int(current.get("match_count") or 0)
        report.append(
            {
                "team_id": current.get("team_id"),
                "team_name": current.get("team_name"),
                "previous_match_count": previous_count,
                "current_match_count": current_count,
                "added_match_count": current_count - previous_count,
                "confidence": confidence_hesapla(current_count),
            }
        )

    return sorted(report, key=lambda row: row["current_match_count"], reverse=True)


def havuz_verisini_olustur(
    competition_code: str,
    competition_id: int | str | None,
    competition_name: str | None,
    standings: list[dict[str, Any]],
    matches: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Standings ve mac listesinden kalici havuz verisi olusturur.
    """
    teams = takim_listesi_standings_uzerinden(standings)
    pool = veri_havuzu_olustur(teams, matches)
    pool["competition"] = {
        "competition_code": competition_code,
        "competition_id": competition_id,
        "competition_name": competition_name,
    }
    pool["standings"] = standings
    pool["updated_at"] = simdi_iso()
    return pool


def veri_havuzunu_guncelle(
    competition_code: str = DEFAULT_COMPETITION_CODE,
    output_file: Path = DEFAULT_POOL_FILE,
    client: FootballDataClient | None = None,
) -> dict[str, Any]:
    """
    API verisiyle kalici veri havuzunu gunceller.

    Args:
        competition_code: Lig kodu.
        output_file: Yazilacak havuz dosyasi.
        client: Opsiyonel API istemcisi.

    Returns:
        Guncelleme raporu ve yeni havuz ozetini iceren sozluk.
    """
    previous_pool = json_dosyasi_oku(output_file)
    previous_matches = (previous_pool or {}).get("matches", [])

    api_data = api_verisini_cek(competition_code=competition_code, client=client)
    merged_matches, duplicate_report = maclari_birlestir(
        previous_matches,
        api_data["matches"],
    )

    current_pool = havuz_verisini_olustur(
        competition_code=api_data["competition_code"],
        competition_id=api_data["competition_id"],
        competition_name=api_data["competition_name"],
        standings=api_data["standings"],
        matches=merged_matches,
    )
    current_pool["matches"] = merged_matches
    current_pool["deduplication"] = duplicate_report

    growth_report = takim_buyume_raporu_uret(previous_pool, current_pool)
    current_pool["team_growth_report"] = growth_report

    json_dosyasi_yaz(output_file, current_pool)

    return {
        "output_file": str(output_file),
        "competition": current_pool["competition"],
        "deduplication": duplicate_report,
        "team_growth_report": growth_report,
        "pool_summary": {
            "team_count": current_pool["team_count"],
            "match_count": current_pool["match_count"],
            "updated_at": current_pool["updated_at"],
        },
    }


if __name__ == "__main__":
    try:
        report = veri_havuzunu_guncelle()
        print(json.dumps(report, ensure_ascii=False, indent=2))
    except Exception as exc:  # CLI'da anlasilir hata mesaji icin.
        print(f"Veri havuzu guncelleme hatasi: {exc}")


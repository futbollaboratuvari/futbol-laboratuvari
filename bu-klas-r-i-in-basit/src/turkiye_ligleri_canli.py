"""
Futbol Laboratuvari Turkiye ligleri canli API baglanti araci.

API-Football anahtari varsa:

- Turkiye liglerini canli API'den listeler.
- Proje hedef ligleriyle gercek league_id eslesmelerini bulur.
- Secilen tarih araliginda fixture ceker.
- Ham veri havuzunu buyutmek icin rapor uretir.

API anahtari yoksa calisma durumu rapora acikca yazilir.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

try:
    from api_football_client import ApiFootballClient, ApiFootballError
    from ham_veri_havuzu import DEFAULT_RAW_POOL_FILE, havuz_oku, havuz_yaz, maclari_havuza_ekle
    from veri_kaynagi_yoneticisi import (
        api_football_fallback_tara,
        api_football_lig_eslesmelerini_bul,
        api_football_turkiye_liglerini_listele,
        bugunun_tarihi,
    )
except ImportError:
    from src.api_football_client import ApiFootballClient, ApiFootballError
    from src.ham_veri_havuzu import DEFAULT_RAW_POOL_FILE, havuz_oku, havuz_yaz, maclari_havuza_ekle
    from src.veri_kaynagi_yoneticisi import (
        api_football_fallback_tara,
        api_football_lig_eslesmelerini_bul,
        api_football_turkiye_liglerini_listele,
        bugunun_tarihi,
    )


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_GROWTH_REPORT_FILE = PROJECT_ROOT / "outputs" / "veri_buyutme_raporu.md"


def tum_maclari_cikar(scan_report: dict[str, Any]) -> list[dict[str, Any]]:
    """Tarama raporundaki tum maclari tek listeye indirger."""
    matches = []
    for row in scan_report.get("rows", []):
        for match in row.get("matches", []):
            enriched = dict(match)
            enriched.setdefault("competition_code", row.get("competition_code"))
            enriched.setdefault("competition_name", row.get("competition_name"))
            enriched.setdefault("source", row.get("source", "api_football"))
            matches.append(enriched)
    return matches


def turkiye_ligleri_canli_bagla(
    date_from: str | None = None,
    day_count: int = 30,
    raw_pool_file: Path = DEFAULT_RAW_POOL_FILE,
    client: ApiFootballClient | None = None,
) -> dict[str, Any]:
    """
    Turkiye ligleri icin canli API baglantisi kurar ve ham havuzu buyutur.
    """
    active_client = client or ApiFootballClient()
    active_date_from = date_from or bugunun_tarihi()

    if not active_client.api_key_var_mi():
        return {
            "status": "api_key_missing",
            "message": "API_FOOTBALL_KEY tanimli olmadigi icin canli API-Football baglantisi calistirilamadi.",
            "date_from": active_date_from,
            "day_count": day_count,
            "league_matches": {},
            "scan_report": None,
            "raw_pool_report": None,
            "raw_pool_file": str(raw_pool_file),
        }

    leagues = api_football_turkiye_liglerini_listele(active_client)
    league_matches = api_football_lig_eslesmelerini_bul(leagues)
    scan_report = api_football_fallback_tara(
        date_from=active_date_from,
        day_count=day_count,
        client=active_client,
    )
    found_matches = tum_maclari_cikar(scan_report)

    raw_pool = havuz_oku(raw_pool_file)
    raw_pool, raw_pool_report = maclari_havuza_ekle(
        raw_pool,
        found_matches,
        source="api_football_turkiye_canli",
    )
    havuz_yaz(raw_pool, raw_pool_file)

    return {
        "status": "ok",
        "date_from": active_date_from,
        "day_count": day_count,
        "league_matches": league_matches,
        "scan_report": scan_report,
        "raw_pool_report": raw_pool_report,
        "raw_pool_file": str(raw_pool_file),
    }


def veri_buyutme_markdown_uret(result: dict[str, Any]) -> str:
    """Veri buyutme sonucunu Markdown raporuna cevirir."""
    lines = [
        "# Veri Buyutme Raporu",
        "",
        "## Rapor Bilgisi",
        "",
        f"STATUS: {result.get('status')}",
        f"DATE_FROM: {result.get('date_from')}",
        f"DAY_COUNT: {result.get('day_count')}",
        f"HAM_VERI_HAVUZU: {result.get('raw_pool_file')}",
        "",
    ]

    if result.get("status") == "api_key_missing":
        lines.extend(
            [
                "## Durum",
                "",
                result.get("message", "API anahtari eksik."),
                "",
                "Canli league_id cekimi ve ham veri buyutme icin `API_FOOTBALL_KEY` ortam degiskeni tanimlanmali.",
            ]
        )
        return "\n".join(lines)

    lines.extend(
        [
            "## Turkiye Lig ID Eslesmeleri",
            "",
            "| Proje Kodu | Lig Adi | League ID | Ulke | Sezonlar |",
            "|---|---|---:|---|---|",
        ]
    )
    league_matches = result.get("league_matches", {})
    if not league_matches:
        lines.append("| - | Eslesme bulunamadi | - | - | - |")
    for project_code, league in league_matches.items():
        seasons = ", ".join(str(item) for item in league.get("seasons", []))
        lines.append(
            "| {code} | {name} | {league_id} | {country} | {seasons} |".format(
                code=project_code,
                name=league.get("league_name") or league.get("display_name") or "-",
                league_id=league.get("league_id") or "-",
                country=league.get("country_name") or "-",
                seasons=seasons or "-",
            )
        )

    scan_report = result.get("scan_report") or {}
    lines.extend(
        [
            "",
            "## Lig Bazli Mac Cekimi",
            "",
            f"TOPLAM_MAC: {scan_report.get('total_matches', 0)}",
            "",
            "| Lig | League ID | Mac Sayisi | Ilk Mac | Son Mac | Durum |",
            "|---|---:|---:|---|---|---|",
        ]
    )
    for row in scan_report.get("rows", []):
        lines.append(
            "| {name} | {league_id} | {count} | {first} | {last} | {status} |".format(
                name=row.get("competition_name") or row.get("competition_code") or "-",
                league_id=row.get("competition_id") or "-",
                count=row.get("match_count", 0),
                first=row.get("first_match_date") or "-",
                last=row.get("last_match_date") or "-",
                status=row.get("status") or "-",
            )
        )

    raw_report = result.get("raw_pool_report") or {}
    lines.extend(
        [
            "",
            "## Ham Veri Havuzu Buyume",
            "",
            f"Gelen mac: {raw_report.get('incoming_matches', 0)}",
            f"Yeni eklenen mac: {raw_report.get('new_matches_added', 0)}",
            f"Tekrar mac: {raw_report.get('duplicate_matches', 0)}",
            f"Toplam benzersiz mac: {raw_report.get('total_unique_matches', 0)}",
            "",
            "## Sonraki Adim",
            "",
            "- Ham havuz buyudukten sonra robot tekrar calistirilip Faz 3 kupon skorlari daha yuksek confidence ile uretilmeli.",
        ]
    )
    return "\n".join(lines)


def veri_buyutme_raporu_uret(
    output_file: Path = DEFAULT_GROWTH_REPORT_FILE,
    date_from: str | None = None,
    day_count: int = 30,
) -> dict[str, Any]:
    """Canli baglanti sonucunu rapor dosyasina yazar."""
    try:
        result = turkiye_ligleri_canli_bagla(date_from=date_from, day_count=day_count)
    except ApiFootballError as exc:
        result = {
            "status": "api_error",
            "message": str(exc),
            "date_from": date_from or bugunun_tarihi(),
            "day_count": day_count,
            "league_matches": {},
            "scan_report": None,
            "raw_pool_report": None,
            "raw_pool_file": str(DEFAULT_RAW_POOL_FILE),
        }

    markdown = veri_buyutme_markdown_uret(result)
    write_error = None
    try:
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(markdown, encoding="utf-8")
    except OSError as exc:
        write_error = str(exc)
    return {
        "output_file": str(output_file),
        "write_error": write_error,
        "result": result,
        "markdown": markdown,
    }


if __name__ == "__main__":
    report = veri_buyutme_raporu_uret()
    print(report["markdown"])

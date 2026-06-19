"""
Futbol Laboratuvari veri kaynagi yoneticisi.

Ana kaynak football-data.org'dur. 0 mac, 403/404 veya veri yetersizligi
durumunda API-Football fallback mimarisi devreye girecek sekilde hazirlanir.
"""

from __future__ import annotations

from datetime import date
from typing import Any

try:
    from api_football_client import ApiFootballClient, ApiFootballError
    from api_football_normalizer import (
        api_football_fixtures_normalize,
        api_football_leagues_normalize,
    )
    from gunun_maclari_tarayici import (
        DEFAULT_API_CALL_DELAY_SECONDS,
        DEFAULT_COMPETITION_CODES,
        bitis_tarihi_hesapla,
        competition_mac_taramasi_yap,
        mac_tarih_araligi_ozeti,
    )
    from ilk_veri_toplayici import FootballDataApiError, FootballDataClient
    from kaynak_oncelik_haritasi import TURKIYE_LIGLERI
except ImportError:
    from src.api_football_client import ApiFootballClient, ApiFootballError
    from src.api_football_normalizer import (
        api_football_fixtures_normalize,
        api_football_leagues_normalize,
    )
    from src.gunun_maclari_tarayici import (
        DEFAULT_API_CALL_DELAY_SECONDS,
        DEFAULT_COMPETITION_CODES,
        bitis_tarihi_hesapla,
        competition_mac_taramasi_yap,
        mac_tarih_araligi_ozeti,
    )
    from src.ilk_veri_toplayici import FootballDataApiError, FootballDataClient
    from src.kaynak_oncelik_haritasi import TURKIYE_LIGLERI


MINIMUM_MATCH_COUNT = 1


def bugunun_tarihi() -> str:
    """Bugunun tarihini ISO formatinda doner."""
    return date.today().isoformat()


def veri_yetersiz_mi(scan_report: dict[str, Any]) -> bool:
    """Kaynak raporunda kullanilabilir mac olup olmadigini kontrol eder."""
    return int(scan_report.get("total_matches") or 0) < MINIMUM_MATCH_COUNT


def football_data_org_tara(
    date_from: str | None = None,
    day_count: int = 7,
    competition_codes: list[str] | None = None,
) -> dict[str, Any]:
    """football-data.org kaynagini kuyruk sistemiyle tarar."""
    client = FootballDataClient()
    if not client.api_key:
        raise FootballDataApiError(
            "FOOTBALL_DATA_API_KEY bulunamadigi icin football-data.org taramasi baslatilmadi."
        )
    return competition_mac_taramasi_yap(
        client=client,
        competition_codes=competition_codes or DEFAULT_COMPETITION_CODES,
        date_from=date_from or bugunun_tarihi(),
        day_count=day_count,
        api_call_delay_seconds=DEFAULT_API_CALL_DELAY_SECONDS,
        use_rate_limit_queue=True,
    )


def api_football_turkiye_liglerini_listele(
    client: ApiFootballClient | None = None,
    season: int | None = None,
) -> list[dict[str, Any]]:
    """API-Football uzerinden Turkiye liglerini arastirmak icin kullanilir."""
    active_client = client or ApiFootballClient()
    response = active_client.get_leagues(country="Turkey", season=season)
    return api_football_leagues_normalize(response)


def api_football_fixture_tara(
    league_id: int | str,
    season: int,
    date_from: str,
    date_to: str,
    client: ApiFootballClient | None = None,
) -> list[dict[str, Any]]:
    """API-Football fixture verisini cekip ortak semaya normalize eder."""
    active_client = client or ApiFootballClient()
    response = active_client.get_fixtures(
        league_id=league_id,
        season=season,
        date_from=date_from,
        date_to=date_to,
    )
    return api_football_fixtures_normalize(response)


def api_football_fallback_hazir_mi() -> bool:
    """API-Football anahtari var mi kontrol eder."""
    return ApiFootballClient().api_key_var_mi()


def api_football_lig_eslesmelerini_bul(
    leagues: list[dict[str, Any]],
) -> dict[str, dict[str, Any]]:
    """
    API-Football Turkiye lig listesinden proje hedef ligleri icin eslesme arar.
    """
    matches: dict[str, dict[str, Any]] = {}

    for project_code, plan in TURKIYE_LIGLERI.items():
        search_name = str(plan.get("api_football_search_name") or "").lower()
        if not search_name:
            continue

        for league in leagues:
            league_name = str(league.get("league_name") or "").lower()
            if search_name in league_name or league_name in search_name:
                matches[project_code] = {
                    **plan,
                    "league_id": league.get("league_id"),
                    "league_name": league.get("league_name"),
                    "country_name": league.get("country_name"),
                    "seasons": league.get("seasons", []),
                }
                break

    return matches


def sezon_sec(league: dict[str, Any], date_from: str) -> int:
    """
    API-Football sezon bilgisini secer.

    Lig yanitinda sezon listesi varsa hedef tarihe en yakin sezonu, yoksa
    `date_from` yilini kullanir.
    """
    target_year = int(date_from[:4])
    seasons = [int(season) for season in league.get("seasons", []) if season]
    if not seasons:
        return target_year

    valid = [season for season in seasons if season <= target_year]
    return max(valid or seasons)


def api_football_fallback_tara(
    date_from: str,
    day_count: int,
    client: ApiFootballClient | None = None,
) -> dict[str, Any]:
    """
    API-Football uzerinden Turkiye ligleri icin fixture taramasi yapar.
    """
    active_client = client or ApiFootballClient()
    date_to = bitis_tarihi_hesapla(date_from, day_count)
    leagues = api_football_turkiye_liglerini_listele(active_client)
    league_matches = api_football_lig_eslesmelerini_bul(leagues)

    rows = []
    total_matches = 0

    for project_code, league in league_matches.items():
        league_id = league.get("league_id")
        if league_id is None:
            continue

        season = sezon_sec(league, date_from)
        try:
            matches = api_football_fixture_tara(
                league_id=league_id,
                season=season,
                date_from=date_from,
                date_to=date_to,
                client=active_client,
            )
            date_summary = mac_tarih_araligi_ozeti(matches)
            total_matches += len(matches)
            rows.append(
                {
                    "competition_code": project_code,
                    "competition_id": league_id,
                    "competition_name": league.get("league_name"),
                    "source": "api_football",
                    "match_count": len(matches),
                    "first_match_date": date_summary["first_match_date"],
                    "last_match_date": date_summary["last_match_date"],
                    "matches": matches,
                    "access_error": None,
                    "error_code": None,
                    "api_response_code": active_client.last_status_code,
                    "remaining_requests": None,
                    "retry_count": 0,
                    "waited_seconds": 0,
                    "status": "ok",
                }
            )
        except ApiFootballError as exc:
            rows.append(
                {
                    "competition_code": project_code,
                    "competition_id": league_id,
                    "competition_name": league.get("league_name"),
                    "source": "api_football",
                    "match_count": 0,
                    "first_match_date": None,
                    "last_match_date": None,
                    "matches": [],
                    "access_error": str(exc),
                    "error_code": exc.status_code,
                    "api_response_code": exc.status_code,
                    "remaining_requests": None,
                    "retry_count": 0,
                    "waited_seconds": 0,
                    "status": "error",
                }
            )

    return {
        "rapor_tipi": "API_FOOTBALL_FALLBACK_TARAMA_RAPORU",
        "analysis_date": bugunun_tarihi(),
        "date_from": date_from,
        "date_to": date_to,
        "day_count": day_count,
        "competition_count": len(rows),
        "total_matches": total_matches,
        "rows": rows,
        "api_football_league_matches": league_matches,
    }


def kaynak_secimli_mac_taramasi(
    date_from: str | None = None,
    day_count: int = 7,
    competition_codes: list[str] | None = None,
) -> dict[str, Any]:
    """
    Once football-data.org'u dener. Veri yetersizse API-Football fallback
    durumunu rapora ekler.

    API-Football lig id'leri henuz doldurulmadigi icin fallback bu fazda
    mimari hazirlik ve anahtar kontrolu seviyesindedir.
    """
    source_report = {
        "primary_source": "football_data_org",
        "fallback_source": "api_football",
        "fallback_attempted": False,
        "fallback_ready": api_football_fallback_hazir_mi(),
        "fallback_reason": None,
        "turkiye_league_plan": TURKIYE_LIGLERI,
    }

    try:
        football_data_report = football_data_org_tara(
            date_from=date_from,
            day_count=day_count,
            competition_codes=competition_codes,
        )
    except FootballDataApiError as exc:
        source_report["fallback_attempted"] = True
        source_report["fallback_reason"] = f"football-data.org hata: {exc}"
        football_data_report = {
            "rapor_tipi": "API_MAC_TARAMA_RAPORU",
            "analysis_date": bugunun_tarihi(),
            "date_from": date_from or bugunun_tarihi(),
            "date_to": date_from or bugunun_tarihi(),
            "day_count": day_count,
            "competition_count": 0,
            "total_matches": 0,
            "rows": [],
        }

    if veri_yetersiz_mi(football_data_report):
        source_report["fallback_attempted"] = True
        source_report["fallback_reason"] = "football-data.org 0 mac veya veri yetersiz dondurdu."

        if not source_report["fallback_ready"]:
            source_report["fallback_status"] = (
                "API_FOOTBALL_KEY veya API_FOOTBALL_KEY2 bulunamadigi icin fallback gercek veri cekmedi."
            )
        else:
            try:
                api_football_report = api_football_fallback_tara(
                    date_from=date_from or bugunun_tarihi(),
                    day_count=day_count,
                )
                source_report["fallback_status"] = "API-Football fallback calisti."
                source_report["api_football_total_matches"] = api_football_report.get(
                    "total_matches", 0
                )
                api_football_report["source_manager"] = source_report
                return api_football_report
            except ApiFootballError as exc:
                source_report["fallback_status"] = f"API-Football fallback hata verdi: {exc}"
    else:
        source_report["fallback_status"] = "Fallback gerekmedi."

    football_data_report["source_manager"] = source_report
    return football_data_report


def turkiye_ligleri_plani_uret() -> dict[str, Any]:
    """Turkiye ligleri icin API-Football arastirma planini doner."""
    return {
        "source": "api_football",
        "env_key": "API_FOOTBALL_KEY / API_FOOTBALL_KEY2",
        "leagues": TURKIYE_LIGLERI,
        "next_step": "/leagues?country=Turkey endpointiyle league_id alanlarini doldur.",
    }

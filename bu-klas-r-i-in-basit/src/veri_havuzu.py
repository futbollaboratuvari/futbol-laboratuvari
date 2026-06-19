"""
Futbol Laboratuvari V1 veri havuzu.

Bu modul tek seferlik ornek JSON mantigindan daha genis, takim bazli veri
havuzu mantigina gecis icin tasarlanmistir.

Her takim icin saklanan ana parcalar:

- Son 20 mac
- Son 10 ic saha maci
- Son 10 deplasman maci
- Varsa ilk yari ve ikinci yari skor alanlari

Veri yapisi sozluk tabanlidir ve takim kimligiyle indekslenir. Bu sayede
ileride binlerce mac tutuldugunda takim bazli erisim hizli kalir.
"""

from __future__ import annotations

import json
from typing import Any

try:
    from confidence_motoru import confidence_from_match_count
    from veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret
except ImportError:
    from src.confidence_motoru import confidence_from_match_count
    from src.veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret


HALF_TIME_HOME_KEYS = ("half_time_home_goals", "ht_home_goals")
HALF_TIME_AWAY_KEYS = ("half_time_away_goals", "ht_away_goals")


def confidence_hesapla(match_count: int) -> str:
    """
    Sayisal V1 confidence standardina gore confidence seviyesi hesaplar.

    Seviyeler:
    - low
    - medium
    - high
    - very_high
    """
    return confidence_from_match_count(match_count)["confidence"]


def ilk_dolu_degeri_al(data: dict[str, Any], keys: tuple[str, ...]) -> Any:
    """Verilen anahtarlar icinden ilk dolu degeri doner."""
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return None


def standart_mac_kaydi_uret(match: dict[str, Any]) -> dict[str, Any]:
    """
    Mac verisini havuz icin standart formata donusturur.

    Args:
        match: Veri okuyucudan gelen mac kaydi.

    Returns:
        Ortak alan adlariyla standart mac kaydi.
    """
    home_goals = match.get("home_goals")
    away_goals = match.get("away_goals")
    ht_home = ilk_dolu_degeri_al(match, HALF_TIME_HOME_KEYS)
    ht_away = ilk_dolu_degeri_al(match, HALF_TIME_AWAY_KEYS)

    second_half_home_goals = None
    second_half_away_goals = None
    if ht_home is not None and ht_away is not None and home_goals is not None and away_goals is not None:
        second_half_home_goals = int(home_goals) - int(ht_home)
        second_half_away_goals = int(away_goals) - int(ht_away)

    return {
        "match_id": match.get("match_id"),
        "utc_date": match.get("utc_date"),
        "competition_id": match.get("competition_id"),
        "competition_name": match.get("competition_name"),
        "matchday": match.get("matchday"),
        "status": match.get("status"),
        "home_team_id": match.get("home_team_id"),
        "home_team_name": match.get("home_team_name"),
        "away_team_id": match.get("away_team_id"),
        "away_team_name": match.get("away_team_name"),
        "home_goals": home_goals,
        "away_goals": away_goals,
        "winner": match.get("winner"),
        "half_time_home_goals": ht_home,
        "half_time_away_goals": ht_away,
        "second_half_home_goals": second_half_home_goals,
        "second_half_away_goals": second_half_away_goals,
        "has_half_time_data": ht_home is not None and ht_away is not None,
    }


def takim_havuz_kaydi_olustur(team: dict[str, Any]) -> dict[str, Any]:
    """
    Bir takim icin bos havuz kaydi olusturur.
    """
    return {
        "team_id": team.get("team_id"),
        "team_name": team.get("team_name"),
        "position": team.get("position"),
        "all_matches": [],
        "last_20_matches": [],
        "last_10_home_matches": [],
        "last_10_away_matches": [],
        "match_count": 0,
        "home_match_count": 0,
        "away_match_count": 0,
        "half_time_match_count": 0,
        "confidence": "low",
    }


def takim_macini_havuza_ekle(team_record: dict[str, Any], match: dict[str, Any]) -> None:
    """
    Standart mac kaydini takim havuzuna ekler.
    """
    team_id = team_record["team_id"]
    is_home = match.get("home_team_id") == team_id
    is_away = match.get("away_team_id") == team_id

    if not (is_home or is_away):
        return

    team_record["all_matches"].append(match)
    if is_home:
        team_record["last_10_home_matches"].append(match)
    if is_away:
        team_record["last_10_away_matches"].append(match)


def takim_havuzunu_sirala_ve_sinirla(team_record: dict[str, Any]) -> dict[str, Any]:
    """
    Takim havuzundaki maclari tarihe gore siralar ve limitleri uygular.
    """
    all_matches = sorted(
        team_record["all_matches"],
        key=lambda match: match.get("utc_date") or "",
        reverse=True,
    )
    home_matches = sorted(
        team_record["last_10_home_matches"],
        key=lambda match: match.get("utc_date") or "",
        reverse=True,
    )
    away_matches = sorted(
        team_record["last_10_away_matches"],
        key=lambda match: match.get("utc_date") or "",
        reverse=True,
    )

    team_record["all_matches"] = all_matches
    team_record["last_20_matches"] = all_matches[:20]
    team_record["last_10_home_matches"] = home_matches[:10]
    team_record["last_10_away_matches"] = away_matches[:10]
    team_record["match_count"] = len(all_matches)
    team_record["home_match_count"] = len(home_matches)
    team_record["away_match_count"] = len(away_matches)
    team_record["half_time_match_count"] = sum(
        1 for match in all_matches if match.get("has_half_time_data")
    )
    team_record["confidence"] = confidence_hesapla(len(all_matches))
    team_record["confidence_score"] = confidence_from_match_count(
        len(all_matches)
    )["confidence_score"]
    return team_record


def veri_havuzu_olustur(
    teams: list[dict[str, Any]],
    matches: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Takim listesi ve mac listesinden takim bazli veri havuzu olusturur.

    Args:
        teams: Takim listesi.
        matches: Mac listesi.

    Returns:
        Takim kimligiyle indekslenmis havuz ve genel metadata.
    """
    standardized_matches = [standart_mac_kaydi_uret(match) for match in matches]
    team_pool = {
        str(team["team_id"]): takim_havuz_kaydi_olustur(team)
        for team in teams
    }

    for match in standardized_matches:
        for team_id in (match.get("home_team_id"), match.get("away_team_id")):
            record = team_pool.get(str(team_id))
            if record is not None:
                takim_macini_havuza_ekle(record, match)

    for team_id, record in team_pool.items():
        team_pool[team_id] = takim_havuzunu_sirala_ve_sinirla(record)

    return {
        "schema_version": "v1",
        "storage_strategy": "team_id_indexed_match_pool",
        "limits": {
            "last_matches": 20,
            "home_matches": 10,
            "away_matches": 10,
        },
        "team_count": len(teams),
        "match_count": len(standardized_matches),
        "teams": team_pool,
    }


def yerel_ornek_veri_havuzu_olustur() -> dict[str, Any]:
    """
    Mevcut `data/football_data_org_ornek.json` dosyasindan havuz olusturur.
    """
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    matches = son_mac_sonuclarini_listele(data)
    return veri_havuzu_olustur(summary["teams"], matches)


if __name__ == "__main__":
    pool = yerel_ornek_veri_havuzu_olustur()
    preview = {
        "schema_version": pool["schema_version"],
        "team_count": pool["team_count"],
        "match_count": pool["match_count"],
        "limits": pool["limits"],
        "sample_teams": list(pool["teams"].values())[:3],
    }
    print(json.dumps(preview, ensure_ascii=False, indent=2))

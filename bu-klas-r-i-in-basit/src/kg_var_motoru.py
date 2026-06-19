"""
Futbol Laboratuvari V1 icin KG Var Motoru.

Bu modul takimlarin karsilikli gol (KG Var) egilimini hesaplar.

KG_VAR_SCORE 0-100 araliginda uretilir.

Skor mantigi:

- Son 5 mac KG Var orani: 35 puan
- Ev sahibi KG Var orani: 15 puan
- Deplasman KG Var orani: 15 puan
- Gol uretim ortalamasi: 15 puan
- Gol yeme ortalamasi: 15 puan
- Momentum / son mac KG Var sinyali: 5 puan

Iki takim icin ortak KG Var egilimi hesaplanirken:

- Ev sahibi takimin genel KG Var skoru
- Deplasman takimin genel KG Var skoru
- Ev sahibi takimin ev KG Var orani
- Deplasman takimin deplasman KG Var orani
- Iki takimin gol atma ve gol yeme ortalamalari

birlikte degerlendirilir.
"""

from __future__ import annotations

import json
from typing import Any

try:
    from confidence_motoru import confidence_from_match_count
    from form_puani_motoru import (
        takim_acisindan_mac_sonucu,
        takim_maclarini_filtrele,
        son_maclari_sec,
    )
    from veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret
except ImportError:
    from src.confidence_motoru import confidence_from_match_count
    from src.form_puani_motoru import (
        takim_acisindan_mac_sonucu,
        takim_maclarini_filtrele,
        son_maclari_sec,
    )
    from src.veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret


def kg_var_mi(goals_for: int, goals_against: int) -> bool:
    """
    Takim acisindan bir macta iki tarafin da gol atip atmadigini hesaplar.

    Args:
        goals_for: Analiz edilen takimin attigi gol.
        goals_against: Analiz edilen takimin yedigi gol.

    Returns:
        Iki takim da gol attiysa `True`.
    """
    return goals_for > 0 and goals_against > 0


def oran_hesapla(count: int, total: int) -> float:
    """
    Bolme hatalarini engelleyen oran hesaplayici.

    Args:
        count: Olumlu vaka sayisi.
        total: Toplam vaka sayisi.

    Returns:
        0-1 arasi oran.
    """
    if total == 0:
        return 0.0
    return count / total


def guven_seviyesi_uret(match_count: int) -> str:
    """
    Kullanilan mac sayisina gore guven seviyesi uretir.

    Args:
        match_count: Analize dahil edilen mac sayisi.

    Returns:
        `low`, `medium` veya `high`.
    """
    return confidence_from_match_count(match_count)["confidence"]


def takim_kg_var_raporu_uret(
    matches: list[dict[str, Any]], team_id: int | str, team_name: str | None = None
) -> dict[str, Any]:
    """
    Bir takim icin KG Var egilimi raporu uretir.

    Args:
        matches: Mac listesi.
        team_id: Analiz edilecek takim kimligi.
        team_name: Opsiyonel takim adi.

    Returns:
        KG Var oranlari, gol ortalamalari, skor ve guven seviyesi.
    """
    team_matches = takim_maclarini_filtrele(matches, team_id)
    last_matches = son_maclari_sec(team_matches, limit=5)
    team_results = [
        takim_acisindan_mac_sonucu(match, team_id) for match in last_matches
    ]

    match_count = len(team_results)
    btts_count = sum(
        1 for result in team_results if kg_var_mi(result.goals_for, result.goals_against)
    )
    goals_for = sum(result.goals_for for result in team_results)
    goals_against = sum(result.goals_against for result in team_results)
    goals_for_avg = goals_for / match_count if match_count else 0
    goals_against_avg = goals_against / match_count if match_count else 0

    home_results = [result for result in team_results if result.venue == "home"]
    away_results = [result for result in team_results if result.venue == "away"]

    home_btts_count = sum(
        1 for result in home_results if kg_var_mi(result.goals_for, result.goals_against)
    )
    away_btts_count = sum(
        1 for result in away_results if kg_var_mi(result.goals_for, result.goals_against)
    )

    last_5_btts_rate = oran_hesapla(btts_count, match_count)
    home_btts_rate = oran_hesapla(home_btts_count, len(home_results))
    away_btts_rate = oran_hesapla(away_btts_count, len(away_results))

    attack_signal = min(goals_for_avg / 1.5, 1.0)
    concede_signal = min(goals_against_avg / 1.5, 1.0)

    recent_btts_signal = 0
    if team_results:
        recent_btts_signal = (
            1 if kg_var_mi(team_results[0].goals_for, team_results[0].goals_against) else 0
        )

    score_parts = {
        "last_5_btts_score": round(last_5_btts_rate * 35, 2),
        "home_btts_score": round(home_btts_rate * 15, 2),
        "away_btts_score": round(away_btts_rate * 15, 2),
        "attack_score": round(attack_signal * 15, 2),
        "concede_score": round(concede_signal * 15, 2),
        "recent_btts_score": round(recent_btts_signal * 5, 2),
    }
    kg_var_score = sum(score_parts.values())

    inferred_team_name = team_name
    if inferred_team_name is None and last_matches:
        first_match = last_matches[0]
        inferred_team_name = (
            first_match.get("home_team_name")
            if first_match.get("home_team_id") == team_id
            else first_match.get("away_team_name")
        )

    return {
        "team_id": team_id,
        "team_name": inferred_team_name,
        "match_count": match_count,
        "btts_count": btts_count,
        "last_5_btts_rate": round(last_5_btts_rate, 2),
        "home_btts_rate": round(home_btts_rate, 2),
        "away_btts_rate": round(away_btts_rate, 2),
        "goals_for_avg": round(goals_for_avg, 2),
        "goals_against_avg": round(goals_against_avg, 2),
        "kg_var_score": round(kg_var_score, 2),
        "confidence": guven_seviyesi_uret(match_count),
        "score_parts": score_parts,
        "matches": [
            {
                "match_id": result.match_id,
                "utc_date": result.utc_date,
                "venue": result.venue,
                "opponent_id": result.opponent_id,
                "opponent_name": result.opponent_name,
                "goals_for": result.goals_for,
                "goals_against": result.goals_against,
                "kg_var": kg_var_mi(result.goals_for, result.goals_against),
            }
            for result in team_results
        ],
    }


def ortak_guven_seviyesi_uret(home_report: dict[str, Any], away_report: dict[str, Any]) -> str:
    """
    Iki takim raporundan ortak guven seviyesi uretir.

    Args:
        home_report: Ev sahibi takim KG Var raporu.
        away_report: Deplasman takim KG Var raporu.

    Returns:
        `low`, `medium` veya `high`.
    """
    levels = [home_report["confidence"], away_report["confidence"]]
    if "low" in levels:
        return "low"
    if "medium" in levels:
        return "medium"
    if "high" in levels:
        return "high"
    return "very_high"


def ortak_kg_var_egilimi_hesapla(
    matches: list[dict[str, Any]],
    home_team_id: int | str,
    away_team_id: int | str,
    home_team_name: str | None = None,
    away_team_name: str | None = None,
) -> dict[str, Any]:
    """
    Iki takim arasindaki ortak KG Var egilimini hesaplar.

    Args:
        matches: Mac listesi.
        home_team_id: Ev sahibi takim kimligi.
        away_team_id: Deplasman takim kimligi.
        home_team_name: Opsiyonel ev sahibi takim adi.
        away_team_name: Opsiyonel deplasman takim adi.

    Returns:
        Iki takimin ortak KG Var skoru ve gerekce bilesenleri.
    """
    home_report = takim_kg_var_raporu_uret(matches, home_team_id, home_team_name)
    away_report = takim_kg_var_raporu_uret(matches, away_team_id, away_team_name)

    team_average_score = (
        home_report["kg_var_score"] + away_report["kg_var_score"]
    ) / 2
    venue_rate_score = (
        home_report["home_btts_rate"] + away_report["away_btts_rate"]
    ) / 2 * 25
    scoring_balance_score = min(
        (
            home_report["goals_for_avg"]
            + away_report["goals_for_avg"]
            + home_report["goals_against_avg"]
            + away_report["goals_against_avg"]
        )
        / 6,
        1.0,
    ) * 25

    common_score = (team_average_score * 0.5) + venue_rate_score + scoring_balance_score
    common_score = max(0, min(100, common_score))

    return {
        "home_team": {
            "team_id": home_report["team_id"],
            "team_name": home_report["team_name"],
            "kg_var_score": home_report["kg_var_score"],
            "home_btts_rate": home_report["home_btts_rate"],
            "confidence": home_report["confidence"],
        },
        "away_team": {
            "team_id": away_report["team_id"],
            "team_name": away_report["team_name"],
            "kg_var_score": away_report["kg_var_score"],
            "away_btts_rate": away_report["away_btts_rate"],
            "confidence": away_report["confidence"],
        },
        "common_kg_var_score": round(common_score, 2),
        "confidence": ortak_guven_seviyesi_uret(home_report, away_report),
        "score_parts": {
            "team_average_score_part": round(team_average_score * 0.5, 2),
            "venue_rate_score_part": round(venue_rate_score, 2),
            "scoring_balance_score_part": round(scoring_balance_score, 2),
        },
    }


def tum_takimlar_kg_var_raporu_uret() -> list[dict[str, Any]]:
    """
    Yerel ornek veriden tum takimlar icin KG Var raporu uretir.

    Returns:
        Puan durumundaki tum takimlar icin KG Var raporu listesi.
    """
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    matches = son_mac_sonuclarini_listele(data)

    return [
        takim_kg_var_raporu_uret(
            matches,
            team_id=team["team_id"],
            team_name=team["team_name"],
        )
        for team in summary["teams"]
    ]


if __name__ == "__main__":
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    matches = son_mac_sonuclarini_listele(data)

    reports = tum_takimlar_kg_var_raporu_uret()
    active_reports = [report for report in reports if report["match_count"] > 0][:5]

    example_common = None
    if matches:
        first_match = matches[0]
        example_common = ortak_kg_var_egilimi_hesapla(
            matches,
            home_team_id=first_match["home_team_id"],
            away_team_id=first_match["away_team_id"],
            home_team_name=first_match["home_team_name"],
            away_team_name=first_match["away_team_name"],
        )

    print(
        json.dumps(
            {
                "team_reports": active_reports,
                "example_common_kg_var": example_common,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

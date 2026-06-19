"""
Futbol Laboratuvari V1 icin Ust/Alt Gol Motoru.

Bu modul takimlarin gol toplamlarina dayali Ust/Alt egilimini hesaplar.

Uretilen skorlar:

- UST_25_SCORE: 0-100
- ALT_25_SCORE: 0-100

Skor mantigi:

UST_25_SCORE:
- Ust 2.5 orani: 40 puan
- Ust 1.5 orani: 15 puan
- Ust 3.5 orani: 10 puan
- Son 5 mac gol ortalamasi: 20 puan
- Ev/deplasman gol ortalamasi: 10 puan
- Son mac Ust 2.5 sinyali: 5 puan

ALT_25_SCORE:
- Alt 2.5 orani: 45 puan
- Dusuk gol ortalamasi: 25 puan
- Ust 3.5 dusuklugu: 10 puan
- Ev/deplasman dusuk gol ortalamasi: 15 puan
- Son mac Alt 2.5 sinyali: 5 puan
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


def oran_hesapla(count: int, total: int) -> float:
    """Bolme hatalarini engelleyen oran hesaplayici."""
    if total == 0:
        return 0.0
    return count / total


def guven_seviyesi_uret(match_count: int) -> str:
    """
    Analize dahil edilen mac sayisina gore guven seviyesi uretir.
    """
    return confidence_from_match_count(match_count)["confidence"]


def gol_esigi_ustu_mu(total_goals: int, threshold: float) -> bool:
    """
    Toplam golun verilen ust esigini gecip gecmedigini hesaplar.

    Args:
        total_goals: Mactaki toplam gol.
        threshold: 0.5, 1.5, 2.5 veya 3.5 gibi esik.

    Returns:
        Toplam gol esikten buyukse `True`.
    """
    return total_goals > threshold


def venue_gol_ortalamasi_hesapla(team_results: list[Any], venue: str) -> dict[str, Any]:
    """
    Ev sahibi veya deplasman maclarinda toplam gol ortalamasini hesaplar.

    Args:
        team_results: Takim acisindan mac sonuc listesi.
        venue: `home` veya `away`.

    Returns:
        Mac sayisi ve toplam gol ortalamasi.
    """
    venue_results = [result for result in team_results if result.venue == venue]
    match_count = len(venue_results)
    total_goals = sum(
        result.goals_for + result.goals_against for result in venue_results
    )
    return {
        "matches": match_count,
        "total_goals_avg": round(total_goals / match_count, 2) if match_count else 0,
    }


def ust_alt_skorlari_hesapla(
    over_15_rate: float,
    over_25_rate: float,
    over_35_rate: float,
    under_25_rate: float,
    total_goals_avg: float,
    venue_total_goals_avg: float,
    last_match_total_goals: int | None,
) -> dict[str, Any]:
    """
    UST_25_SCORE ve ALT_25_SCORE bilesenlerini hesaplar.

    Args:
        over_15_rate: Ust 1.5 orani.
        over_25_rate: Ust 2.5 orani.
        over_35_rate: Ust 3.5 orani.
        under_25_rate: Alt 2.5 orani.
        total_goals_avg: Son maclar toplam gol ortalamasi.
        venue_total_goals_avg: Ev/deplasman toplam gol ortalamasi.
        last_match_total_goals: Son mactaki toplam gol.

    Returns:
        Ust/Alt skorlarini ve bilesenlerini iceren sozluk.
    """
    goal_avg_signal = min(total_goals_avg / 3.5, 1.0)
    venue_goal_signal = min(venue_total_goals_avg / 3.5, 1.0)
    low_goal_signal = max(0, 1 - (total_goals_avg / 3.5))
    venue_low_goal_signal = max(0, 1 - (venue_total_goals_avg / 3.5))

    last_over_25_signal = (
        1 if last_match_total_goals is not None and last_match_total_goals > 2.5 else 0
    )
    last_under_25_signal = (
        1 if last_match_total_goals is not None and last_match_total_goals <= 2.5 else 0
    )

    ust_parts = {
        "over_25_rate_score": round(over_25_rate * 40, 2),
        "over_15_rate_score": round(over_15_rate * 15, 2),
        "over_35_rate_score": round(over_35_rate * 10, 2),
        "goal_avg_score": round(goal_avg_signal * 20, 2),
        "venue_goal_avg_score": round(venue_goal_signal * 10, 2),
        "last_match_over_25_score": round(last_over_25_signal * 5, 2),
    }

    alt_parts = {
        "under_25_rate_score": round(under_25_rate * 45, 2),
        "low_goal_avg_score": round(low_goal_signal * 25, 2),
        "low_over_35_score": round((1 - over_35_rate) * 10, 2),
        "venue_low_goal_avg_score": round(venue_low_goal_signal * 15, 2),
        "last_match_under_25_score": round(last_under_25_signal * 5, 2),
    }

    return {
        "UST_25_SCORE": round(max(0, min(100, sum(ust_parts.values()))), 2),
        "ALT_25_SCORE": round(max(0, min(100, sum(alt_parts.values()))), 2),
        "score_parts": {
            "ust_25": ust_parts,
            "alt_25": alt_parts,
        },
    }


def takim_ust_alt_raporu_uret(
    matches: list[dict[str, Any]], team_id: int | str, team_name: str | None = None
) -> dict[str, Any]:
    """
    Bir takim icin Ust/Alt gol egilimi raporu uretir.

    Args:
        matches: Mac listesi.
        team_id: Analiz edilecek takim kimligi.
        team_name: Opsiyonel takim adi.

    Returns:
        Ust/Alt oranlari, gol ortalamalari, x_goal_score ve guven seviyesi.
    """
    team_matches = takim_maclarini_filtrele(matches, team_id)
    last_matches = son_maclari_sec(team_matches, limit=5)
    team_results = [
        takim_acisindan_mac_sonucu(match, team_id) for match in last_matches
    ]

    match_count = len(team_results)
    total_goals_list = [
        result.goals_for + result.goals_against for result in team_results
    ]

    over_05_count = sum(1 for goals in total_goals_list if gol_esigi_ustu_mu(goals, 0.5))
    over_15_count = sum(1 for goals in total_goals_list if gol_esigi_ustu_mu(goals, 1.5))
    over_25_count = sum(1 for goals in total_goals_list if gol_esigi_ustu_mu(goals, 2.5))
    over_35_count = sum(1 for goals in total_goals_list if gol_esigi_ustu_mu(goals, 3.5))
    under_25_count = sum(1 for goals in total_goals_list if goals <= 2.5)

    total_goals_avg = (
        sum(total_goals_list) / match_count if match_count else 0
    )
    home_goal_info = venue_gol_ortalamasi_hesapla(team_results, "home")
    away_goal_info = venue_gol_ortalamasi_hesapla(team_results, "away")
    venue_averages = [
        info["total_goals_avg"]
        for info in (home_goal_info, away_goal_info)
        if info["matches"] > 0
    ]
    venue_total_goals_avg = (
        sum(venue_averages) / len(venue_averages) if venue_averages else 0
    )

    over_15_rate = oran_hesapla(over_15_count, match_count)
    over_25_rate = oran_hesapla(over_25_count, match_count)
    over_35_rate = oran_hesapla(over_35_count, match_count)
    under_25_rate = oran_hesapla(under_25_count, match_count)

    score_info = ust_alt_skorlari_hesapla(
        over_15_rate=over_15_rate,
        over_25_rate=over_25_rate,
        over_35_rate=over_35_rate,
        under_25_rate=under_25_rate,
        total_goals_avg=total_goals_avg,
        venue_total_goals_avg=venue_total_goals_avg,
        last_match_total_goals=total_goals_list[0] if total_goals_list else None,
    )

    x_goal_score = min(total_goals_avg / 4.0, 1.0) * 100

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
        "over_05_rate": round(oran_hesapla(over_05_count, match_count), 2),
        "over_15_rate": round(over_15_rate, 2),
        "over_25_rate": round(over_25_rate, 2),
        "over_35_rate": round(over_35_rate, 2),
        "under_25_rate": round(under_25_rate, 2),
        "last_5_total_goals_avg": round(total_goals_avg, 2),
        "home_total_goals_avg": home_goal_info["total_goals_avg"],
        "away_total_goals_avg": away_goal_info["total_goals_avg"],
        "x_goal_score": round(x_goal_score, 2),
        "UST_25_SCORE": score_info["UST_25_SCORE"],
        "ALT_25_SCORE": score_info["ALT_25_SCORE"],
        "confidence": guven_seviyesi_uret(match_count),
        "score_parts": score_info["score_parts"],
        "matches": [
            {
                "match_id": result.match_id,
                "utc_date": result.utc_date,
                "venue": result.venue,
                "opponent_id": result.opponent_id,
                "opponent_name": result.opponent_name,
                "goals_for": result.goals_for,
                "goals_against": result.goals_against,
                "total_goals": result.goals_for + result.goals_against,
                "over_25": result.goals_for + result.goals_against > 2.5,
            }
            for result in team_results
        ],
    }


def ortak_ust_alt_egilimi_hesapla(
    matches: list[dict[str, Any]],
    home_team_id: int | str,
    away_team_id: int | str,
    home_team_name: str | None = None,
    away_team_name: str | None = None,
) -> dict[str, Any]:
    """
    Iki takim icin ortak Ust/Alt 2.5 egilimini hesaplar.

    Args:
        matches: Mac listesi.
        home_team_id: Ev sahibi takim kimligi.
        away_team_id: Deplasman takim kimligi.
        home_team_name: Opsiyonel ev sahibi takim adi.
        away_team_name: Opsiyonel deplasman takim adi.

    Returns:
        Ortak UST_25_SCORE, ALT_25_SCORE ve guven seviyesi.
    """
    home_report = takim_ust_alt_raporu_uret(matches, home_team_id, home_team_name)
    away_report = takim_ust_alt_raporu_uret(matches, away_team_id, away_team_name)

    common_ust_25_score = (
        home_report["UST_25_SCORE"] * 0.35
        + away_report["UST_25_SCORE"] * 0.35
        + min((home_report["x_goal_score"] + away_report["x_goal_score"]) / 2, 100)
        * 0.30
    )
    common_alt_25_score = (
        home_report["ALT_25_SCORE"] * 0.4
        + away_report["ALT_25_SCORE"] * 0.4
        + (100 - min((home_report["x_goal_score"] + away_report["x_goal_score"]) / 2, 100))
        * 0.20
    )

    confidence = "very_high"
    if "low" in (home_report["confidence"], away_report["confidence"]):
        confidence = "low"
    elif "medium" in (home_report["confidence"], away_report["confidence"]):
        confidence = "medium"
    elif "high" in (home_report["confidence"], away_report["confidence"]):
        confidence = "high"

    return {
        "home_team": {
            "team_id": home_team_id,
            "team_name": home_team_name,
            "UST_25_SCORE": home_report["UST_25_SCORE"],
            "ALT_25_SCORE": home_report["ALT_25_SCORE"],
            "x_goal_score": home_report["x_goal_score"],
            "confidence": home_report["confidence"],
        },
        "away_team": {
            "team_id": away_team_id,
            "team_name": away_team_name,
            "UST_25_SCORE": away_report["UST_25_SCORE"],
            "ALT_25_SCORE": away_report["ALT_25_SCORE"],
            "x_goal_score": away_report["x_goal_score"],
            "confidence": away_report["confidence"],
        },
        "ORTAK_UST_25_SCORE": round(max(0, min(100, common_ust_25_score)), 2),
        "ORTAK_ALT_25_SCORE": round(max(0, min(100, common_alt_25_score)), 2),
        "confidence": confidence,
    }


def tum_takimlar_ust_alt_raporu_uret() -> list[dict[str, Any]]:
    """
    Yerel ornek veriden tum takimlar icin Ust/Alt raporu uretir.
    """
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    matches = son_mac_sonuclarini_listele(data)

    return [
        takim_ust_alt_raporu_uret(
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
    reports = tum_takimlar_ust_alt_raporu_uret()
    active_reports = [report for report in reports if report["match_count"] > 0][:5]

    example_common = None
    if matches:
        first_match = matches[0]
        example_common = ortak_ust_alt_egilimi_hesapla(
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
                "example_common_over_under": example_common,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

"""
Futbol Laboratuvari V1 Faz 2 takim gucu motoru.

Bu modul mevcut form, KG Var ve Ust/Alt motorlarinin ciktilarini kullanarak
takim bazli guc raporu uretir.

Uretilen ana alanlar:

- Son 5 mac form puani
- Ic saha performansi
- Dis saha performansi
- Gol atma gucu
- Gol yeme riski
- KG potansiyeli
- TEAM_POWER_SCORE
"""

from __future__ import annotations

import json
from typing import Any

try:
    from confidence_motoru import confidence_birlestir, confidence_from_match_count
    from form_puani_motoru import takim_form_raporu_uret
    from kg_var_motoru import takim_kg_var_raporu_uret
    from ust_alt_motoru import takim_ust_alt_raporu_uret
    from veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret
except ImportError:
    from src.confidence_motoru import confidence_birlestir, confidence_from_match_count
    from src.form_puani_motoru import takim_form_raporu_uret
    from src.kg_var_motoru import takim_kg_var_raporu_uret
    from src.ust_alt_motoru import takim_ust_alt_raporu_uret
    from src.veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret


DEFAULT_TEAM_POWER_WEIGHTS = {
    "form": 0.30,
    "attack": 0.25,
    "venue": 0.20,
    "kg_potential": 0.15,
    "defense_stability": 0.10,
}


def skoru_sinirla(value: float) -> float:
    """0-100 arasi guvenli skor doner."""
    return round(max(0, min(100, value)), 2)


def puan_ortalamasini_skorla(points_per_match: float) -> float:
    """
    Mac basi puani 0-100 arasi performans skoruna cevirir.

    3.00 puan/mac tam puan, 0.00 puan/mac sifir puan kabul edilir.
    """
    return skoru_sinirla((points_per_match / 3) * 100)


def venue_performans_skoru_uret(form_report: dict[str, Any]) -> dict[str, Any]:
    """
    Ic saha ve dis saha performans skorlarini form raporundan uretir.
    """
    home = form_report["home_performance"]
    away = form_report["away_performance"]
    home_score = puan_ortalamasini_skorla(float(home.get("points_per_match", 0)))
    away_score = puan_ortalamasini_skorla(float(away.get("points_per_match", 0)))

    available_scores = []
    if home.get("matches", 0) > 0:
        available_scores.append(home_score)
    if away.get("matches", 0) > 0:
        available_scores.append(away_score)

    average_score = (
        sum(available_scores) / len(available_scores)
        if available_scores
        else 0
    )

    return {
        "home_score": home_score,
        "away_score": away_score,
        "average_venue_score": skoru_sinirla(average_score),
        "home_matches": home.get("matches", 0),
        "away_matches": away.get("matches", 0),
    }


def gol_atma_gucu_hesapla(goals_for_avg: float) -> float:
    """
    Mac basi atilan gol ortalamasini hucum gucune cevirir.

    2.50 gol/mac ve ustu tam hucum sinyali kabul edilir.
    """
    return skoru_sinirla((goals_for_avg / 2.5) * 100)


def gol_yeme_riski_hesapla(goals_against_avg: float) -> float:
    """
    Mac basi yenilen gol ortalamasini risk skoruna cevirir.

    2.50 gol/mac ve ustu maksimum savunma zafiyeti kabul edilir.
    """
    return skoru_sinirla((goals_against_avg / 2.5) * 100)


def takim_gucu_skoru_hesapla(
    form_score: float,
    attack_power: float,
    venue_score: float,
    kg_potential: float,
    defense_weakness: float,
    weights: dict[str, float] | None = None,
) -> dict[str, Any]:
    """
    Takim guc skorunu hesaplar.

    Varsayilan agirliklar:
    - Form: %30
    - Hucum gucu: %25
    - Ic/dis saha performansi: %20
    - KG potansiyeli: %15
    - Savunma istikrari: %10

    Savunma icin dusuk gol yeme riski olumlu oldugundan bu bilesen
    `100 - defense_weakness` olarak hesaba katilir.
    """
    active_weights = weights or DEFAULT_TEAM_POWER_WEIGHTS
    defense_stability = 100 - defense_weakness
    values = {
        "form": form_score,
        "attack": attack_power,
        "venue": venue_score,
        "kg_potential": kg_potential,
        "defense_stability": defense_stability,
    }
    total_weight = sum(active_weights.values()) or 1
    score = sum(values[key] * active_weights[key] for key in active_weights) / total_weight

    return {
        "TEAM_POWER_SCORE": skoru_sinirla(score),
        "score_parts": {
            "form": round(form_score, 2),
            "attack": round(attack_power, 2),
            "venue": round(venue_score, 2),
            "kg_potential": round(kg_potential, 2),
            "defense_stability": round(defense_stability, 2),
            "defense_weakness": round(defense_weakness, 2),
        },
        "weights": active_weights,
    }


def takim_gucu_raporu_uret(
    matches: list[dict[str, Any]],
    team_id: int | str,
    team_name: str | None = None,
) -> dict[str, Any]:
    """
    Bir takim icin Faz 2 takim gucu raporu uretir.
    """
    form_report = takim_form_raporu_uret(matches, team_id, team_name)
    kg_report = takim_kg_var_raporu_uret(matches, team_id, team_name)
    ust_alt_report = takim_ust_alt_raporu_uret(matches, team_id, team_name)

    goals_for_avg = float(form_report.get("goals_for_avg", 0))
    goals_against_avg = float(form_report.get("goals_against_avg", 0))
    attack_power = gol_atma_gucu_hesapla(goals_for_avg)
    defense_weakness = gol_yeme_riski_hesapla(goals_against_avg)
    venue_scores = venue_performans_skoru_uret(form_report)
    kg_potential = float(kg_report.get("kg_var_score", 0))

    power = takim_gucu_skoru_hesapla(
        form_score=float(form_report.get("form_score", 0)),
        attack_power=attack_power,
        venue_score=venue_scores["average_venue_score"],
        kg_potential=kg_potential,
        defense_weakness=defense_weakness,
    )
    form_confidence = confidence_from_match_count(int(form_report.get("match_count", 0)))
    kg_confidence = confidence_from_match_count(int(kg_report.get("match_count", 0)))
    ust_alt_confidence = confidence_from_match_count(int(ust_alt_report.get("match_count", 0)))
    confidence_info = confidence_birlestir(
        [
            {
                "name": "form_data_quality",
                "score": form_confidence["confidence_score"],
                "weight": 0.40,
            },
            {
                "name": "kg_data_quality",
                "score": kg_confidence["confidence_score"],
                "weight": 0.30,
            },
            {
                "name": "ust_alt_data_quality",
                "score": ust_alt_confidence["confidence_score"],
                "weight": 0.30,
            },
        ]
    )

    return {
        "team_id": team_id,
        "team_name": form_report.get("team_name") or team_name,
        "match_count": form_report.get("match_count", 0),
        "form_score": form_report.get("form_score", 0),
        "home_performance": form_report["home_performance"],
        "away_performance": form_report["away_performance"],
        "home_performance_score": venue_scores["home_score"],
        "away_performance_score": venue_scores["away_score"],
        "venue_performance_score": venue_scores["average_venue_score"],
        "goals_for_avg": form_report.get("goals_for_avg", 0),
        "goals_against_avg": form_report.get("goals_against_avg", 0),
        "goal_scoring_power": attack_power,
        "goal_conceding_risk": defense_weakness,
        "attack_power": attack_power,
        "defense_weakness": defense_weakness,
        "kg_potential": round(kg_potential, 2),
        "over_25_signal": ust_alt_report.get("UST_25_SCORE", 0),
        "TEAM_POWER_SCORE": power["TEAM_POWER_SCORE"],
        "confidence": confidence_info["confidence"],
        "confidence_score": confidence_info["confidence_score"],
        "confidence_details": confidence_info,
        "score_parts": power["score_parts"],
        "weights": power["weights"],
        "engine_details": {
            "form": form_report,
            "kg_var": kg_report,
            "ust_alt": ust_alt_report,
        },
    }


def yerel_ornek_takim_gucu_raporu_uret() -> list[dict[str, Any]]:
    """Yerel ornek veriden maci olan ilk takimlar icin takim gucu raporu uretir."""
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    matches = son_mac_sonuclarini_listele(data)
    reports = [
        takim_gucu_raporu_uret(matches, team["team_id"], team["team_name"])
        for team in summary["teams"]
    ]
    return [report for report in reports if report["match_count"] > 0]


if __name__ == "__main__":
    print(json.dumps(yerel_ornek_takim_gucu_raporu_uret(), ensure_ascii=False, indent=2))

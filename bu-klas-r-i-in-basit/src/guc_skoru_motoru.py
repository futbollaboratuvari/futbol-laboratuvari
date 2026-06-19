"""
Futbol Laboratuvari V1 Faz 2 guc skoru motoru.

Bu modul takim gucu, lig gucu, KG Var ve Ust/Alt motorlarini birlestirerek
mac bazli guc skoru ve olasilik sinyalleri uretir.

GUC_SKORU bilesenleri:

- Form
- Lig gucu
- Hucum gucu
- Savunma zafiyeti
- KG potansiyeli
"""

from __future__ import annotations

import json
from typing import Any

try:
    from confidence_motoru import mac_confidence_uret
    from kg_var_motoru import ortak_kg_var_egilimi_hesapla
    from lig_gucu_motoru import lig_gucu_raporu_uret
    from takim_gucu_motoru import takim_gucu_raporu_uret
    from ust_alt_motoru import ortak_ust_alt_egilimi_hesapla
    from veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret
except ImportError:
    from src.confidence_motoru import mac_confidence_uret
    from src.kg_var_motoru import ortak_kg_var_egilimi_hesapla
    from src.lig_gucu_motoru import lig_gucu_raporu_uret
    from src.takim_gucu_motoru import takim_gucu_raporu_uret
    from src.ust_alt_motoru import ortak_ust_alt_egilimi_hesapla
    from src.veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret


DEFAULT_GUC_SKORU_WEIGHTS = {
    "form": 0.25,
    "league_power": 0.20,
    "attack_power": 0.20,
    "defense_weakness": 0.15,
    "kg_potential": 0.20,
}


def skoru_sinirla(value: float) -> float:
    """0-100 arasi guvenli skor doner."""
    return round(max(0, min(100, value)), 2)


def ortalama(values: list[float]) -> float:
    """Bos listeye karsi guvenli ortalama hesaplar."""
    if not values:
        return 0.0
    return sum(values) / len(values)


def guc_skoru_hesapla(
    form: float,
    league_power: float,
    attack_power: float,
    defense_weakness: float,
    kg_potential: float,
    weights: dict[str, float] | None = None,
) -> dict[str, Any]:
    """
    Mac guc skorunu agirlikli ortalama ile hesaplar.

    Varsayilan agirliklar:
    - Form: %25
    - Lig gucu: %20
    - Hucum gucu: %20
    - Savunma zafiyeti: %15
    - KG potansiyeli: %20

    Savunma zafiyeti burada macin gol/market uretme potansiyelini artiran
    risk sinyali olarak pozitif bilesendir.
    """
    active_weights = weights or DEFAULT_GUC_SKORU_WEIGHTS
    values = {
        "form": form,
        "league_power": league_power,
        "attack_power": attack_power,
        "defense_weakness": defense_weakness,
        "kg_potential": kg_potential,
    }
    total_weight = sum(active_weights.values()) or 1
    score = sum(values[key] * active_weights[key] for key in active_weights) / total_weight

    return {
        "GUC_SKORU": skoru_sinirla(score),
        "score_parts": {key: round(value, 2) for key, value in values.items()},
        "weights": active_weights,
    }


def mac_guc_skoru_uret(
    matches: list[dict[str, Any]],
    home_team_id: int | str,
    away_team_id: int | str,
    home_team_name: str | None = None,
    away_team_name: str | None = None,
    competition_code: str | None = None,
    competition_name: str | None = None,
) -> dict[str, Any]:
    """
    Iki takim icin Faz 2 mac guc skoru ve olasilik sinyalleri uretir.
    """
    home_team_power = takim_gucu_raporu_uret(matches, home_team_id, home_team_name)
    away_team_power = takim_gucu_raporu_uret(matches, away_team_id, away_team_name)
    league_power = lig_gucu_raporu_uret(matches, competition_code, competition_name)
    kg_report = ortak_kg_var_egilimi_hesapla(
        matches,
        home_team_id,
        away_team_id,
        home_team_name,
        away_team_name,
    )
    over_under_report = ortak_ust_alt_egilimi_hesapla(
        matches,
        home_team_id,
        away_team_id,
        home_team_name,
        away_team_name,
    )

    form = ortalama(
        [
            float(home_team_power.get("form_score", 0)),
            float(away_team_power.get("form_score", 0)),
        ]
    )
    league_power_score = ortalama(
        [
            float(league_power.get("LIG_GOAL_POWER", 0)),
            float(league_power.get("LIG_KG_POWER", 0)),
        ]
    )
    attack_power = ortalama(
        [
            float(home_team_power.get("attack_power", 0)),
            float(away_team_power.get("attack_power", 0)),
        ]
    )
    defense_weakness = ortalama(
        [
            float(home_team_power.get("defense_weakness", 0)),
            float(away_team_power.get("defense_weakness", 0)),
        ]
    )
    kg_potential = float(kg_report.get("common_kg_var_score", 0))

    score = guc_skoru_hesapla(
        form=form,
        league_power=league_power_score,
        attack_power=attack_power,
        defense_weakness=defense_weakness,
        kg_potential=kg_potential,
    )

    confidence_info = mac_confidence_uret(
        home_match_count=int(home_team_power.get("match_count", 0)),
        away_match_count=int(away_team_power.get("match_count", 0)),
        league_match_count=int(league_power.get("match_count", 0)),
        market_match_count=min(
            int(home_team_power.get("match_count", 0)),
            int(away_team_power.get("match_count", 0)),
        ),
        half_time_data_count=int(league_power.get("half_time_data_count", 0)),
        half_time_required=False,
    )

    return {
        "match": {
            "competition_code": competition_code,
            "competition_name": competition_name,
            "home_team_id": home_team_id,
            "home_team_name": home_team_name,
            "away_team_id": away_team_id,
            "away_team_name": away_team_name,
        },
        "GUC_SKORU": score["GUC_SKORU"],
        "confidence": confidence_info["confidence"],
        "confidence_score": confidence_info["confidence_score"],
        "confidence_details": confidence_info,
        "KG_VAR_OLASILIGI": skoru_sinirla(kg_potential),
        "UST_25_OLASILIGI": skoru_sinirla(
            float(over_under_report.get("ORTAK_UST_25_SCORE", 0))
        ),
        "score_parts": score["score_parts"],
        "weights": score["weights"],
        "engine_details": {
            "home_team_power": home_team_power,
            "away_team_power": away_team_power,
            "league_power": league_power,
            "kg_var": kg_report,
            "ust_alt": over_under_report,
        },
    }


def yerel_ornek_mac_guc_skoru_uret() -> dict[str, Any]:
    """Yerel ornek verideki ilk mac icin Faz 2 guc skoru uretir."""
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    matches = son_mac_sonuclarini_listele(data)
    if not matches:
        return {"error": "Ornek veri icinde mac bulunamadi.", "confidence": "low"}

    first_match = matches[0]
    return mac_guc_skoru_uret(
        matches,
        home_team_id=first_match["home_team_id"],
        away_team_id=first_match["away_team_id"],
        home_team_name=first_match["home_team_name"],
        away_team_name=first_match["away_team_name"],
        competition_code=summary["league"]["competition_code"],
        competition_name=summary["league"]["competition_name"],
    )


if __name__ == "__main__":
    print(json.dumps(yerel_ornek_mac_guc_skoru_uret(), ensure_ascii=False, indent=2))

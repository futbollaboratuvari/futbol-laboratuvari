"""
Futbol Laboratuvari V1 merkezi confidence motoru.

Bu modul Faz 2 sonrasi tum analiz katmanlari icin sayisal guven skoru ve
okunabilir guven seviyesi uretir.

Seviyeler:

- low: 0-39
- medium: 40-64
- high: 65-84
- very_high: 85-100
"""

from __future__ import annotations

from typing import Any


CONFIDENCE_LEVELS = {
    "low": {"min": 0, "max": 39},
    "medium": {"min": 40, "max": 64},
    "high": {"min": 65, "max": 84},
    "very_high": {"min": 85, "max": 100},
}


def skoru_sinirla(value: float) -> float:
    """0-100 arasi guvenli skor doner."""
    return round(max(0, min(100, value)), 2)


def confidence_level_uret(score: float) -> str:
    """Sayisal confidence skorunu seviyeye cevirir."""
    safe_score = skoru_sinirla(score)
    if safe_score >= 85:
        return "very_high"
    if safe_score >= 65:
        return "high"
    if safe_score >= 40:
        return "medium"
    return "low"


def match_count_score_uret(match_count: int, full_confidence_count: int = 20) -> float:
    """
    Mac sayisini 0-100 veri kalitesi skoruna cevirir.

    20 mac ve uzeri tam veri kalitesi kabul edilir. 16+ mac genellikle `high`
    araligina girer, 20+ mac ise `very_high` araligina yaklasir.
    """
    if match_count <= 0:
        return 0.0
    return skoru_sinirla((match_count / full_confidence_count) * 100)


def confidence_from_match_count(
    match_count: int,
    full_confidence_count: int = 20,
) -> dict[str, Any]:
    """
    Sadece mac sayisina dayali confidence bilgisi uretir.
    """
    score = match_count_score_uret(match_count, full_confidence_count)
    return {
        "confidence": confidence_level_uret(score),
        "confidence_score": score,
        "match_count": match_count,
        "full_confidence_count": full_confidence_count,
    }


def confidence_birlestir(
    components: list[dict[str, Any]],
    weights: dict[str, float] | None = None,
) -> dict[str, Any]:
    """
    Bilesen bazli confidence skorlarini agirlikli tek skora indirger.

    Her bilesen su alanlari tasiyabilir:
    - name
    - score veya confidence_score
    - weight
    - level veya confidence
    """
    if not components:
        return {
            "confidence": "low",
            "confidence_score": 0.0,
            "components": [],
        }

    total_weight = 0.0
    weighted_score = 0.0
    normalized_components = []

    for component in components:
        name = str(component.get("name") or "")
        score = float(component.get("score", component.get("confidence_score", 0)) or 0)
        weight = float(
            component.get(
                "weight",
                (weights or {}).get(name, 1.0),
            )
        )
        safe_score = skoru_sinirla(score)
        total_weight += weight
        weighted_score += safe_score * weight
        normalized_components.append(
            {
                "name": name,
                "score": safe_score,
                "weight": weight,
                "level": component.get("level")
                or component.get("confidence")
                or confidence_level_uret(safe_score),
            }
        )

    final_score = weighted_score / total_weight if total_weight else 0.0
    final_score = skoru_sinirla(final_score)

    return {
        "confidence": confidence_level_uret(final_score),
        "confidence_score": final_score,
        "components": normalized_components,
    }


def mac_confidence_uret(
    home_match_count: int,
    away_match_count: int,
    league_match_count: int,
    market_match_count: int | None = None,
    half_time_data_count: int = 0,
    half_time_required: bool = False,
) -> dict[str, Any]:
    """
    Mac bazli sayisal confidence hesaplar.

    Varsayilan agirliklar:
    - Takim veri kalitesi: %40
    - Lig veri kalitesi: %25
    - Market veri kalitesi: %25
    - Devre veri kalitesi: %10

    Devre verisi zorunlu degilse devre bileseni 100 kabul edilir; boylece
    eksik devre skoru genel KG/UST analizini gereksiz cezalandirmaz.
    """
    team_score = (
        match_count_score_uret(home_match_count)
        + match_count_score_uret(away_match_count)
    ) / 2
    league_score = match_count_score_uret(league_match_count)
    market_count = market_match_count if market_match_count is not None else min(
        home_match_count,
        away_match_count,
    )
    market_score = match_count_score_uret(market_count)
    half_time_score = (
        match_count_score_uret(half_time_data_count)
        if half_time_required
        else 100.0
    )

    return confidence_birlestir(
        [
            {"name": "team_data_quality", "score": team_score, "weight": 0.40},
            {"name": "league_data_quality", "score": league_score, "weight": 0.25},
            {"name": "market_data_quality", "score": market_score, "weight": 0.25},
            {"name": "half_time_data_quality", "score": half_time_score, "weight": 0.10},
        ]
    )

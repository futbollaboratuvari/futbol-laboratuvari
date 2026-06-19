"""
Futbol Laboratuvari V1 icin Lig Gucu Motoru.

Bu modul liglerin gol uretkenligini ve KG Var egilimini olcer.

Uretilen skorlar:

- LIG_GOAL_POWER: 0-100
- LIG_KG_POWER: 0-100

Bu modul ileride form, KG Var, Ust/Alt ve kupon motorlari icin lig baglami
uretecek ortak katman olarak kullanilacaktir.
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


def oran_hesapla(count: int, total: int) -> float:
    """Bolme hatalarini engelleyen oran hesaplayici."""
    if total == 0:
        return 0.0
    return count / total


def ilk_dolu_degeri_al(data: dict[str, Any], keys: tuple[str, ...]) -> Any:
    """Verilen anahtarlar icinden ilk dolu degeri doner."""
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return None


def mac_toplam_gol(match: dict[str, Any]) -> int:
    """
    Bir mactaki toplam gol sayisini hesaplar.

    Args:
        match: Mac verisi.

    Returns:
        Ev sahibi ve deplasman gollerinin toplami.
    """
    return int(match.get("home_goals") or 0) + int(match.get("away_goals") or 0)


def mac_kg_var_mi(match: dict[str, Any]) -> bool:
    """
    Bir macta iki takimin da gol atip atmadigini hesaplar.
    """
    return int(match.get("home_goals") or 0) > 0 and int(match.get("away_goals") or 0) > 0


def mac_devre_golleri(match: dict[str, Any]) -> dict[str, int] | None:
    """
    Mac icin ilk yari ve ikinci yari toplam gollerini hesaplar.

    Args:
        match: Mac verisi.

    Returns:
        Devre skorlari mevcutsa `first_half_goals` ve `second_half_goals`
        alanlarini iceren sozluk; eksikse `None`.
    """
    ht_home = ilk_dolu_degeri_al(match, HALF_TIME_HOME_KEYS)
    ht_away = ilk_dolu_degeri_al(match, HALF_TIME_AWAY_KEYS)

    if ht_home is None or ht_away is None:
        return None

    full_time_total = mac_toplam_gol(match)
    first_half_total = int(ht_home) + int(ht_away)
    second_half_total = full_time_total - first_half_total

    return {
        "first_half_goals": first_half_total,
        "second_half_goals": second_half_total,
    }


def lig_goal_power_hesapla(
    average_goals: float,
    over_25_rate: float,
    over_35_rate: float,
    first_half_goals_avg: float | None,
    second_half_goals_avg: float | None,
) -> dict[str, Any]:
    """
    Lig gol uretkenligi icin 0-100 arasi skor hesaplar.

    Formul:
    - Ortalama gol: 45 puan
    - Ust 2.5 orani: 25 puan
    - Ust 3.5 orani: 15 puan
    - Devre gol dengesi: 15 puan

    Devre verisi yoksa devre bileseni 0 kabul edilir ve notlarda belirtilir.
    """
    average_goal_score = min(average_goals / 3.5, 1.0) * 45
    over_25_score = over_25_rate * 25
    over_35_score = over_35_rate * 15

    half_score = 0.0
    if first_half_goals_avg is not None and second_half_goals_avg is not None:
        half_total_avg = first_half_goals_avg + second_half_goals_avg
        half_score = min(half_total_avg / 3.5, 1.0) * 15

    parts = {
        "average_goal_score": round(average_goal_score, 2),
        "over_25_score": round(over_25_score, 2),
        "over_35_score": round(over_35_score, 2),
        "half_goal_score": round(half_score, 2),
    }

    return {
        "score": round(max(0, min(100, sum(parts.values()))), 2),
        "score_parts": parts,
    }


def lig_kg_power_hesapla(
    btts_rate: float,
    average_goals: float,
    over_25_rate: float,
    over_35_rate: float,
) -> dict[str, Any]:
    """
    Lig KG Var egilimi icin 0-100 arasi skor hesaplar.

    Formul:
    - KG Var orani: 55 puan
    - Ortalama gol: 20 puan
    - Ust 2.5 orani: 15 puan
    - Ust 3.5 orani: 10 puan
    """
    btts_score = btts_rate * 55
    average_goal_score = min(average_goals / 3.5, 1.0) * 20
    over_25_score = over_25_rate * 15
    over_35_score = over_35_rate * 10

    parts = {
        "btts_score": round(btts_score, 2),
        "average_goal_score": round(average_goal_score, 2),
        "over_25_score": round(over_25_score, 2),
        "over_35_score": round(over_35_score, 2),
    }

    return {
        "score": round(max(0, min(100, sum(parts.values()))), 2),
        "score_parts": parts,
    }


def guven_seviyesi_uret(match_count: int) -> str:
    """
    Lig analizindeki mac sayisina gore guven seviyesi uretir.
    """
    return confidence_from_match_count(match_count)["confidence"]


def lig_gucu_raporu_uret(
    matches: list[dict[str, Any]],
    competition_code: str | None = None,
    competition_name: str | None = None,
) -> dict[str, Any]:
    """
    Bir lig icin gol uretkenligi ve KG Var gucu raporu uretir.

    Args:
        matches: Lig maclari.
        competition_code: Opsiyonel lig kodu.
        competition_name: Opsiyonel lig adi.

    Returns:
        Ortalama gol, KG Var orani, Ust oranlari, devre ortalamalari ve lig
        guc skorlarini iceren rapor.
    """
    finished_matches = [
        match for match in matches if match.get("status") == "FINISHED"
    ]
    match_count = len(finished_matches)
    total_goals_list = [mac_toplam_gol(match) for match in finished_matches]

    average_goals = sum(total_goals_list) / match_count if match_count else 0
    btts_count = sum(1 for match in finished_matches if mac_kg_var_mi(match))
    over_25_count = sum(1 for goals in total_goals_list if goals > 2.5)
    over_35_count = sum(1 for goals in total_goals_list if goals > 3.5)
    home_win_count = sum(
        1
        for match in finished_matches
        if int(match.get("home_goals") or 0) > int(match.get("away_goals") or 0)
    )
    away_win_count = sum(
        1
        for match in finished_matches
        if int(match.get("away_goals") or 0) > int(match.get("home_goals") or 0)
    )
    draw_count = match_count - home_win_count - away_win_count

    half_goal_rows = [
        row for row in (mac_devre_golleri(match) for match in finished_matches)
        if row is not None
    ]
    half_data_count = len(half_goal_rows)
    missing_half_data_count = match_count - half_data_count

    first_half_goals_avg = None
    second_half_goals_avg = None
    if half_data_count:
        first_half_goals_avg = (
            sum(row["first_half_goals"] for row in half_goal_rows) / half_data_count
        )
        second_half_goals_avg = (
            sum(row["second_half_goals"] for row in half_goal_rows) / half_data_count
        )

    btts_rate = oran_hesapla(btts_count, match_count)
    over_25_rate = oran_hesapla(over_25_count, match_count)
    over_35_rate = oran_hesapla(over_35_count, match_count)
    home_win_rate = oran_hesapla(home_win_count, match_count)
    away_win_rate = oran_hesapla(away_win_count, match_count)
    draw_rate = oran_hesapla(draw_count, match_count)

    goal_power = lig_goal_power_hesapla(
        average_goals=average_goals,
        over_25_rate=over_25_rate,
        over_35_rate=over_35_rate,
        first_half_goals_avg=first_half_goals_avg,
        second_half_goals_avg=second_half_goals_avg,
    )
    kg_power = lig_kg_power_hesapla(
        btts_rate=btts_rate,
        average_goals=average_goals,
        over_25_rate=over_25_rate,
        over_35_rate=over_35_rate,
    )

    inferred_code = competition_code
    inferred_name = competition_name
    if finished_matches:
        inferred_code = inferred_code or finished_matches[0].get("competition_code")
        inferred_name = inferred_name or finished_matches[0].get("competition_name")

    return {
        "competition_code": inferred_code,
        "competition_name": inferred_name,
        "match_count": match_count,
        "average_goals": round(average_goals, 2),
        "btts_rate": round(btts_rate, 2),
        "first_half_goals_avg": round(first_half_goals_avg, 2)
        if first_half_goals_avg is not None
        else None,
        "second_half_goals_avg": round(second_half_goals_avg, 2)
        if second_half_goals_avg is not None
        else None,
        "over_25_rate": round(over_25_rate, 2),
        "over_35_rate": round(over_35_rate, 2),
        "home_win_rate": round(home_win_rate, 2),
        "away_win_rate": round(away_win_rate, 2),
        "draw_rate": round(draw_rate, 2),
        "LIG_GOAL_POWER": goal_power["score"],
        "LIG_KG_POWER": kg_power["score"],
        "confidence": guven_seviyesi_uret(match_count),
        "confidence_score": confidence_from_match_count(match_count)["confidence_score"],
        "half_time_data_status": "ok" if missing_half_data_count == 0 else "missing_or_partial",
        "half_time_data_count": half_data_count,
        "missing_half_time_data_count": missing_half_data_count,
        "score_parts": {
            "goal_power": goal_power["score_parts"],
            "kg_power": kg_power["score_parts"],
        },
    }


def yerel_ornek_lig_gucu_raporu_uret() -> dict[str, Any]:
    """
    `data/football_data_org_ornek.json` icin lig gucu raporu uretir.
    """
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    matches = son_mac_sonuclarini_listele(data)

    return lig_gucu_raporu_uret(
        matches,
        competition_code=summary["league"]["competition_code"],
        competition_name=summary["league"]["competition_name"],
    )


if __name__ == "__main__":
    print(json.dumps(yerel_ornek_lig_gucu_raporu_uret(), ensure_ascii=False, indent=2))

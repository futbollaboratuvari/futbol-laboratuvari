"""
Futbol Laboratuvari V1 icin Ilk Yari / Ikinci Yari KG Var Motoru.

Bu modul takimlarin ilk yari ve ikinci yari KG Var egilimlerini ayri ayri
hesaplar.

Uretilen skorlar:

- ILK_YARI_KG_VAR_SCORE: 0-100
- IKINCI_YARI_KG_VAR_SCORE: 0-100

Mevcut ornek veri ilk yari / ikinci yari skor detaylarini icermiyorsa motor
eksik veri durumunu algilar, skorlari 0 doner ve `confidence: low` uretir.
"""

from __future__ import annotations

import json
from typing import Any

try:
    from confidence_motoru import confidence_from_match_count
    from form_puani_motoru import takim_maclarini_filtrele, son_maclari_sec
    from veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret
except ImportError:
    from src.confidence_motoru import confidence_from_match_count
    from src.form_puani_motoru import takim_maclarini_filtrele, son_maclari_sec
    from src.veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret


HALF_TIME_HOME_KEYS = ("half_time_home_goals", "ht_home_goals")
HALF_TIME_AWAY_KEYS = ("half_time_away_goals", "ht_away_goals")
FULL_TIME_HOME_KEYS = ("full_time_home_goals", "home_goals")
FULL_TIME_AWAY_KEYS = ("full_time_away_goals", "away_goals")


def ilk_dolu_degeri_al(data: dict[str, Any], keys: tuple[str, ...]) -> Any:
    """
    Verilen anahtarlar icinden ilk dolu degeri bulur.

    Args:
        data: Mac verisi.
        keys: Sirayla kontrol edilecek alan adlari.

    Returns:
        Bulunan ilk deger veya `None`.
    """
    for key in keys:
        if key in data and data[key] is not None:
            return data[key]
    return None


def devre_verisi_var_mi(match: dict[str, Any]) -> bool:
    """
    Bir macta ilk yari ve mac sonu skor bilgisi olup olmadigini kontrol eder.

    Args:
        match: Tek mac verisi.

    Returns:
        Ilk yari ve mac sonu skor alanlari varsa `True`.
    """
    return all(
        value is not None
        for value in (
            ilk_dolu_degeri_al(match, HALF_TIME_HOME_KEYS),
            ilk_dolu_degeri_al(match, HALF_TIME_AWAY_KEYS),
            ilk_dolu_degeri_al(match, FULL_TIME_HOME_KEYS),
            ilk_dolu_degeri_al(match, FULL_TIME_AWAY_KEYS),
        )
    )


def kg_var_mi(home_goals: int, away_goals: int) -> bool:
    """
    Bir devrede iki takimin da gol atip atmadigini hesaplar.

    Args:
        home_goals: Ev sahibi gol sayisi.
        away_goals: Deplasman gol sayisi.

    Returns:
        Iki takim da gol attiysa `True`.
    """
    return home_goals > 0 and away_goals > 0


def oran_hesapla(count: int, total: int) -> float:
    """Bolme hatalarini engelleyen oran hesaplayici."""
    if total == 0:
        return 0.0
    return count / total


def guven_seviyesi_uret(valid_match_count: int, missing_match_count: int) -> str:
    """
    Gecerli devre verisi sayisina gore guven seviyesi uretir.

    Args:
        valid_match_count: Devre skoru kullanilabilen mac sayisi.
        missing_match_count: Devre skoru eksik mac sayisi.

    Returns:
        `low`, `medium`, `high` veya `very_high`.
    """
    if missing_match_count > 0:
        return "low"
    if valid_match_count > 0:
        return confidence_from_match_count(valid_match_count)["confidence"]
    return "low"


def takim_acisindan_devre_skorlari(
    match: dict[str, Any], team_id: int | str
) -> dict[str, Any] | None:
    """
    Bir maci takim acisindan ilk yari ve ikinci yari skorlarina ayirir.

    Args:
        match: Tek mac verisi.
        team_id: Analiz edilen takim kimligi.

    Returns:
        Devre skorlari ve saha bilgisi. Devre verisi eksikse `None`.
    """
    if not devre_verisi_var_mi(match):
        return None

    ht_home = int(ilk_dolu_degeri_al(match, HALF_TIME_HOME_KEYS))
    ht_away = int(ilk_dolu_degeri_al(match, HALF_TIME_AWAY_KEYS))
    ft_home = int(ilk_dolu_degeri_al(match, FULL_TIME_HOME_KEYS))
    ft_away = int(ilk_dolu_degeri_al(match, FULL_TIME_AWAY_KEYS))

    sh_home = ft_home - ht_home
    sh_away = ft_away - ht_away

    is_home = match.get("home_team_id") == team_id
    venue = "home" if is_home else "away"

    if is_home:
        first_half_goals_for = ht_home
        first_half_goals_against = ht_away
        second_half_goals_for = sh_home
        second_half_goals_against = sh_away
        opponent_id = match.get("away_team_id")
        opponent_name = match.get("away_team_name")
    else:
        first_half_goals_for = ht_away
        first_half_goals_against = ht_home
        second_half_goals_for = sh_away
        second_half_goals_against = sh_home
        opponent_id = match.get("home_team_id")
        opponent_name = match.get("home_team_name")

    return {
        "match_id": match.get("match_id"),
        "utc_date": match.get("utc_date"),
        "venue": venue,
        "opponent_id": opponent_id,
        "opponent_name": opponent_name,
        "first_half_goals_for": first_half_goals_for,
        "first_half_goals_against": first_half_goals_against,
        "second_half_goals_for": second_half_goals_for,
        "second_half_goals_against": second_half_goals_against,
        "first_half_kg_var": first_half_goals_for > 0 and first_half_goals_against > 0,
        "second_half_kg_var": second_half_goals_for > 0 and second_half_goals_against > 0,
    }


def devre_skoru_hesapla(
    btts_rate: float,
    venue_btts_rate: float,
    goals_for_avg: float,
    goals_against_avg: float,
    recent_btts_signal: int,
) -> dict[str, Any]:
    """
    Bir devre icin 0-100 KG Var skoru hesaplar.

    Formul:
    - Son 5 devre KG Var orani: 45 puan
    - Ilgili saha devre KG Var orani: 20 puan
    - Devrede gol atma ortalamasi: 15 puan
    - Devrede gol yeme ortalamasi: 15 puan
    - Son macta ilgili devrede KG Var sinyali: 5 puan
    """
    attack_signal = min(goals_for_avg / 1.0, 1.0)
    concede_signal = min(goals_against_avg / 1.0, 1.0)

    score_parts = {
        "last_5_btts_score": round(btts_rate * 45, 2),
        "venue_btts_score": round(venue_btts_rate * 20, 2),
        "attack_score": round(attack_signal * 15, 2),
        "concede_score": round(concede_signal * 15, 2),
        "recent_btts_score": round(recent_btts_signal * 5, 2),
    }

    return {
        "score": round(sum(score_parts.values()), 2),
        "score_parts": score_parts,
    }


def takim_iy_iy_kg_var_raporu_uret(
    matches: list[dict[str, Any]], team_id: int | str, team_name: str | None = None
) -> dict[str, Any]:
    """
    Bir takim icin ilk yari ve ikinci yari KG Var raporu uretir.

    Args:
        matches: Mac listesi.
        team_id: Analiz edilecek takim kimligi.
        team_name: Opsiyonel takim adi.

    Returns:
        Ilk yari ve ikinci yari KG Var oranlari, skorlar ve guven seviyesi.
    """
    team_matches = takim_maclarini_filtrele(matches, team_id)
    last_matches = son_maclari_sec(team_matches, limit=5)
    half_results = [
        takim_acisindan_devre_skorlari(match, team_id) for match in last_matches
    ]
    valid_results = [result for result in half_results if result is not None]
    missing_count = len(half_results) - len(valid_results)
    valid_count = len(valid_results)

    if valid_count == 0:
        return {
            "team_id": team_id,
            "team_name": team_name,
            "match_count": len(last_matches),
            "valid_half_match_count": 0,
            "missing_half_data_count": missing_count,
            "first_half_btts_rate": 0,
            "second_half_btts_rate": 0,
            "home_first_half_btts_rate": 0,
            "away_first_half_btts_rate": 0,
            "home_second_half_btts_rate": 0,
            "away_second_half_btts_rate": 0,
            "first_half_goals_for_avg": 0,
            "first_half_goals_against_avg": 0,
            "second_half_goals_for_avg": 0,
            "second_half_goals_against_avg": 0,
            "ILK_YARI_KG_VAR_SCORE": 0,
            "IKINCI_YARI_KG_VAR_SCORE": 0,
            "confidence": "low",
            "data_status": "missing_half_time_data",
            "note": "Mevcut mac verisinde ilk yari / ikinci yari skor alanlari yok.",
            "matches": [],
        }

    first_half_btts_count = sum(1 for result in valid_results if result["first_half_kg_var"])
    second_half_btts_count = sum(1 for result in valid_results if result["second_half_kg_var"])

    home_results = [result for result in valid_results if result["venue"] == "home"]
    away_results = [result for result in valid_results if result["venue"] == "away"]

    home_first_half_btts_rate = oran_hesapla(
        sum(1 for result in home_results if result["first_half_kg_var"]),
        len(home_results),
    )
    away_first_half_btts_rate = oran_hesapla(
        sum(1 for result in away_results if result["first_half_kg_var"]),
        len(away_results),
    )
    home_second_half_btts_rate = oran_hesapla(
        sum(1 for result in home_results if result["second_half_kg_var"]),
        len(home_results),
    )
    away_second_half_btts_rate = oran_hesapla(
        sum(1 for result in away_results if result["second_half_kg_var"]),
        len(away_results),
    )

    first_half_goals_for_avg = sum(
        result["first_half_goals_for"] for result in valid_results
    ) / valid_count
    first_half_goals_against_avg = sum(
        result["first_half_goals_against"] for result in valid_results
    ) / valid_count
    second_half_goals_for_avg = sum(
        result["second_half_goals_for"] for result in valid_results
    ) / valid_count
    second_half_goals_against_avg = sum(
        result["second_half_goals_against"] for result in valid_results
    ) / valid_count

    first_half_btts_rate = oran_hesapla(first_half_btts_count, valid_count)
    second_half_btts_rate = oran_hesapla(second_half_btts_count, valid_count)

    first_recent_signal = 1 if valid_results[0]["first_half_kg_var"] else 0
    second_recent_signal = 1 if valid_results[0]["second_half_kg_var"] else 0

    first_venue_rate = (
        sum(rate for rate in (home_first_half_btts_rate, away_first_half_btts_rate))
        / 2
    )
    second_venue_rate = (
        sum(rate for rate in (home_second_half_btts_rate, away_second_half_btts_rate))
        / 2
    )

    first_score = devre_skoru_hesapla(
        first_half_btts_rate,
        first_venue_rate,
        first_half_goals_for_avg,
        first_half_goals_against_avg,
        first_recent_signal,
    )
    second_score = devre_skoru_hesapla(
        second_half_btts_rate,
        second_venue_rate,
        second_half_goals_for_avg,
        second_half_goals_against_avg,
        second_recent_signal,
    )

    return {
        "team_id": team_id,
        "team_name": team_name,
        "match_count": len(last_matches),
        "valid_half_match_count": valid_count,
        "missing_half_data_count": missing_count,
        "first_half_btts_rate": round(first_half_btts_rate, 2),
        "second_half_btts_rate": round(second_half_btts_rate, 2),
        "home_first_half_btts_rate": round(home_first_half_btts_rate, 2),
        "away_first_half_btts_rate": round(away_first_half_btts_rate, 2),
        "home_second_half_btts_rate": round(home_second_half_btts_rate, 2),
        "away_second_half_btts_rate": round(away_second_half_btts_rate, 2),
        "first_half_goals_for_avg": round(first_half_goals_for_avg, 2),
        "first_half_goals_against_avg": round(first_half_goals_against_avg, 2),
        "second_half_goals_for_avg": round(second_half_goals_for_avg, 2),
        "second_half_goals_against_avg": round(second_half_goals_against_avg, 2),
        "ILK_YARI_KG_VAR_SCORE": first_score["score"],
        "IKINCI_YARI_KG_VAR_SCORE": second_score["score"],
        "confidence": guven_seviyesi_uret(valid_count, missing_count),
        "data_status": "ok" if missing_count == 0 else "partial_half_time_data",
        "score_parts": {
            "first_half": first_score["score_parts"],
            "second_half": second_score["score_parts"],
        },
        "matches": valid_results,
    }


def ortak_guven_seviyesi_uret(home_report: dict[str, Any], away_report: dict[str, Any]) -> str:
    """
    Iki takim raporundan ortak guven seviyesi uretir.
    """
    levels = [home_report["confidence"], away_report["confidence"]]
    if "low" in levels:
        return "low"
    if "medium" in levels:
        return "medium"
    if "high" in levels:
        return "high"
    return "very_high"


def ortak_devre_kg_var_egilimi_hesapla(
    matches: list[dict[str, Any]],
    home_team_id: int | str,
    away_team_id: int | str,
    home_team_name: str | None = None,
    away_team_name: str | None = None,
) -> dict[str, Any]:
    """
    Iki takimin ortak ilk yari ve ikinci yari KG Var egilimini hesaplar.

    Args:
        matches: Mac listesi.
        home_team_id: Ev sahibi takim kimligi.
        away_team_id: Deplasman takim kimligi.
        home_team_name: Opsiyonel ev sahibi takim adi.
        away_team_name: Opsiyonel deplasman takim adi.

    Returns:
        Ortak ilk yari ve ikinci yari KG Var skorlari.
    """
    home_report = takim_iy_iy_kg_var_raporu_uret(matches, home_team_id, home_team_name)
    away_report = takim_iy_iy_kg_var_raporu_uret(matches, away_team_id, away_team_name)

    first_half_common_score = (
        home_report["ILK_YARI_KG_VAR_SCORE"] * 0.35
        + away_report["ILK_YARI_KG_VAR_SCORE"] * 0.35
        + home_report["home_first_half_btts_rate"] * 15
        + away_report["away_first_half_btts_rate"] * 15
    )
    second_half_common_score = (
        home_report["IKINCI_YARI_KG_VAR_SCORE"] * 0.35
        + away_report["IKINCI_YARI_KG_VAR_SCORE"] * 0.35
        + home_report["home_second_half_btts_rate"] * 15
        + away_report["away_second_half_btts_rate"] * 15
    )

    return {
        "home_team": {
            "team_id": home_team_id,
            "team_name": home_team_name,
            "ILK_YARI_KG_VAR_SCORE": home_report["ILK_YARI_KG_VAR_SCORE"],
            "IKINCI_YARI_KG_VAR_SCORE": home_report["IKINCI_YARI_KG_VAR_SCORE"],
            "confidence": home_report["confidence"],
            "data_status": home_report["data_status"],
        },
        "away_team": {
            "team_id": away_team_id,
            "team_name": away_team_name,
            "ILK_YARI_KG_VAR_SCORE": away_report["ILK_YARI_KG_VAR_SCORE"],
            "IKINCI_YARI_KG_VAR_SCORE": away_report["IKINCI_YARI_KG_VAR_SCORE"],
            "confidence": away_report["confidence"],
            "data_status": away_report["data_status"],
        },
        "ORTAK_ILK_YARI_KG_VAR_SCORE": round(max(0, min(100, first_half_common_score)), 2),
        "ORTAK_IKINCI_YARI_KG_VAR_SCORE": round(max(0, min(100, second_half_common_score)), 2),
        "confidence": ortak_guven_seviyesi_uret(home_report, away_report),
    }


def tum_takimlar_iy_iy_kg_var_raporu_uret() -> list[dict[str, Any]]:
    """
    Yerel ornek veriden tum takimlar icin devre bazli KG Var raporu uretir.

    Returns:
        Tum takimlar icin rapor listesi.
    """
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    matches = son_mac_sonuclarini_listele(data)

    return [
        takim_iy_iy_kg_var_raporu_uret(
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
    reports = tum_takimlar_iy_iy_kg_var_raporu_uret()
    active_reports = [report for report in reports if report["match_count"] > 0][:5]

    example_common = None
    if matches:
        first_match = matches[0]
        example_common = ortak_devre_kg_var_egilimi_hesapla(
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
                "example_common_half_btts": example_common,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

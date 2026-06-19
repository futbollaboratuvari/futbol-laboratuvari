"""
Futbol Laboratuvari V1 ana karar motoru.

Bu modul alt motorlarin ciktilarini tek tahmin katmaninda birlestirir:

- Form Puani Motoru
- KG Var Motoru
- Ilk Yari / Ikinci Yari KG Var Motoru
- Ust/Alt Motoru
- Lig Gucu Motoru

Uretilen ana skorlar:

- GENEL_KG_VAR_SCORE
- GENEL_ILK_YARI_KG_SCORE
- GENEL_IKINCI_YARI_KG_SCORE
- GENEL_UST_25_SCORE

Karar mantigi:

Her skor 0-100 araligindadir. Alt motorlardan gelen skorlar agirlikli
ortalama ile birlestirilir. Agirliklar `DEFAULT_WEIGHTS` icinde tutulur ve
disaridan farkli agirlik sozlugu verilerek ayarlanabilir.
"""

from __future__ import annotations

import json
from typing import Any

try:
    from form_puani_motoru import takim_form_raporu_uret
    from iy_iy_kg_var_motoru import ortak_devre_kg_var_egilimi_hesapla
    from kg_var_motoru import ortak_kg_var_egilimi_hesapla
    from lig_gucu_motoru import lig_gucu_raporu_uret
    from ust_alt_motoru import ortak_ust_alt_egilimi_hesapla
    from veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret
except ImportError:
    from src.form_puani_motoru import takim_form_raporu_uret
    from src.iy_iy_kg_var_motoru import ortak_devre_kg_var_egilimi_hesapla
    from src.kg_var_motoru import ortak_kg_var_egilimi_hesapla
    from src.lig_gucu_motoru import lig_gucu_raporu_uret
    from src.ust_alt_motoru import ortak_ust_alt_egilimi_hesapla
    from src.veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret


DEFAULT_WEIGHTS = {
    "kg_var": {
        "form": 0.25,
        "kg_var": 0.35,
        "ust_alt": 0.20,
        "lig_gucu": 0.20,
    },
    "ilk_yari_kg": {
        "form": 0.20,
        "iy_iy_kg": 0.50,
        "ust_alt": 0.10,
        "lig_gucu": 0.20,
    },
    "ikinci_yari_kg": {
        "form": 0.20,
        "iy_iy_kg": 0.50,
        "ust_alt": 0.10,
        "lig_gucu": 0.20,
    },
    "ust_25": {
        "form": 0.20,
        "kg_var": 0.10,
        "ust_alt": 0.45,
        "lig_gucu": 0.25,
    },
}


def agirlikli_skor_hesapla(values: dict[str, float], weights: dict[str, float]) -> float:
    """
    Motor skorlarini agirlikli ortalama ile 0-100 arasi tek skora cevirir.
    """
    total_weight = sum(weights.values())
    if total_weight == 0:
        return 0.0

    score = sum(values.get(key, 0.0) * weight for key, weight in weights.items())
    return round(max(0, min(100, score / total_weight)), 2)


def ortalama_form_skoru(home_form: dict[str, Any], away_form: dict[str, Any]) -> float:
    """
    Ev sahibi ve deplasman form skor ortalamasini hesaplar.
    """
    return (
        float(home_form.get("form_score", 0))
        + float(away_form.get("form_score", 0))
    ) / 2


def ortak_confidence_uret(confidences: list[str]) -> str:
    """
    Alt motor guvenlerinden genel guven seviyesi uretir.

    En dusuk guven seviyesi ana motor sonucunu da dusurur.
    """
    if "low" in confidences:
        return "low"
    if "medium" in confidences:
        return "medium"
    if "high" in confidences:
        return "high"
    return "very_high"


def tahmin_raporu_uret(
    matches: list[dict[str, Any]],
    home_team_id: int | str,
    away_team_id: int | str,
    home_team_name: str | None = None,
    away_team_name: str | None = None,
    competition_code: str | None = None,
    competition_name: str | None = None,
    weights: dict[str, dict[str, float]] | None = None,
) -> dict[str, Any]:
    """
    Bir mac eslesmesi icin ana tahmin skorlari uretir.

    Varsayilan KG Var skor katkisi:
    - Form Motoru: %25
    - KG Var Motoru: %35
    - Ust/Alt Motoru: %20
    - Lig Gucu: %20
    """
    active_weights = weights or DEFAULT_WEIGHTS

    home_form = takim_form_raporu_uret(matches, home_team_id, home_team_name)
    away_form = takim_form_raporu_uret(matches, away_team_id, away_team_name)
    form_score = ortalama_form_skoru(home_form, away_form)

    kg_var_report = ortak_kg_var_egilimi_hesapla(
        matches, home_team_id, away_team_id, home_team_name, away_team_name
    )
    half_kg_report = ortak_devre_kg_var_egilimi_hesapla(
        matches, home_team_id, away_team_id, home_team_name, away_team_name
    )
    ust_alt_report = ortak_ust_alt_egilimi_hesapla(
        matches, home_team_id, away_team_id, home_team_name, away_team_name
    )
    lig_report = lig_gucu_raporu_uret(matches, competition_code, competition_name)

    genel_kg_var_score = agirlikli_skor_hesapla(
        {
            "form": form_score,
            "kg_var": kg_var_report["common_kg_var_score"],
            "ust_alt": ust_alt_report["ORTAK_UST_25_SCORE"],
            "lig_gucu": lig_report["LIG_KG_POWER"],
        },
        active_weights["kg_var"],
    )
    genel_ilk_yari_kg_score = agirlikli_skor_hesapla(
        {
            "form": form_score,
            "iy_iy_kg": half_kg_report["ORTAK_ILK_YARI_KG_VAR_SCORE"],
            "ust_alt": ust_alt_report["ORTAK_UST_25_SCORE"],
            "lig_gucu": lig_report["LIG_KG_POWER"],
        },
        active_weights["ilk_yari_kg"],
    )
    genel_ikinci_yari_kg_score = agirlikli_skor_hesapla(
        {
            "form": form_score,
            "iy_iy_kg": half_kg_report["ORTAK_IKINCI_YARI_KG_VAR_SCORE"],
            "ust_alt": ust_alt_report["ORTAK_UST_25_SCORE"],
            "lig_gucu": lig_report["LIG_KG_POWER"],
        },
        active_weights["ikinci_yari_kg"],
    )
    genel_ust_25_score = agirlikli_skor_hesapla(
        {
            "form": form_score,
            "kg_var": kg_var_report["common_kg_var_score"],
            "ust_alt": ust_alt_report["ORTAK_UST_25_SCORE"],
            "lig_gucu": lig_report["LIG_GOAL_POWER"],
        },
        active_weights["ust_25"],
    )

    confidence = ortak_confidence_uret(
        [
            home_form["confidence"],
            away_form["confidence"],
            kg_var_report["confidence"],
            half_kg_report["confidence"],
            ust_alt_report["confidence"],
            lig_report["confidence"],
        ]
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
        "scores": {
            "KG_VAR_SCORE": genel_kg_var_score,
            "ILK_YARI_KG_SCORE": genel_ilk_yari_kg_score,
            "IKINCI_YARI_KG_SCORE": genel_ikinci_yari_kg_score,
            "UST_25_SCORE": genel_ust_25_score,
        },
        "GENEL_KG_VAR_SCORE": genel_kg_var_score,
        "GENEL_ILK_YARI_KG_SCORE": genel_ilk_yari_kg_score,
        "GENEL_IKINCI_YARI_KG_SCORE": genel_ikinci_yari_kg_score,
        "GENEL_UST_25_SCORE": genel_ust_25_score,
        "confidence": confidence,
        "weights": active_weights,
        "engine_details": {
            "form": {
                "home_form_score": home_form["form_score"],
                "away_form_score": away_form["form_score"],
                "average_form_score": round(form_score, 2),
                "home_confidence": home_form["confidence"],
                "away_confidence": away_form["confidence"],
            },
            "kg_var": kg_var_report,
            "iy_iy_kg_var": half_kg_report,
            "ust_alt": ust_alt_report,
            "lig_gucu": lig_report,
        },
    }


def yerel_ornek_tahmin_uret() -> dict[str, Any]:
    """
    Yerel ornek verideki ilk mac icin tahmin raporu uretir.
    """
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
    return tahmin_raporu_uret(
        matches,
        home_team_id=first_match["home_team_id"],
        away_team_id=first_match["away_team_id"],
        home_team_name=first_match["home_team_name"],
        away_team_name=first_match["away_team_name"],
        competition_code=summary["league"]["competition_code"],
        competition_name=summary["league"]["competition_name"],
    )


if __name__ == "__main__":
    print(json.dumps(yerel_ornek_tahmin_uret(), ensure_ascii=False, indent=2))

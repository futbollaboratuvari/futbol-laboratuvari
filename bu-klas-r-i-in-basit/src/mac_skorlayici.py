"""
Futbol Laboratuvari V1 mac skorlayici.

Bu modul iki takim secildiginde ana tahmin motorunu calistirir ve kupon
olusturucuya gidecek sade market skorlarini uretir.

Girdi:

- EV_TAKIMI
- DEPLASMAN_TAKIMI

Cikti:

- KG_VAR_SCORE
- ILK_YARI_KG_SCORE
- IKINCI_YARI_KG_SCORE
- UST_25_SCORE
- confidence
- en_guclu_market
- ilk_3_market
"""

from __future__ import annotations

import json
from typing import Any

try:
    from tahmin_motoru import tahmin_raporu_uret
    from veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret
except ImportError:
    from src.tahmin_motoru import tahmin_raporu_uret
    from src.veri_okuyucu import son_mac_sonuclarini_listele, veri_ozeti_uret


MARKET_LABELS = {
    "KG_VAR_SCORE": "KG_VAR",
    "ILK_YARI_KG_SCORE": "ILK_YARI_KG",
    "IKINCI_YARI_KG_SCORE": "IKINCI_YARI_KG",
    "UST_25_SCORE": "UST_25",
}


def takim_bul(
    teams: list[dict[str, Any]], team_identifier: int | str
) -> dict[str, Any]:
    """
    Takimi kimlik veya ad ile bulur.

    Args:
        teams: `veri_okuyucu` tarafindan uretilen takim listesi.
        team_identifier: Takim kimligi veya takim adi.

    Returns:
        Bulunan takim sozlugu.

    Raises:
        ValueError: Takim bulunamazsa.
    """
    identifier_text = str(team_identifier).strip().lower()

    for team in teams:
        if str(team.get("team_id")).lower() == identifier_text:
            return team
        if str(team.get("team_name")).strip().lower() == identifier_text:
            return team

    raise ValueError(f"Takim bulunamadi: {team_identifier}")


def marketleri_sirala(scores: dict[str, float]) -> list[dict[str, Any]]:
    """
    Market skorlarini yuksekten dusuge siralar.

    Args:
        scores: Ana tahmin motorundan gelen skor sozlugu.

    Returns:
        Market adi ve skor bilgisini iceren sirali liste.
    """
    rows = [
        {
            "market": MARKET_LABELS[key],
            "score_key": key,
            "score": value,
        }
        for key, value in scores.items()
        if key in MARKET_LABELS
    ]
    return sorted(rows, key=lambda row: row["score"], reverse=True)


def mac_skorla(
    ev_takimi: int | str,
    deplasman_takimi: int | str,
) -> dict[str, Any]:
    """
    Iki takim icin tum tahmin motorlarini calistirir ve market skoru uretir.

    Args:
        ev_takimi: Ev sahibi takim kimligi veya adi.
        deplasman_takimi: Deplasman takim kimligi veya adi.

    Returns:
        Ana market skorlarini, confidence degerini, en guclu marketi ve ilk
        3 market siralamasini iceren sozluk.
    """
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    matches = son_mac_sonuclarini_listele(data)
    teams = summary["teams"]

    home_team = takim_bul(teams, ev_takimi)
    away_team = takim_bul(teams, deplasman_takimi)

    tahmin = tahmin_raporu_uret(
        matches,
        home_team_id=home_team["team_id"],
        away_team_id=away_team["team_id"],
        home_team_name=home_team["team_name"],
        away_team_name=away_team["team_name"],
        competition_code=summary["league"]["competition_code"],
        competition_name=summary["league"]["competition_name"],
    )

    scores = tahmin["scores"]
    market_ranking = marketleri_sirala(scores)
    strongest_market = market_ranking[0] if market_ranking else None

    return {
        "match": {
            "competition_code": summary["league"]["competition_code"],
            "competition_name": summary["league"]["competition_name"],
            "EV_TAKIMI": home_team["team_name"],
            "DEPLASMAN_TAKIMI": away_team["team_name"],
            "home_team_id": home_team["team_id"],
            "away_team_id": away_team["team_id"],
        },
        "KG_VAR_SCORE": scores["KG_VAR_SCORE"],
        "ILK_YARI_KG_SCORE": scores["ILK_YARI_KG_SCORE"],
        "IKINCI_YARI_KG_SCORE": scores["IKINCI_YARI_KG_SCORE"],
        "UST_25_SCORE": scores["UST_25_SCORE"],
        "confidence": tahmin["confidence"],
        "en_guclu_market": strongest_market["market"] if strongest_market else None,
        "en_guclu_market_skor": strongest_market["score"] if strongest_market else 0,
        "ilk_3_market": market_ranking[:3],
        "tahmin_detayi": tahmin,
    }


def yerel_ornek_mac_skorla() -> dict[str, Any]:
    """
    Yerel ornek verideki ilk maci skorlar.
    """
    summary = veri_ozeti_uret()
    if not summary["recent_results"]:
        return {"error": "Ornek veri icinde mac bulunamadi.", "confidence": "low"}

    first_match = summary["recent_results"][0]
    return mac_skorla(
        first_match["home_team_id"],
        first_match["away_team_id"],
    )


if __name__ == "__main__":
    print(json.dumps(yerel_ornek_mac_skorla(), ensure_ascii=False, indent=2))


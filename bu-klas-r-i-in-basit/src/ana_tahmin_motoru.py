"""
Futbol Laboratuvari V1 Ana Tahmin Motoru.

Bu modul mevcut tum motorlari tek "Mac Skor Karti" raporunda birlestirir.

Girdi motorlari:

- Form Motoru
- KG Var Motoru
- Ilk Yari KG Var Motoru
- Ikinci Yari KG Var Motoru
- Ust 2.5 Motoru
- Lig Gucu Motoru

Cikti:

- Form Score
- KG Score
- Ilk Yari KG
- Ikinci Yari KG
- Ust 2.5
- Confidence
- En guclu ilk 3 market
- Tahmini Guc Skoru
"""

from __future__ import annotations

import json
from typing import Any

try:
    from mac_skorlayici import mac_skorla
except ImportError:
    from src.mac_skorlayici import mac_skorla


MARKET_DISPLAY_NAMES = {
    "KG_VAR": "KG Var",
    "ILK_YARI_KG": "Ilk Yari KG Var",
    "IKINCI_YARI_KG": "Ikinci Yari KG Var",
    "UST_25": "Ust 2.5",
}


def tahmini_guc_skoru_hesapla(scores: dict[str, float]) -> float:
    """
    Ana market skorlarindan 0-100 arasi genel tahmini guc skoru uretir.

    Agirliklar:
    - Ust 2.5: %30
    - KG Var: %30
    - Ikinci yari KG: %20
    - Ilk yari KG: %20
    """
    weighted_score = (
        scores["UST_25_SCORE"] * 0.30
        + scores["KG_VAR_SCORE"] * 0.30
        + scores["IKINCI_YARI_KG_SCORE"] * 0.20
        + scores["ILK_YARI_KG_SCORE"] * 0.20
    )
    return round(max(0, min(100, weighted_score)), 2)


def form_score_cikar(skorlayici_raporu: dict[str, Any]) -> float:
    """
    Mac skorlayici detayindan ortalama form skorunu cikarir.
    """
    return float(
        skorlayici_raporu["tahmin_detayi"]["engine_details"]["form"][
            "average_form_score"
        ]
    )


def market_adi_duzenle(market: str) -> str:
    """
    Ic market kodunu okunabilir ada cevirir.
    """
    return MARKET_DISPLAY_NAMES.get(market, market)


def mac_skor_karti_uret(
    ev_takimi: int | str,
    deplasman_takimi: int | str,
) -> dict[str, Any]:
    """
    Iki takim icin Mac Skor Karti uretir.

    Args:
        ev_takimi: Ev sahibi takim adi veya kimligi.
        deplasman_takimi: Deplasman takim adi veya kimligi.

    Returns:
        Tum motorlardan gelen skorlarin tek raporda birlestirilmis hali.
    """
    skorlayici_raporu = mac_skorla(ev_takimi, deplasman_takimi)
    scores = {
        "KG_VAR_SCORE": skorlayici_raporu["KG_VAR_SCORE"],
        "ILK_YARI_KG_SCORE": skorlayici_raporu["ILK_YARI_KG_SCORE"],
        "IKINCI_YARI_KG_SCORE": skorlayici_raporu["IKINCI_YARI_KG_SCORE"],
        "UST_25_SCORE": skorlayici_raporu["UST_25_SCORE"],
    }

    strongest_markets = [
        {
            "sira": index + 1,
            "market": market_adi_duzenle(row["market"]),
            "market_kodu": row["market"],
            "score": row["score"],
        }
        for index, row in enumerate(skorlayici_raporu["ilk_3_market"])
    ]

    return {
        "rapor_tipi": "MAC_SKOR_KARTI",
        "mac": {
            "ev_takimi": skorlayici_raporu["match"]["EV_TAKIMI"],
            "deplasman_takimi": skorlayici_raporu["match"]["DEPLASMAN_TAKIMI"],
            "lig": skorlayici_raporu["match"]["competition_name"],
            "lig_kodu": skorlayici_raporu["match"]["competition_code"],
        },
        "skor_karti": {
            "Form Score": form_score_cikar(skorlayici_raporu),
            "KG Score": scores["KG_VAR_SCORE"],
            "Ilk Yari KG": scores["ILK_YARI_KG_SCORE"],
            "Ikinci Yari KG": scores["IKINCI_YARI_KG_SCORE"],
            "Ust 2.5": scores["UST_25_SCORE"],
            "Confidence": skorlayici_raporu["confidence"].upper(),
            "Tahmini Guc Skoru": tahmini_guc_skoru_hesapla(scores),
        },
        "en_guclu_marketler": strongest_markets,
        "detay": skorlayici_raporu,
    }


def okunabilir_skor_karti_uret(skor_karti: dict[str, Any]) -> str:
    """
    Mac Skor Karti JSON ciktisini okunabilir metne cevirir.
    """
    mac = skor_karti["mac"]
    kart = skor_karti["skor_karti"]
    lines = [
        "MAC SKOR KARTI",
        "",
        f"{mac['ev_takimi']} vs {mac['deplasman_takimi']}",
        "",
        f"Form Score: {kart['Form Score']}",
        f"KG Score: {kart['KG Score']}",
        f"Ilk Yari KG: {kart['Ilk Yari KG']}",
        f"Ikinci Yari KG: {kart['Ikinci Yari KG']}",
        f"Ust 2.5: {kart['Ust 2.5']}",
        "",
        f"Confidence: {kart['Confidence']}",
        "",
        "En Guclu Marketler:",
    ]

    for row in skor_karti["en_guclu_marketler"]:
        lines.append(f"{row['sira']}. {row['market']} ({row['score']})")

    lines.extend(
        [
            "",
            f"Tahmini Guc Skoru: {kart['Tahmini Guc Skoru']}",
        ]
    )
    return "\n".join(lines)


def yerel_ornek_skor_karti_uret() -> dict[str, Any]:
    """
    Yerel ornek verideki Liverpool - AFC Bournemouth maci icin skor karti uretir.
    """
    return mac_skor_karti_uret("Liverpool FC", "AFC Bournemouth")


if __name__ == "__main__":
    report = yerel_ornek_skor_karti_uret()
    print(okunabilir_skor_karti_uret(report))
    print("\nJSON_RAPOR:")
    print(json.dumps(report, ensure_ascii=False, indent=2))


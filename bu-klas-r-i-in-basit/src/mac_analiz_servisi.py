"""
Futbol Laboratuvari V1 mac analiz servisi.

Bu servis takim isimleri girildiginde tum analiz zincirini calistirir:

- Veri okuyucu
- Form motoru
- KG motorlari
- Ust/Alt motoru
- Lig gucu motoru
- Tahmin motoru
- Mac skorlayici

Sonuc tek rapor olarak doner.
"""

from __future__ import annotations

import json
from typing import Any

try:
    from mac_skorlayici import mac_skorla
except ImportError:
    from src.mac_skorlayici import mac_skorla


def confidence_buyuk_harf(confidence: str) -> str:
    """
    Confidence degerini rapor icin buyuk harfe cevirir.
    """
    return confidence.upper()


def mac_analiz_raporu_uret(
    ev_takimi: str,
    deplasman_takimi: str,
) -> dict[str, Any]:
    """
    Takim isimleriyle tum analiz motorlarini calistirir.

    Args:
        ev_takimi: Ev sahibi takim adi veya takim id'si.
        deplasman_takimi: Deplasman takim adi veya takim id'si.

    Returns:
        Ana skorlar, en guclu market, ilk 3 market ve detayli motor raporu.
    """
    skor_raporu = mac_skorla(ev_takimi, deplasman_takimi)

    return {
        "mac": {
            "ev_takimi": skor_raporu["match"]["EV_TAKIMI"],
            "deplasman_takimi": skor_raporu["match"]["DEPLASMAN_TAKIMI"],
            "lig": skor_raporu["match"]["competition_name"],
            "lig_kodu": skor_raporu["match"]["competition_code"],
        },
        "skorlar": {
            "KG_VAR_SCORE": skor_raporu["KG_VAR_SCORE"],
            "ILK_YARI_KG_SCORE": skor_raporu["ILK_YARI_KG_SCORE"],
            "IKINCI_YARI_KG_SCORE": skor_raporu["IKINCI_YARI_KG_SCORE"],
            "UST_25_SCORE": skor_raporu["UST_25_SCORE"],
        },
        "en_guclu_market": {
            "market": skor_raporu["en_guclu_market"],
            "skor": skor_raporu["en_guclu_market_skor"],
        },
        "confidence": confidence_buyuk_harf(skor_raporu["confidence"]),
        "ilk_3_market": [
            {
                "sira": index + 1,
                "market": row["market"],
                "skor": row["score"],
            }
            for index, row in enumerate(skor_raporu["ilk_3_market"])
        ],
        "detay": skor_raporu,
    }


def okunabilir_rapor_uret(rapor: dict[str, Any]) -> str:
    """
    JSON raporunu kullaniciya okunabilir metne cevirir.

    Args:
        rapor: `mac_analiz_raporu_uret` ciktisi.

    Returns:
        Cok satirli okunabilir rapor metni.
    """
    lines = [
        f"{rapor['mac']['ev_takimi']} vs {rapor['mac']['deplasman_takimi']}",
        "",
        f"KG_VAR_SCORE: {rapor['skorlar']['KG_VAR_SCORE']}",
        f"ILK_YARI_KG_SCORE: {rapor['skorlar']['ILK_YARI_KG_SCORE']}",
        f"IKINCI_YARI_KG_SCORE: {rapor['skorlar']['IKINCI_YARI_KG_SCORE']}",
        f"UST_25_SCORE: {rapor['skorlar']['UST_25_SCORE']}",
        "",
        "En Guclu Market:",
        str(rapor["en_guclu_market"]["market"]),
        "",
        "Skor:",
        str(rapor["en_guclu_market"]["skor"]),
        "",
        "Confidence:",
        str(rapor["confidence"]),
        "",
        "Ilk 3 Market:",
    ]

    for row in rapor["ilk_3_market"]:
        lines.append(f"{row['sira']}. {row['market']} ({row['skor']})")

    return "\n".join(lines)


def ornek_rapor_uret() -> dict[str, Any]:
    """
    Yerel ornek verideki Liverpool - AFC Bournemouth maci icin rapor uretir.
    """
    return mac_analiz_raporu_uret("Liverpool FC", "AFC Bournemouth")


if __name__ == "__main__":
    report = ornek_rapor_uret()
    print(okunabilir_rapor_uret(report))
    print("\nJSON_RAPOR:")
    print(json.dumps(report, ensure_ascii=False, indent=2))


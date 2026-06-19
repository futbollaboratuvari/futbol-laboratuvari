"""
Futbol Laboratuvari V1 Faz 3 kupon motoru.

Bu modul Faz 2 analiz motorlarinin urettigi skorlari kullanarak otomatik
kupon onerileri olusturur.

Kullanilan ana sinyaller:

- GUC_SKORU
- confidence_score
- KG_VAR_OLASILIGI
- UST_25_OLASILIGI

Uretilen ciktılar:

- Tek mac onerileri
- 2'li kupon onerileri
- 3'lu kupon onerileri
- Risk puani
"""

from __future__ import annotations

import itertools
import json
from pathlib import Path
from typing import Any

try:
    from guc_skoru_motoru import mac_guc_skoru_uret
    from veri_okuyucu import veri_ozeti_uret, son_mac_sonuclarini_listele
except ImportError:
    from src.guc_skoru_motoru import mac_guc_skoru_uret
    from src.veri_okuyucu import veri_ozeti_uret, son_mac_sonuclarini_listele


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_FILE = PROJECT_ROOT / "outputs" / "faz3_kupon_motoru_raporu.md"

MARKETLER = {
    "KG_VAR": "KG Var",
    "UST_25": "Ust 2.5",
}


def skoru_sinirla(value: float) -> float:
    """0-100 arasi guvenli skor doner."""
    return round(max(0, min(100, value)), 2)


def risk_seviyesi_uret(risk_score: float) -> str:
    """Risk puanini okunabilir etikete cevirir."""
    if risk_score <= 25:
        return "dusuk"
    if risk_score <= 50:
        return "orta"
    if risk_score <= 75:
        return "yuksek"
    return "cok_yuksek"


def market_sinyallerini_uret(power_report: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Mac icin KG Var ve Ust 2.5 market sinyallerini siralar.
    """
    return sorted(
        [
            {
                "market": "KG_VAR",
                "market_adi": MARKETLER["KG_VAR"],
                "market_score": float(power_report.get("KG_VAR_OLASILIGI", 0)),
            },
            {
                "market": "UST_25",
                "market_adi": MARKETLER["UST_25"],
                "market_score": float(power_report.get("UST_25_OLASILIGI", 0)),
            },
        ],
        key=lambda row: row["market_score"],
        reverse=True,
    )


def tek_mac_oneri_skoru_hesapla(
    guc_skoru: float,
    confidence_score: float,
    market_score: float,
) -> dict[str, Any]:
    """
    Tek mac onerisi icin karar ve risk skorlarini hesaplar.

    Oneri skoru:
    - Guc skoru: %35
    - Confidence score: %35
    - Market sinyali: %30

    Risk puani:
    - 100 - onerinin ana skoru
    - Confidence dusukse risk otomatik yukselir.
    """
    recommendation_score = (
        guc_skoru * 0.35
        + confidence_score * 0.35
        + market_score * 0.30
    )
    risk_score = 100 - recommendation_score
    if confidence_score < 40:
        risk_score += 15
    elif confidence_score < 65:
        risk_score += 7

    return {
        "recommendation_score": skoru_sinirla(recommendation_score),
        "risk_score": skoru_sinirla(risk_score),
        "risk_level": risk_seviyesi_uret(risk_score),
    }


def tek_mac_onerisi_uret(
    match: dict[str, Any],
    history_matches: list[dict[str, Any]],
    competition_code: str | None,
    competition_name: str | None,
) -> dict[str, Any]:
    """
    Tek mac icin en guclu marketi secerek kupon onerisi uretir.
    """
    power_report = mac_guc_skoru_uret(
        history_matches,
        home_team_id=match.get("home_team_id"),
        away_team_id=match.get("away_team_id"),
        home_team_name=match.get("home_team_name"),
        away_team_name=match.get("away_team_name"),
        competition_code=competition_code,
        competition_name=competition_name,
    )
    marketler = market_sinyallerini_uret(power_report)
    strongest_market = marketler[0]
    score_info = tek_mac_oneri_skoru_hesapla(
        guc_skoru=float(power_report.get("GUC_SKORU", 0)),
        confidence_score=float(power_report.get("confidence_score", 0)),
        market_score=float(strongest_market["market_score"]),
    )

    return {
        "match_id": match.get("match_id"),
        "mac": f"{match.get('home_team_name')} - {match.get('away_team_name')}",
        "home_team": match.get("home_team_name"),
        "away_team": match.get("away_team_name"),
        "competition_name": competition_name or match.get("competition_name"),
        "market": strongest_market["market"],
        "market_adi": strongest_market["market_adi"],
        "market_score": round(strongest_market["market_score"], 2),
        "guc_skoru": power_report["GUC_SKORU"],
        "kg_var_olasiligi": power_report["KG_VAR_OLASILIGI"],
        "ust_25_olasiligi": power_report["UST_25_OLASILIGI"],
        "confidence": power_report["confidence"],
        "confidence_score": power_report["confidence_score"],
        "recommendation_score": score_info["recommendation_score"],
        "risk_score": score_info["risk_score"],
        "risk_level": score_info["risk_level"],
        "power_report": power_report,
    }


def kupon_skoru_hesapla(legs: list[dict[str, Any]]) -> dict[str, Any]:
    """
    2'li veya 3'lu kupon icin toplam skor ve risk hesaplar.
    """
    if not legs:
        return {
            "coupon_score": 0.0,
            "risk_score": 100.0,
            "risk_level": "cok_yuksek",
            "confidence_score": 0.0,
        }

    avg_recommendation = sum(leg["recommendation_score"] for leg in legs) / len(legs)
    avg_confidence = sum(leg["confidence_score"] for leg in legs) / len(legs)
    avg_risk = sum(leg["risk_score"] for leg in legs) / len(legs)
    combo_penalty = 8 * (len(legs) - 1)
    coupon_score = avg_recommendation - combo_penalty
    risk_score = avg_risk + combo_penalty

    return {
        "coupon_score": skoru_sinirla(coupon_score),
        "risk_score": skoru_sinirla(risk_score),
        "risk_level": risk_seviyesi_uret(risk_score),
        "confidence_score": skoru_sinirla(avg_confidence),
    }


def kombinasyon_kuponlari_uret(
    single_recommendations: list[dict[str, Any]],
    leg_count: int,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """
    Tek mac onerilerinden 2'li veya 3'lu kupon kombinasyonlari uretir.
    """
    coupons = []
    for legs in itertools.combinations(single_recommendations, leg_count):
        score_info = kupon_skoru_hesapla(list(legs))
        coupons.append(
            {
                "leg_count": leg_count,
                "legs": list(legs),
                "coupon_score": score_info["coupon_score"],
                "risk_score": score_info["risk_score"],
                "risk_level": score_info["risk_level"],
                "confidence_score": score_info["confidence_score"],
            }
        )

    return sorted(coupons, key=lambda row: row["coupon_score"], reverse=True)[:limit]


def yerel_mac_verisini_yukle() -> dict[str, Any]:
    """
    Yerel ornek veri dosyasindan analiz edilecek maclari ve lig bilgisini yukler.
    """
    summary = veri_ozeti_uret()
    data = {
        "competition_code": summary["league"]["competition_code"],
        "standings": summary["standings_table"],
        "recent_results": summary["recent_results"],
    }
    return {
        "summary": summary,
        "matches": son_mac_sonuclarini_listele(data),
        "competition_code": summary["league"]["competition_code"],
        "competition_name": summary["league"]["competition_name"],
    }


def kupon_raporu_uret(
    matches: list[dict[str, Any]],
    history_matches: list[dict[str, Any]],
    competition_code: str | None = None,
    competition_name: str | None = None,
) -> dict[str, Any]:
    """
    Mac listesinden tekli, 2'li ve 3'lu kupon onerileri uretir.
    """
    single_recommendations = [
        tek_mac_onerisi_uret(
            match=match,
            history_matches=history_matches,
            competition_code=competition_code,
            competition_name=competition_name,
        )
        for match in matches
    ]
    ranked_singles = sorted(
        single_recommendations,
        key=lambda row: row["recommendation_score"],
        reverse=True,
    )

    return {
        "rapor_tipi": "FAZ3_KUPON_MOTORU_RAPORU",
        "match_count": len(matches),
        "single_recommendations": ranked_singles,
        "double_coupons": kombinasyon_kuponlari_uret(ranked_singles, 2),
        "triple_coupons": kombinasyon_kuponlari_uret(ranked_singles, 3),
        "rules": {
            "single_recommendation_score": {
                "guc_skoru": 0.35,
                "confidence_score": 0.35,
                "market_score": 0.30,
            },
            "coupon_penalty": "Her ek ayak icin 8 puan risk/ceza.",
        },
    }


def tek_mac_onerisi_analizden_uret(match_analysis: dict[str, Any]) -> dict[str, Any]:
    """
    Gunun maclari tarayicisinin analiz satirindan tek mac kupon onerisi uretir.
    """
    kg_score = float(
        match_analysis.get("kg_var_olasiligi", match_analysis.get("kg_var_score", 0))
        or 0
    )
    ust_score = float(
        match_analysis.get("ust_25_olasiligi", match_analysis.get("ust_25_score", 0))
        or 0
    )
    if ust_score >= kg_score:
        market = "UST_25"
        market_adi = MARKETLER["UST_25"]
        market_score = ust_score
    else:
        market = "KG_VAR"
        market_adi = MARKETLER["KG_VAR"]
        market_score = kg_score

    confidence_score = float(
        (
            match_analysis.get("faz2_power_report", {})
            .get("confidence_score", 0)
        )
        or 0
    )
    if confidence_score == 0 and match_analysis.get("confidence") in {"high", "very_high"}:
        confidence_score = 75.0

    score_info = tek_mac_oneri_skoru_hesapla(
        guc_skoru=float(match_analysis.get("guc_skoru", 0) or 0),
        confidence_score=confidence_score,
        market_score=market_score,
    )

    return {
        "match_id": match_analysis.get("match_id"),
        "mac": f"{match_analysis.get('home_team')} - {match_analysis.get('away_team')}",
        "home_team": match_analysis.get("home_team"),
        "away_team": match_analysis.get("away_team"),
        "competition_name": match_analysis.get("competition_name"),
        "market": market,
        "market_adi": market_adi,
        "market_score": round(market_score, 2),
        "guc_skoru": match_analysis.get("guc_skoru", 0),
        "kg_var_olasiligi": round(kg_score, 2),
        "ust_25_olasiligi": round(ust_score, 2),
        "confidence": match_analysis.get("confidence", "low"),
        "confidence_score": round(confidence_score, 2),
        "recommendation_score": score_info["recommendation_score"],
        "risk_score": score_info["risk_score"],
        "risk_level": score_info["risk_level"],
        "power_report": match_analysis.get("faz2_power_report"),
    }


def kupon_raporu_analiz_sonuclarindan_uret(
    analyzed_matches: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Gunun maclari tarayicisi tarafindan uretilen analiz satirlarindan kupon
    raporu uretir.
    """
    single_recommendations = [
        tek_mac_onerisi_analizden_uret(row)
        for row in analyzed_matches
    ]
    ranked_singles = sorted(
        single_recommendations,
        key=lambda row: row["recommendation_score"],
        reverse=True,
    )
    return {
        "rapor_tipi": "FAZ3_KUPON_MOTORU_RAPORU",
        "match_count": len(analyzed_matches),
        "single_recommendations": ranked_singles,
        "double_coupons": kombinasyon_kuponlari_uret(ranked_singles, 2),
        "triple_coupons": kombinasyon_kuponlari_uret(ranked_singles, 3),
        "rules": {
            "single_recommendation_score": {
                "guc_skoru": 0.35,
                "confidence_score": 0.35,
                "market_score": 0.30,
            },
            "coupon_penalty": "Her ek ayak icin 8 puan risk/ceza.",
        },
    }


def kupon_markdown_uret(report: dict[str, Any]) -> str:
    """
    Kupon raporunu Markdown formatina cevirir.
    """
    lines = [
        "# Faz 3 Kupon Motoru Raporu",
        "",
        "## Rapor Bilgisi",
        "",
        f"RAPOR_TIPI: {report['rapor_tipi']}",
        f"MAC_SAYISI: {report['match_count']}",
        "",
        "## Karar Kurallari",
        "",
        "- Tek mac onerisi: Guc Skoru %35, Confidence Score %35, Market Sinyali %30.",
        "- Risk puani: 100 - oneri skoru; confidence dusukse risk artirilir.",
        "- 2'li ve 3'lu kuponlarda her ek ayak icin 8 puan kombinasyon riski eklenir.",
        "- Bu rapor karar destek amaclidir; kesin sonuc iddiasi degildir.",
        "",
        "## Tek Mac Onerileri",
        "",
        "| Sira | Mac | Market | Guc | KG Var | Ust 2.5 | Confidence | Oneri Skoru | Risk |",
        "|---:|---|---|---:|---:|---:|---:|---:|---|",
    ]

    for index, row in enumerate(report["single_recommendations"], start=1):
        lines.append(
            "| {i} | {mac} | {market} | {guc} | {kg} | {ust} | {conf} | {score} | {risk} ({risk_level}) |".format(
                i=index,
                mac=row["mac"],
                market=row["market_adi"],
                guc=row["guc_skoru"],
                kg=row["kg_var_olasiligi"],
                ust=row["ust_25_olasiligi"],
                conf=row["confidence_score"],
                score=row["recommendation_score"],
                risk=row["risk_score"],
                risk_level=row["risk_level"],
            )
        )

    lines.extend(
        [
            "",
            "## 2'li Kupon Onerileri",
            "",
            "| Sira | Maclar | Marketler | Kupon Skoru | Confidence | Risk |",
            "|---:|---|---|---:|---:|---|",
        ]
    )
    for index, coupon in enumerate(report["double_coupons"], start=1):
        lines.append(coupon_markdown_satiri(index, coupon))

    lines.extend(
        [
            "",
            "## 3'lu Kupon Onerileri",
            "",
            "| Sira | Maclar | Marketler | Kupon Skoru | Confidence | Risk |",
            "|---:|---|---|---:|---:|---|",
        ]
    )
    for index, coupon in enumerate(report["triple_coupons"], start=1):
        lines.append(coupon_markdown_satiri(index, coupon))

    lines.extend(
        [
            "",
            "## Faz 3 Notu",
            "",
            "- Mevcut ham havuz 5 maclik ornek veriyle basladigi icin confidence skorlarinin dusuk kalmasi beklenir.",
            "- Canli API ile ham veri havuzu buyudukce confidence ve kupon kalitesi artacaktir.",
            "- Faz 3'un sonraki adimi, bu motoru `run_robot.bat` akisina rapor uretici olarak baglamaktir.",
        ]
    )
    return "\n".join(lines)


def coupon_markdown_satiri(index: int, coupon: dict[str, Any]) -> str:
    """Kupon satirini Markdown tablosuna cevirir."""
    matches = "<br>".join(leg["mac"] for leg in coupon["legs"])
    markets = "<br>".join(leg["market_adi"] for leg in coupon["legs"])
    return (
        f"| {index} | {matches} | {markets} | {coupon['coupon_score']} | "
        f"{coupon['confidence_score']} | {coupon['risk_score']} ({coupon['risk_level']}) |"
    )


def yerel_ornek_kupon_raporu_uret() -> dict[str, Any]:
    """Yerel ornek veriden kupon raporu uretir."""
    local_data = yerel_mac_verisini_yukle()
    return kupon_raporu_uret(
        matches=local_data["matches"],
        history_matches=local_data["matches"],
        competition_code=local_data["competition_code"],
        competition_name=local_data["competition_name"],
    )


if __name__ == "__main__":
    report = yerel_ornek_kupon_raporu_uret()
    print(kupon_markdown_uret(report))
    print("\nJSON_RAPOR:")
    print(json.dumps(report, ensure_ascii=False, indent=2))

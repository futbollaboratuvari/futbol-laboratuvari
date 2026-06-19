"""
Futbol Laboratuvari Faz 5 tahmin performans takip sistemi.

Bu modul robotun urettigi her tahmini kalici gecmise kaydeder, benzersiz ID
uretir, mac sonucu girildiginde tahmini won/lost/void durumuna alir ve basari
yuzdesini genel, lig bazli ve tahmin turu/market bazli hesaplar.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_HISTORY_FILE = PROJECT_ROOT / "data" / "tahmin_gecmisi.json"
DEFAULT_SUCCESS_REPORT_FILE = PROJECT_ROOT / "outputs" / "basari_yuzdesi_raporu.md"

SUPPORTED_MARKETS = [
    "KG_VAR",
    "UST_25",
    "ILK_YARI_KG",
    "IKINCI_YARI_KG",
    "MS1",
    "MSX",
    "MS2",
    "CIFTE_SANS_1X",
    "CIFTE_SANS_12",
    "CIFTE_SANS_X2",
]


def simdi_iso() -> str:
    """UTC zaman damgasini ISO formatinda doner."""
    return datetime.now(timezone.utc).isoformat()


def bos_tahmin_gecmisi_olustur() -> dict[str, Any]:
    """Bos tahmin gecmisi semasini olusturur."""
    return {
        "schema_version": "prediction_history_v2",
        "created_at": simdi_iso(),
        "updated_at": simdi_iso(),
        "prediction_count": 0,
        "predictions": [],
        "rules": {
            "result_status_values": ["pending", "won", "lost", "void"],
            "supported_markets": SUPPORTED_MARKETS,
            "success_rate": "won / (won + lost) * 100",
            "unique_id": "prediction_date + match_id/match + market",
        },
    }


def tahmin_gecmisi_oku(file_path: str | Path = DEFAULT_HISTORY_FILE) -> dict[str, Any]:
    """Tahmin gecmisini okur; dosya yoksa bos sema doner."""
    path = Path(file_path)
    if not path.exists():
        return bos_tahmin_gecmisi_olustur()
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("Tahmin gecmisi kok verisi obje olmali.")
    data.setdefault("predictions", [])
    data.setdefault("prediction_count", len(data["predictions"]))
    data.setdefault("rules", {})
    data["rules"].setdefault("result_status_values", ["pending", "won", "lost", "void"])
    data["rules"].setdefault("supported_markets", SUPPORTED_MARKETS)
    return data


def tahmin_gecmisi_yaz(
    history: dict[str, Any],
    file_path: str | Path = DEFAULT_HISTORY_FILE,
) -> Path:
    """Tahmin gecmisini diske yazar."""
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    history["updated_at"] = simdi_iso()
    history["prediction_count"] = len(history.get("predictions", []))
    path.write_text(json.dumps(history, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def tahmin_id_uret(recommendation: dict[str, Any]) -> str:
    """Tahmin icin tekrar edilebilir kimlik uretir."""
    match_id = recommendation.get("match_id") or recommendation.get("mac") or "unknown"
    market = recommendation.get("market") or "UNKNOWN"
    prediction_date = str(
        recommendation.get("prediction_date")
        or recommendation.get("utc_date")
        or recommendation.get("match_date")
        or ""
    )[:10]
    if not prediction_date:
        prediction_date = datetime.now(timezone.utc).date().isoformat()
    return f"{prediction_date}:{match_id}:{market}"


def kupon_onerisinden_tahmin_kaydi_uret(
    recommendation: dict[str, Any],
    source_report: str = "bugunun_en_guclu_maclari",
) -> dict[str, Any]:
    """Kupon motoru tek mac onerisini performans takip kaydina cevirir."""
    market = recommendation.get("market")
    return {
        "prediction_id": tahmin_id_uret(recommendation),
        "created_at": simdi_iso(),
        "prediction_date": str(
            recommendation.get("prediction_date")
            or recommendation.get("utc_date")
            or recommendation.get("match_date")
            or datetime.now(timezone.utc).date().isoformat()
        )[:10],
        "source_report": source_report,
        "match_id": recommendation.get("match_id"),
        "match": recommendation.get("mac"),
        "home_team": recommendation.get("home_team"),
        "away_team": recommendation.get("away_team"),
        "competition_name": recommendation.get("competition_name"),
        "league": recommendation.get("competition_name"),
        "prediction_type": market,
        "market": market,
        "market_name": recommendation.get("market_adi"),
        "recommended_odds": recommendation.get("recommended_odds")
        or recommendation.get("odds")
        or recommendation.get("oran"),
        "market_score": recommendation.get("market_score"),
        "guc_skoru": recommendation.get("guc_skoru"),
        "confidence": recommendation.get("confidence"),
        "confidence_score": recommendation.get("confidence_score"),
        "recommendation_score": recommendation.get("recommendation_score"),
        "risk_score": recommendation.get("risk_score"),
        "risk_level": recommendation.get("risk_level"),
        "result_status": "pending",
        "actual_home_goals": None,
        "actual_away_goals": None,
        "actual_result": None,
        "result_note": None,
        "settled_at": None,
    }


def manuel_tahmin_kaydi_uret(
    match: str,
    league: str,
    market: str,
    prediction_date: str,
    recommended_odds: float | None = None,
    confidence: str | None = None,
    confidence_score: float | None = None,
    guc_skoru: float | None = None,
    match_id: str | int | None = None,
    home_team: str | None = None,
    away_team: str | None = None,
    source_report: str = "manual_entry",
) -> dict[str, Any]:
    """
    Elle girilen veya baska bir rapordan gelen tahmini standart kayda cevirir.
    """
    recommendation = {
        "prediction_date": prediction_date,
        "match_id": match_id,
        "mac": match,
        "home_team": home_team,
        "away_team": away_team,
        "competition_name": league,
        "market": market,
        "market_adi": market,
        "recommended_odds": recommended_odds,
        "confidence": confidence,
        "confidence_score": confidence_score,
        "guc_skoru": guc_skoru,
    }
    return kupon_onerisinden_tahmin_kaydi_uret(recommendation, source_report=source_report)


def tahmin_kayitlarini_ekle(
    history: dict[str, Any],
    recommendations: list[dict[str, Any]],
    source_report: str = "bugunun_en_guclu_maclari",
) -> tuple[dict[str, Any], dict[str, int]]:
    """
    Tek mac onerilerini tahmin gecmisine tekrar etmeden ekler.
    """
    existing = {
        item.get("prediction_id"): item
        for item in history.get("predictions", [])
    }
    duplicate_count = 0
    new_count = 0

    for recommendation in recommendations:
        record = kupon_onerisinden_tahmin_kaydi_uret(recommendation, source_report)
        prediction_id = record["prediction_id"]
        if prediction_id in existing:
            duplicate_count += 1
            continue
        existing[prediction_id] = record
        new_count += 1

    history["predictions"] = list(existing.values())
    history["prediction_count"] = len(history["predictions"])
    history["updated_at"] = simdi_iso()
    return history, {
        "incoming_predictions": len(recommendations),
        "new_predictions_added": new_count,
        "duplicate_predictions": duplicate_count,
        "total_predictions": len(history["predictions"]),
    }


def market_kazandi_mi(
    market: str | None,
    home_goals: int | None,
    away_goals: int | None,
) -> bool | None:
    """Desteklenen marketler icin mac sonucuna gore kazandi/kaybetti doner."""
    if home_goals is None or away_goals is None:
        return None
    total_goals = home_goals + away_goals
    both_scored = home_goals > 0 and away_goals > 0
    home_win = home_goals > away_goals
    draw = home_goals == away_goals
    away_win = away_goals > home_goals

    if market == "KG_VAR":
        return both_scored
    if market == "UST_25":
        return total_goals > 2.5
    if market == "MS1":
        return home_win
    if market == "MSX":
        return draw
    if market == "MS2":
        return away_win
    if market == "CIFTE_SANS_1X":
        return home_win or draw
    if market == "CIFTE_SANS_12":
        return home_win or away_win
    if market == "CIFTE_SANS_X2":
        return draw or away_win
    return None


def tahmin_sonucunu_dogrula(
    prediction: dict[str, Any],
    home_goals: int | None,
    away_goals: int | None,
) -> dict[str, Any]:
    """Tek tahmini gercek skorla sonuclandirir."""
    won = market_kazandi_mi(prediction.get("market"), home_goals, away_goals)
    updated = dict(prediction)
    updated["actual_home_goals"] = home_goals
    updated["actual_away_goals"] = away_goals
    updated["actual_result"] = skor_sonucu_etiketi(home_goals, away_goals)
    updated["settled_at"] = simdi_iso()
    if won is None:
        updated["result_status"] = "void"
    else:
        updated["result_status"] = "won" if won else "lost"
    return updated


def skor_sonucu_etiketi(home_goals: int | None, away_goals: int | None) -> str | None:
    """Skordan MS sonucu etiketi uretir."""
    if home_goals is None or away_goals is None:
        return None
    if home_goals > away_goals:
        return "MS1"
    if home_goals < away_goals:
        return "MS2"
    return "MSX"


def tahmin_sonucunu_durumla_isaretle(
    history: dict[str, Any],
    prediction_id: str,
    result_status: str,
    home_goals: int | None = None,
    away_goals: int | None = None,
    result_note: str | None = None,
) -> dict[str, Any]:
    """
    Bir tahmini ID ile bulur ve elle sonuc durumuna alir.

    `result_status` degeri pending, won, lost veya void olmali.
    """
    if result_status not in {"pending", "won", "lost", "void"}:
        raise ValueError("result_status pending, won, lost veya void olmali.")

    updated_predictions = []
    found = False
    for prediction in history.get("predictions", []):
        if prediction.get("prediction_id") != prediction_id:
            updated_predictions.append(prediction)
            continue

        updated = dict(prediction)
        updated["result_status"] = result_status
        updated["actual_home_goals"] = home_goals
        updated["actual_away_goals"] = away_goals
        updated["actual_result"] = skor_sonucu_etiketi(home_goals, away_goals)
        updated["result_note"] = result_note
        updated["settled_at"] = simdi_iso() if result_status != "pending" else None
        updated_predictions.append(updated)
        found = True

    if not found:
        raise KeyError(f"Tahmin bulunamadi: {prediction_id}")

    history["predictions"] = updated_predictions
    history["updated_at"] = simdi_iso()
    history["prediction_count"] = len(updated_predictions)
    return history


def tahmin_sonucunu_skorla_isaretle(
    history: dict[str, Any],
    prediction_id: str,
    home_goals: int,
    away_goals: int,
    result_note: str | None = None,
) -> dict[str, Any]:
    """Bir tahmini mac skoruyla otomatik won/lost/void olarak isaretler."""
    updated_predictions = []
    found = False
    for prediction in history.get("predictions", []):
        if prediction.get("prediction_id") != prediction_id:
            updated_predictions.append(prediction)
            continue

        updated = tahmin_sonucunu_dogrula(prediction, home_goals, away_goals)
        updated["result_note"] = result_note
        updated_predictions.append(updated)
        found = True

    if not found:
        raise KeyError(f"Tahmin bulunamadi: {prediction_id}")

    history["predictions"] = updated_predictions
    history["updated_at"] = simdi_iso()
    history["prediction_count"] = len(updated_predictions)
    return history


def oran_hesapla(won: int, lost: int) -> float | None:
    """Won/lost uzerinden basari orani hesaplar."""
    total = won + lost
    if total == 0:
        return None
    return round((won / total) * 100, 2)


def grup_ozeti_uret(records: list[dict[str, Any]], group_key: str) -> list[dict[str, Any]]:
    """Market, lig veya confidence gibi alanlara gore basari ozeti uretir."""
    buckets: dict[str, dict[str, int]] = {}
    for record in records:
        key = str(record.get(group_key) or "unknown")
        bucket = buckets.setdefault(key, {"won": 0, "lost": 0, "pending": 0, "void": 0})
        status = str(record.get("result_status") or "pending")
        if status not in bucket:
            status = "pending"
        bucket[status] += 1

    rows = []
    for key, counts in sorted(buckets.items()):
        rows.append(
            {
                group_key: key,
                **counts,
                "success_rate": oran_hesapla(counts["won"], counts["lost"]),
            }
        )
    return rows


def basari_ozeti_hesapla(history: dict[str, Any]) -> dict[str, Any]:
    """Tahmin gecmisinden genel, market ve lig bazli basari ozetleri uretir."""
    records = list(history.get("predictions", []))
    counts = {"won": 0, "lost": 0, "pending": 0, "void": 0}
    for record in records:
        status = str(record.get("result_status") or "pending")
        if status not in counts:
            status = "pending"
        counts[status] += 1

    return {
        "prediction_count": len(records),
        "settled_count": counts["won"] + counts["lost"],
        "pending_count": counts["pending"],
        "void_count": counts["void"],
        "won": counts["won"],
        "lost": counts["lost"],
        "overall_success_rate": oran_hesapla(counts["won"], counts["lost"]),
        "by_market": grup_ozeti_uret(records, "market"),
        "by_prediction_type": grup_ozeti_uret(records, "prediction_type"),
        "by_league": grup_ozeti_uret(records, "competition_name"),
        "by_confidence": grup_ozeti_uret(records, "confidence"),
        "generated_at": simdi_iso(),
    }


def basari_markdown_uret(summary: dict[str, Any]) -> str:
    """Basari ozetini Markdown raporuna cevirir."""
    rate = summary.get("overall_success_rate")
    rate_text = "-" if rate is None else f"%{rate}"
    lines = [
        "# Basari Yuzdesi Raporu",
        "",
        "## Rapor Bilgisi",
        "",
        f"OLUSTURMA_ZAMANI: {summary.get('generated_at')}",
        f"TOPLAM_TAHMIN: {summary.get('prediction_count')}",
        f"SONUCLANAN_TAHMIN: {summary.get('settled_count')}",
        f"BEKLEYEN_TAHMIN: {summary.get('pending_count')}",
        f"VOID_TAHMIN: {summary.get('void_count')}",
        f"GENEL_BASARI_ORANI: {rate_text}",
        "",
        "## Durum",
        "",
    ]
    if summary.get("settled_count", 0) == 0:
        lines.extend(
            [
                "Henuz sonuc dogrulanmis tahmin yok. Bu nedenle basari yuzdesi hesaplanmadi.",
                "",
                "Faz 4'te mac sonuclari API'den tekrar cekilecek, bekleyen tahminler mac skoruyla eslestirilecek ve market bazli basari oranlari otomatik guncellenecek.",
            ]
        )
    else:
        lines.append("Sonuclanmis tahminlerden basari yuzdesi hesaplandi.")

    lines.extend(
        [
            "",
            "## Market Bazli Basari",
            "",
            "| Market | Won | Lost | Pending | Void | Basari |",
            "|---|---:|---:|---:|---:|---:|",
        ]
    )
    market_rows = summary.get("by_market", [])
    if not market_rows:
        lines.append("| - | 0 | 0 | 0 | 0 | - |")
    for row in market_rows:
        success = row["success_rate"]
        lines.append(
            "| {market} | {won} | {lost} | {pending} | {void} | {success} |".format(
                market=row.get("market"),
                won=row["won"],
                lost=row["lost"],
                pending=row["pending"],
                void=row["void"],
                success="-" if success is None else f"%{success}",
            )
        )

    lines.extend(
        [
            "",
            "## Tahmin Turu Bazli Basari",
            "",
            "| Tahmin Turu | Won | Lost | Pending | Void | Basari |",
            "|---|---:|---:|---:|---:|---:|",
        ]
    )
    prediction_type_rows = summary.get("by_prediction_type", [])
    if not prediction_type_rows:
        lines.append("| - | 0 | 0 | 0 | 0 | - |")
    for row in prediction_type_rows:
        success = row["success_rate"]
        lines.append(
            "| {prediction_type} | {won} | {lost} | {pending} | {void} | {success} |".format(
                prediction_type=row.get("prediction_type"),
                won=row["won"],
                lost=row["lost"],
                pending=row["pending"],
                void=row["void"],
                success="-" if success is None else f"%{success}",
            )
        )

    lines.extend(
        [
            "",
            "## Lig Bazli Basari",
            "",
            "| Lig | Won | Lost | Pending | Void | Basari |",
            "|---|---:|---:|---:|---:|---:|",
        ]
    )
    league_rows = summary.get("by_league", [])
    if not league_rows:
        lines.append("| - | 0 | 0 | 0 | 0 | - |")
    for row in league_rows:
        success = row["success_rate"]
        lines.append(
            "| {league} | {won} | {lost} | {pending} | {void} | {success} |".format(
                league=row.get("competition_name"),
                won=row["won"],
                lost=row["lost"],
                pending=row["pending"],
                void=row["void"],
                success="-" if success is None else f"%{success}",
            )
        )

    lines.extend(
        [
            "",
            "## Confidence Bazli Basari",
            "",
            "| Confidence | Won | Lost | Pending | Void | Basari |",
            "|---|---:|---:|---:|---:|---:|",
        ]
    )
    confidence_rows = summary.get("by_confidence", [])
    if not confidence_rows:
        lines.append("| - | 0 | 0 | 0 | 0 | - |")
    for row in confidence_rows:
        success = row["success_rate"]
        lines.append(
            "| {confidence} | {won} | {lost} | {pending} | {void} | {success} |".format(
                confidence=row.get("confidence"),
                won=row["won"],
                lost=row["lost"],
                pending=row["pending"],
                void=row["void"],
                success="-" if success is None else f"%{success}",
            )
        )

    lines.extend(
        [
            "",
            "## Faz 5 Notu",
            "",
            "- Tahmin gecmisi `data/tahmin_gecmisi.json` dosyasinda tutulacak.",
            "- Her tahmin once `pending` olarak kaydedilecek.",
            "- Mac sonucu kesinlesince `won`, `lost` veya `void` durumuna alinacak.",
            "- Genel, market bazli, lig bazli ve confidence bazli basari oranlari bu rapordan izlenecek.",
            "- KG Var, Ust 2.5, MS1 ve Cifte Sans marketleri ayri takip edilecek.",
        ]
    )
    return "\n".join(lines)


def basari_raporu_uret(
    history_file: str | Path = DEFAULT_HISTORY_FILE,
    output_file: str | Path = DEFAULT_SUCCESS_REPORT_FILE,
) -> dict[str, Any]:
    """Tahmin gecmisinden basari yuzdesi raporu olusturur."""
    history = tahmin_gecmisi_oku(history_file)
    summary = basari_ozeti_hesapla(history)
    markdown = basari_markdown_uret(summary)
    output_path = Path(output_file)
    write_error = None
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(markdown, encoding="utf-8")
    except OSError as exc:
        write_error = str(exc)
    return {
        "output_file": str(output_path),
        "write_error": write_error,
        "summary": summary,
        "markdown": markdown,
    }


if __name__ == "__main__":
    result = basari_raporu_uret()
    print(result["markdown"])

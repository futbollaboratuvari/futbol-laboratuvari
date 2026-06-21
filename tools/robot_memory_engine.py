#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Futbol Laboratuvarı - Robot Hafıza Motoru

Görev:
- data/analiz_sonuclari.json, data/robot-analysis.json, data/live-matches.json ve data/daily-coupons.json dosyalarını okur.
- Tahminleri, sonuçları, ligleri, takımları, marketleri ve oran aralıklarını hafızaya işler.
- data/robot_hafiza.json ve outputs/robot_hafiza_raporu.md dosyalarını günceller.

Not:
- Güncel veri yoksa eski veri uydurmaz.
- Robot kupon onaylamaz; sadece analiz ve kayıt üretir.
"""

from __future__ import annotations

import json
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT / "outputs"
MEMORY_PATH = DATA_DIR / "robot_hafiza.json"
HISTORY_PATH = DATA_DIR / "analiz_sonuclari.json"
ANALYSIS_PATH = DATA_DIR / "robot-analysis.json"
LIVE_MATCHES_PATH = DATA_DIR / "live-matches.json"
DAILY_COUPONS_PATH = DATA_DIR / "daily-coupons.json"
REPORT_PATH = OUTPUT_DIR / "robot_hafiza_raporu.md"

ISTANBUL = timezone(timedelta(hours=3))

MARKETS = [
    "KG Var",
    "İlk Yarı KG Var",
    "İkinci Yarı KG Var",
    "2.5 Üst",
    "3.5 Üst",
]

ODDS_BUCKETS = [
    (1.01, 1.49, "1.01-1.49"),
    (1.50, 1.99, "1.50-1.99"),
    (2.00, 2.99, "2.00-2.99"),
    (3.00, 4.99, "3.00-4.99"),
    (5.00, 999.0, "5.00+"),
]


def now_iso() -> str:
    return datetime.now(ISTANBUL).replace(microsecond=0).isoformat()


def read_json(path: Path, fallback: Any) -> Any:
    try:
        if not path.exists():
            return fallback
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def safe_text(value: Any, default: str = "-") -> str:
    if value is None:
        return default
    text = str(value).strip()
    return text if text else default


def parse_float(value: Any) -> float:
    try:
        if value is None:
            return 0.0
        text = str(value).replace(",", ".")
        number = "".join(ch for ch in text if ch.isdigit() or ch == ".")
        return float(number) if number else 0.0
    except Exception:
        return 0.0


def normalize_result(value: Any) -> str:
    text = safe_text(value, "bekliyor").lower()
    if any(key in text for key in ["kazandı", "kazandi", "won", "win", "tuttu", "başarılı", "basarili"]):
        return "kazandı"
    if any(key in text for key in ["kaybetti", "lost", "loss", "yattı", "yatti", "başarısız", "basarisiz"]):
        return "kaybetti"
    if any(key in text for key in ["iptal", "void", "push", "iade"]):
        return "iade"
    return "bekliyor"


def normalize_market(value: Any) -> str:
    text = safe_text(value, "-")
    lower = text.lower()
    if "ilk" in lower and "kg" in lower:
        return "İlk Yarı KG Var"
    if "1y" in lower and "kg" in lower:
        return "İlk Yarı KG Var"
    if "ikinci" in lower and "kg" in lower:
        return "İkinci Yarı KG Var"
    if "2y" in lower and "kg" in lower:
        return "İkinci Yarı KG Var"
    if "kg" in lower and "var" in lower:
        return "KG Var"
    if "3.5" in lower and ("üst" in lower or "ust" in lower or "over" in lower):
        return "3.5 Üst"
    if "2.5" in lower and ("üst" in lower or "ust" in lower or "over" in lower):
        return "2.5 Üst"
    return text


def odds_bucket(odds: float) -> str:
    for low, high, label in ODDS_BUCKETS:
        if low <= odds <= high:
            return label
    return "bilinmiyor"


def split_match_name(match_name: str) -> Tuple[str, str]:
    for sep in [" - ", " v ", " vs ", "–", "—"]:
        if sep in match_name:
            left, right = match_name.split(sep, 1)
            return safe_text(left), safe_text(right)
    return match_name, "-"


def default_memory() -> Dict[str, Any]:
    return {
        "schema_version": "1.0.0",
        "generated_at": now_iso(),
        "timezone": "Europe/Istanbul",
        "project": "Futbol Laboratuvarı AI Analiz Robotu",
        "status": "Öğrenen hafıza sistemi aktif",
        "rules": {
            "no_fake_data": True,
            "show_empty_when_no_current_data": True,
            "no_bet_approval": True,
            "user_final_decision": True,
            "track_every_prediction": True,
            "track_failure_reason": True,
        },
        "prediction_log": [],
        "result_log": [],
        "market_performance": {},
        "league_memory": {},
        "team_memory": {},
        "odds_memory": {},
        "coupon_performance": {},
        "error_memory": [],
        "learning_notes": [],
    }


def collect_predictions(history: Dict[str, Any], analysis: Dict[str, Any], live: Dict[str, Any]) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    sources = [
        ("analiz_sonuclari.active_items", history.get("active_items", [])),
        ("analiz_sonuclari.predictions", history.get("predictions", [])),
        ("analiz_sonuclari.completed_items", history.get("completed_items", [])),
        ("robot-analysis.matches", analysis.get("matches", [])),
        ("live-matches.matches", live.get("matches", [])),
    ]
    seen = set()
    for source_name, items in sources:
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            match_name = safe_text(item.get("match_name") or item.get("match") or f"{item.get('home_team_name', '')} - {item.get('away_team_name', '')}")
            market = normalize_market(item.get("recommended_market") or item.get("prediction") or item.get("tahmin") or item.get("market"))
            date = safe_text(item.get("date") or item.get("match_date") or item.get("generated_at") or history.get("generated_at"), "-")
            key = (date, match_name, market)
            if key in seen:
                continue
            seen.add(key)
            odds = parse_float(item.get("estimated_odds") or item.get("odds") or item.get("oran"))
            result = normalize_result(item.get("result") or item.get("sonuc") or item.get("status"))
            home, away = split_match_name(match_name)
            rows.append({
                "date": date,
                "league": safe_text(item.get("league") or item.get("competition_name")),
                "match_name": match_name,
                "home_team": safe_text(item.get("home_team") or item.get("home_team_name") or home),
                "away_team": safe_text(item.get("away_team") or item.get("away_team_name") or away),
                "market": market,
                "odds": odds,
                "risk_level": safe_text(item.get("risk_level")),
                "confidence_score": safe_text(item.get("confidence_score") or item.get("analysis_score")),
                "result": result,
                "score": safe_text(item.get("score") or item.get("real_score") or item.get("actual_score")),
                "reason": safe_text(item.get("robot_reason") or item.get("robot_comment") or item.get("reason")),
                "failure_reason": safe_text(item.get("failure_reason") or item.get("yanilma_sebebi"), ""),
                "source": source_name,
            })
    return rows


def stat_template() -> Dict[str, Any]:
    return {"total": 0, "won": 0, "lost": 0, "push": 0, "pending": 0, "success_rate": 0, "avg_odds": 0}


def update_stat(stat: Dict[str, Any], result: str, odds: float) -> None:
    stat["total"] += 1
    if result == "kazandı":
        stat["won"] += 1
    elif result == "kaybetti":
        stat["lost"] += 1
    elif result == "iade":
        stat["push"] += 1
    else:
        stat["pending"] += 1
    if odds:
        stat.setdefault("_odds_sum", 0.0)
        stat.setdefault("_odds_count", 0)
        stat["_odds_sum"] += odds
        stat["_odds_count"] += 1


def finalize_stat(stat: Dict[str, Any]) -> Dict[str, Any]:
    settled = stat.get("won", 0) + stat.get("lost", 0)
    stat["success_rate"] = round((stat.get("won", 0) / settled) * 100, 2) if settled else 0
    count = stat.pop("_odds_count", 0)
    odds_sum = stat.pop("_odds_sum", 0.0)
    stat["avg_odds"] = round(odds_sum / count, 2) if count else 0
    return stat


def build_memory() -> Dict[str, Any]:
    memory = read_json(MEMORY_PATH, default_memory())
    history = read_json(HISTORY_PATH, {})
    analysis = read_json(ANALYSIS_PATH, {})
    live = read_json(LIVE_MATCHES_PATH, {})
    coupons = read_json(DAILY_COUPONS_PATH, {})

    predictions = collect_predictions(history, analysis, live)
    market_stats = defaultdict(stat_template)
    league_stats = defaultdict(stat_template)
    team_stats = defaultdict(stat_template)
    odds_stats = defaultdict(stat_template)
    result_log: List[Dict[str, Any]] = []
    error_memory: List[Dict[str, Any]] = []

    for row in predictions:
        result = row["result"]
        odds = row["odds"]
        update_stat(market_stats[row["market"]], result, odds)
        update_stat(league_stats[row["league"]], result, odds)
        update_stat(odds_stats[odds_bucket(odds)], result, odds)
        update_stat(team_stats[row["home_team"]], result, odds)
        update_stat(team_stats[row["away_team"]], result, odds)
        if result in ["kazandı", "kaybetti", "iade"]:
            result_log.append(row)
        if result == "kaybetti":
            error_memory.append({
                "date": row["date"],
                "match_name": row["match_name"],
                "market": row["market"],
                "odds": row["odds"],
                "failure_reason": row["failure_reason"] or "Yanılma sebebi henüz girilmedi",
                "source": row["source"],
            })

    for market in MARKETS:
        market_stats.setdefault(market, stat_template())
    for _, _, bucket in ODDS_BUCKETS:
        odds_stats.setdefault(bucket, stat_template())

    coupon_stats = {
        "dengeli": stat_template(),
        "yüksek_oran": stat_template(),
        "riskli": stat_template(),
    }
    coupon_data = coupons.get("coupons", {}) if isinstance(coupons, dict) else {}
    for key, label in [("balanced", "dengeli"), ("laboratory_today", "dengeli"), ("high_value", "yüksek_oran"), ("risk_lab", "riskli")]:
        coupon = coupon_data.get(key, {}) if isinstance(coupon_data, dict) else {}
        if isinstance(coupon, dict) and coupon.get("is_available"):
            coupon_stats[label]["total"] += 1
            coupon_stats[label]["pending"] += 1
            total_odds = parse_float(coupon.get("total_odds"))
            if total_odds:
                coupon_stats[label].setdefault("_odds_sum", 0.0)
                coupon_stats[label].setdefault("_odds_count", 0)
                coupon_stats[label]["_odds_sum"] += total_odds
                coupon_stats[label]["_odds_count"] += 1

    memory.update({
        "generated_at": now_iso(),
        "status": "Öğrenen hafıza sistemi aktif",
        "prediction_log": predictions,
        "result_log": result_log,
        "market_performance": {k: finalize_stat(v) for k, v in sorted(market_stats.items())},
        "league_memory": {k: finalize_stat(v) for k, v in sorted(league_stats.items()) if k != "-"},
        "team_memory": {k: finalize_stat(v) for k, v in sorted(team_stats.items()) if k != "-"},
        "odds_memory": {k: finalize_stat(v) for k, v in sorted(odds_stats.items())},
        "coupon_performance": {k: finalize_stat(v) for k, v in sorted(coupon_stats.items())},
        "error_memory": error_memory,
        "learning_notes": [
            "Robot her tahmini prediction_log içine alır.",
            "Sonuçlanan tahminler result_log içine düşer.",
            "Market, lig, takım ve oran aralığı başarıları otomatik hesaplanır.",
            "Kaybeden tahminlerde failure_reason alanı zorunlu takip edilir.",
            "Güncel veri yoksa robot eski veri uydurmaz, boş veri raporu üretir.",
        ],
    })
    return memory


def build_report(memory: Dict[str, Any]) -> str:
    def table(stats: Dict[str, Any], limit: int = 12) -> str:
        if not stats:
            return "Veri yok."
        rows = ["| Başlık | Toplam | Kazandı | Kaybetti | Bekliyor | Başarı | Ortalama Oran |", "|---|---:|---:|---:|---:|---:|---:|"]
        for name, s in list(stats.items())[:limit]:
            rows.append(f"| {name} | {s.get('total', 0)} | {s.get('won', 0)} | {s.get('lost', 0)} | {s.get('pending', 0)} | %{s.get('success_rate', 0)} | {s.get('avg_odds', 0)} |")
        return "\n".join(rows)

    prediction_count = len(memory.get("prediction_log", []))
    result_count = len(memory.get("result_log", []))
    error_count = len(memory.get("error_memory", []))
    return f"""# Robot Hafıza Raporu

Güncelleme: {memory.get('generated_at')}

## Genel Durum

- Hafıza durumu: {memory.get('status')}
- Toplam tahmin kaydı: {prediction_count}
- Sonuçlanan tahmin: {result_count}
- Yanılma kaydı: {error_count}
- Güvenlik: Robot kupon onaylamaz, para yatırmaz, para çekmez. Son karar kullanıcıya aittir.

## Market Performansı

{table(memory.get('market_performance', {}))}

## Oran Aralığı Performansı

{table(memory.get('odds_memory', {}))}

## Lig Hafızası

{table(memory.get('league_memory', {}))}

## Takım Hafızası

{table(memory.get('team_memory', {}))}

## Eksik / Takip Edilecek Alanlar

- Kaybeden tahminlerde yanılma sebebi boşsa manuel veya otomatik sebep girilecek.
- Veri kaynağı güçlendikçe lig ve takım hafızası dolacak.
- Güncel veri yoksa eski veri gösterilmeyecek.
"""


def main() -> None:
    memory = build_memory()
    write_json(MEMORY_PATH, memory)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(build_report(memory), encoding="utf-8")
    print(f"Robot hafızası güncellendi: {MEMORY_PATH}")
    print(f"Rapor üretildi: {REPORT_PATH}")


if __name__ == "__main__":
    main()

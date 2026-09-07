"""
Futbol Laboratuvari tek tik robot giris noktasi.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any

try:
    from api_secrets import ActiveApiSecret, get_active_api_secret, load_dotenv
    from gunun_maclari_tarayici import (
        DEFAULT_OUTPUT_FILE,
        aralik_maclarini_analiz_et,
        markdown_raporu_uret,
        raporu_dosyaya_yaz,
        tum_bulunan_maclari_cikar,
    )
    from ham_veri_havuzu import DEFAULT_RAW_POOL_FILE, havuz_oku, havuz_yaz, maclari_havuza_ekle
    from ilk_veri_toplayici import FootballDataClient
    from kupon_motoru import (
        kombinasyon_kuponlari_uret,
        kupon_markdown_uret,
        kupon_raporu_analiz_sonuclarindan_uret,
        yerel_mac_verisini_yukle,
        yerel_ornek_kupon_raporu_uret,
    )
    from mackolik_veri_cekici import mackolik_veri_cekme_isini_calistir
    from performans_takip import (
        DEFAULT_HISTORY_FILE,
        DEFAULT_SUCCESS_REPORT_FILE,
        basari_markdown_uret,
        basari_ozeti_hesapla,
        tahmin_gecmisi_oku,
        tahmin_gecmisi_yaz,
        tahmin_kayitlarini_ekle,
    )
    from veri_kaynagi_yoneticisi import kaynak_secimli_mac_taramasi
except ImportError:
    from src.api_secrets import ActiveApiSecret, get_active_api_secret, load_dotenv
    from src.gunun_maclari_tarayici import (
        DEFAULT_OUTPUT_FILE,
        aralik_maclarini_analiz_et,
        markdown_raporu_uret,
        raporu_dosyaya_yaz,
        tum_bulunan_maclari_cikar,
    )
    from src.ham_veri_havuzu import DEFAULT_RAW_POOL_FILE, havuz_oku, havuz_yaz, maclari_havuza_ekle
    from src.ilk_veri_toplayici import FootballDataClient
    from src.kupon_motoru import (
        kombinasyon_kuponlari_uret,
        kupon_markdown_uret,
        kupon_raporu_analiz_sonuclarindan_uret,
        yerel_mac_verisini_yukle,
        yerel_ornek_kupon_raporu_uret,
    )
    from src.mackolik_veri_cekici import mackolik_veri_cekme_isini_calistir
    from src.performans_takip import (
        DEFAULT_HISTORY_FILE,
        DEFAULT_SUCCESS_REPORT_FILE,
        basari_markdown_uret,
        basari_ozeti_hesapla,
        tahmin_gecmisi_oku,
        tahmin_gecmisi_yaz,
        tahmin_kayitlarini_ekle,
    )
    from src.veri_kaynagi_yoneticisi import kaynak_secimli_mac_taramasi


def uygulama_kok_dizini() -> Path:
    """Launcher, EXE veya dogrudan Python calismasinda uygulama kokunu bulur."""
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve().parent
    return Path(__file__).resolve().parents[1]


PROJECT_ROOT = uygulama_kok_dizini()
os.chdir(PROJECT_ROOT)

ROBOT_OUTPUT_FILE = PROJECT_ROOT / "outputs" / "bugunun_en_guclu_maclari.md"
ROBOT_SUCCESS_REPORT_FILE = PROJECT_ROOT / "outputs" / "basari_yuzdesi_raporu.md"
ROBOT_HISTORY_FILE = PROJECT_ROOT / "data" / "tahmin_gecmisi.json"
ROBOT_RAW_POOL_FILE = PROJECT_ROOT / "data" / "ham_mac_havuzu.json"
ROBOT_MACKOLIK_REPORT_FILE = PROJECT_ROOT / "outputs" / "mackolik_veri_cekme_raporu.md"

ROBOT_LEARNING_WEIGHTS = {
    "base_market_signal": 0.50,
    "team_statistics": 0.30,
    "h2h_history": 0.20,
}
ROBOT_RECOMMENDATION_WEIGHTS = {
    "power_score": 0.35,
    "confidence_score": 0.25,
    "learned_market_score": 0.40,
}
ROBOT_H2H_LIMIT = 10
ROBOT_H2H_FULL_WEIGHT_MATCHES = 5


def calisma_klasorlerini_hazirla() -> None:
    """Robot baslamadan once yazilacak klasorleri kesin olusturur."""
    (PROJECT_ROOT / "outputs").mkdir(parents=True, exist_ok=True)
    (PROJECT_ROOT / "data").mkdir(parents=True, exist_ok=True)


def secretleri_yukle() -> None:
    """Yerel `.env` dosyasini, varsa, ortam degiskenlerine yukler."""
    load_dotenv(PROJECT_ROOT)


def aktif_secret_bilgisi() -> ActiveApiSecret:
    """PRO 12.2 fallback zincirine gore aktif veri kaynagini doner."""
    secretleri_yukle()
    return get_active_api_secret()


def ortam_uyarilari(active_secret: ActiveApiSecret) -> list[str]:
    """Eksik ortam degiskenleri icin kullanici uyarilari uretir."""
    warnings = []
    if active_secret.is_demo:
        warnings.append("API anahtari bulunamadi. Demo mod aktif.")
    elif active_secret.env_name != "FOOTBALL_DATA_API_KEY":
        warnings.append("FOOTBALL_DATA_API_KEY tanimli degil; fallback kaynak kullaniliyor.")
    return warnings


def canli_mod_mumkun_mu(active_secret: ActiveApiSecret) -> bool:
    """En az bir canli API anahtari varsa canli mod denenebilir."""
    return not active_secret.is_demo


def aktif_veri_kaynagi_markdownu(active_secret: ActiveApiSecret) -> str:
    """Raporlara aktif veri kaynagi bilgisini ekler."""
    key_name = active_secret.env_name or "YOK"
    return "\n".join(
        [
            "## Aktif Veri Kaynağı",
            "",
            f"- {active_secret.data_source}",
            f"- Kullanılan Secret: {key_name}",
        ]
    )


def mackolik_adimini_guvenli_calistir() -> dict[str, object]:
    """
    Mackolik veri cekme adimini ana robotu durdurmadan calistirir.

    Bu adim sadece gorunen mac/oran verilerini okumaya calisir. Kupon, bahis,
    uyelik veya odeme aksiyonlariyla ilgili hicbir islem yapmaz.
    """
    try:
        return mackolik_veri_cekme_isini_calistir(
            raw_pool_file=ROBOT_RAW_POOL_FILE,
            report_file=ROBOT_MACKOLIK_REPORT_FILE,
            headless=True,
        )
    except Exception as exc:
        return {
            "status": "error",
            "errors": [str(exc)],
            "found_matches": 0,
            "saved_matches": 0,
            "duplicate_matches": 0,
            "raw_pool_total_matches": None,
            "ready": False,
        }


def mackolik_durum_markdownu_uret(result: dict[str, object]) -> str:
    """Ana rapora Mackolik veri cekme adiminin kisa durumunu ekler."""
    errors = result.get("errors") or []
    lines = [
        "## Mackolik Veri Cekme Durumu",
        "",
        f"- Durum: {result.get('status')}",
        f"- Bulunan mac: {result.get('found_matches')}",
        f"- Yeni kaydedilen mac: {result.get('saved_matches')}",
        f"- Tekrar mac: {result.get('duplicate_matches')}",
        f"- Ham havuz toplam mac: {result.get('raw_pool_total_matches')}",
        f"- Rapor: {ROBOT_MACKOLIK_REPORT_FILE}",
    ]
    if errors:
        lines.append("- Hata: " + "; ".join(str(error) for error in errors[:3]))
    return "\n".join(lines)


def robot_skorunu_sinirla(value: float) -> float:
    """PRO Robot ogrenme skorunu 0-100 araliginda tutar."""
    return round(max(0.0, min(100.0, value)), 2)


def robot_risk_seviyesi(risk_score: float) -> str:
    """Mevcut kupon motoru ile ayni risk etiketlerini korur."""
    if risk_score <= 25:
        return "dusuk"
    if risk_score <= 50:
        return "orta"
    if risk_score <= 75:
        return "yuksek"
    return "cok_yuksek"


def robot_float(value: Any) -> float:
    """Bos veya bozuk sayisal alanlari robotu bozmadan sifira cevirir."""
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def robot_int_or_none(value: Any) -> int | None:
    """Gol alanlarini guvenli tam sayiya cevirir."""
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def robot_takim_adi_normalize(value: Any) -> str:
    """Farkli kaynaklardaki takim adlarini H2H eslestirmesi icin normalize eder."""
    return " ".join(str(value or "").strip().casefold().split())


def robot_takim_bilgisi(match: dict[str, Any], side: str) -> tuple[Any, str]:
    """Ham havuzdaki farkli takim alan adlarini tek kimlige indirger."""
    nested = match.get(f"{side}Team")
    nested_dict = nested if isinstance(nested, dict) else {}
    team_id = (
        match.get(f"{side}_team_id")
        or match.get(f"{side}TeamId")
        or nested_dict.get("id")
    )
    team_name = (
        match.get(f"{side}_team_name")
        or match.get(f"{side}_team")
        or match.get(f"{side}TeamName")
        or nested_dict.get("name")
        or (nested if isinstance(nested, str) else "")
    )
    return team_id, robot_takim_adi_normalize(team_name)


def robot_takim_eslesiyor(
    candidate_id: Any,
    candidate_name: str,
    target_id: Any,
    target_name: Any,
) -> bool:
    """Once takim ID, yoksa normalize isim ile guvenli eslestirme yapar."""
    if candidate_id is not None and target_id is not None:
        return str(candidate_id) == str(target_id)
    normalized_target = robot_takim_adi_normalize(target_name)
    return bool(candidate_name and normalized_target and candidate_name == normalized_target)


def robot_mac_skorlarini_al(match: dict[str, Any]) -> tuple[int | None, int | None]:
    """Ham havuz kaydindan mac sonu skorunu okur."""
    home_score = robot_int_or_none(
        match.get("homeScore", match.get("home_score", match.get("home_goals")))
    )
    away_score = robot_int_or_none(
        match.get("awayScore", match.get("away_score", match.get("away_goals")))
    )
    if home_score is not None and away_score is not None:
        return home_score, away_score

    raw_score = match.get("score")
    if isinstance(raw_score, str) and "-" in raw_score:
        left, right = raw_score.split("-", 1)
        return robot_int_or_none(left.strip()), robot_int_or_none(right.strip())
    return home_score, away_score


def robot_devre_skorlarini_al(match: dict[str, Any]) -> tuple[int | None, int | None]:
    """Varsa ilk yari skorunu H2H ilk yari KG sinyali icin okur."""
    home_score = robot_int_or_none(
        match.get(
            "home_half_time_goals",
            match.get("homeHalfTimeScore", match.get("home_half_score")),
        )
    )
    away_score = robot_int_or_none(
        match.get(
            "away_half_time_goals",
            match.get("awayHalfTimeScore", match.get("away_half_score")),
        )
    )
    return home_score, away_score


def robot_h2h_istatistikleri_hesapla(
    raw_pool: dict[str, Any],
    analysis_row: dict[str, Any],
) -> dict[str, Any]:
    """
    Robotun kendi ham havuzundan iki takimin son H2H maclarini hesaplar.

    Veri azsa asagidaki ogrenme katmani H2H etkisini otomatik kisar. Bu sayede
    tek bir eski rekabet maci ana motorun kararini bozmaz.
    """
    power_report = analysis_row.get("faz2_power_report")
    power_report = power_report if isinstance(power_report, dict) else {}
    match_info = power_report.get("match")
    match_info = match_info if isinstance(match_info, dict) else {}
    home_id = match_info.get("home_team_id")
    away_id = match_info.get("away_team_id")
    home_name = match_info.get("home_team_name") or analysis_row.get("home_team")
    away_name = match_info.get("away_team_name") or analysis_row.get("away_team")

    h2h_matches: list[dict[str, Any]] = []
    for raw_match in raw_pool.get("matches", []):
        if not isinstance(raw_match, dict):
            continue
        raw_home_id, raw_home_name = robot_takim_bilgisi(raw_match, "home")
        raw_away_id, raw_away_name = robot_takim_bilgisi(raw_match, "away")
        normal_order = (
            robot_takim_eslesiyor(raw_home_id, raw_home_name, home_id, home_name)
            and robot_takim_eslesiyor(raw_away_id, raw_away_name, away_id, away_name)
        )
        reverse_order = (
            robot_takim_eslesiyor(raw_home_id, raw_home_name, away_id, away_name)
            and robot_takim_eslesiyor(raw_away_id, raw_away_name, home_id, home_name)
        )
        if not (normal_order or reverse_order):
            continue
        home_score, away_score = robot_mac_skorlarini_al(raw_match)
        if home_score is None or away_score is None:
            continue
        h2h_matches.append(raw_match)

    h2h_matches.sort(key=lambda row: str(row.get("utc_date") or ""), reverse=True)
    h2h_matches = h2h_matches[:ROBOT_H2H_LIMIT]

    kg_count = 0
    over_25_count = 0
    first_half_kg_count = 0
    first_half_data_count = 0
    for raw_match in h2h_matches:
        home_score, away_score = robot_mac_skorlarini_al(raw_match)
        if home_score is None or away_score is None:
            continue
        if home_score > 0 and away_score > 0:
            kg_count += 1
        if home_score + away_score >= 3:
            over_25_count += 1

        half_home, half_away = robot_devre_skorlarini_al(raw_match)
        if half_home is not None and half_away is not None:
            first_half_data_count += 1
            if half_home > 0 and half_away > 0:
                first_half_kg_count += 1

    match_count = len(h2h_matches)
    return {
        "match_count": match_count,
        "kg_var_rate": round((kg_count / match_count) * 100, 2) if match_count else 0.0,
        "over_25_rate": round((over_25_count / match_count) * 100, 2) if match_count else 0.0,
        "first_half_match_count": first_half_data_count,
        "first_half_kg_rate": (
            round((first_half_kg_count / first_half_data_count) * 100, 2)
            if first_half_data_count
            else 0.0
        ),
    }


def robot_mevcut_sinyal_ortalamasi(*values: Any) -> float:
    """Ayni market icin mevcut motorlarin sifirdan buyuk sinyallerini birlestirir."""
    scores = [robot_float(value) for value in values if robot_float(value) > 0]
    if not scores:
        return 0.0
    return robot_skorunu_sinirla(sum(scores) / len(scores))


def robot_takim_istatistik_sinyali(
    analysis_row: dict[str, Any],
    market: str,
) -> float:
    """
    Iki takimin ayri ayri form/hucum/savunma ve ev-deplasman sinyallerini
    markete uygun tek skorda birlestirir.
    """
    power_report = analysis_row.get("faz2_power_report")
    power_report = power_report if isinstance(power_report, dict) else {}
    engine_details = power_report.get("engine_details")
    engine_details = engine_details if isinstance(engine_details, dict) else {}
    home = engine_details.get("home_team_power")
    away = engine_details.get("away_team_power")
    home = home if isinstance(home, dict) else {}
    away = away if isinstance(away, dict) else {}

    common_values = [
        robot_float(home.get("attack_power")),
        robot_float(away.get("attack_power")),
        robot_float(home.get("defense_weakness")),
        robot_float(away.get("defense_weakness")),
        robot_float(home.get("home_performance_score")),
        robot_float(away.get("away_performance_score")),
    ]
    if market == "UST_25":
        common_values.extend(
            [
                robot_float(home.get("over_25_signal")),
                robot_float(away.get("over_25_signal")),
            ]
        )
    else:
        common_values.extend(
            [
                robot_float(home.get("kg_potential")),
                robot_float(away.get("kg_potential")),
            ]
        )
    return robot_skorunu_sinirla(sum(common_values) / max(1, len(common_values)))


def robot_market_adaylarini_uret(
    analysis_row: dict[str, Any],
    h2h: dict[str, Any],
    confidence_score: float,
) -> list[dict[str, Any]]:
    """KG Var, Ust 2.5 ve Ilk Yari KG Var marketlerini ayni ogrenme kuraliyla puanlar."""
    definitions = [
        {
            "market": "KG_VAR",
            "market_adi": "KG Var",
            "base_market_score": robot_mevcut_sinyal_ortalamasi(
                analysis_row.get("kg_var_score"),
                analysis_row.get("kg_var_olasiligi"),
            ),
            "h2h_rate": robot_float(h2h.get("kg_var_rate")),
            "h2h_count": int(h2h.get("match_count") or 0),
        },
        {
            "market": "UST_25",
            "market_adi": "Ust 2.5",
            "base_market_score": robot_mevcut_sinyal_ortalamasi(
                analysis_row.get("ust_25_score"),
                analysis_row.get("ust_25_olasiligi"),
            ),
            "h2h_rate": robot_float(h2h.get("over_25_rate")),
            "h2h_count": int(h2h.get("match_count") or 0),
        },
        {
            "market": "ILK_YARI_KG",
            "market_adi": "Ilk Yari KG Var",
            "base_market_score": robot_mevcut_sinyal_ortalamasi(
                analysis_row.get("ilk_yari_kg_score")
            ),
            "h2h_rate": robot_float(h2h.get("first_half_kg_rate")),
            "h2h_count": int(h2h.get("first_half_match_count") or 0),
        },
    ]

    power_score = robot_float(analysis_row.get("guc_skoru"))
    rows: list[dict[str, Any]] = []
    for definition in definitions:
        base_market_score = robot_float(definition["base_market_score"])
        team_signal = robot_takim_istatistik_sinyali(
            analysis_row,
            str(definition["market"]),
        )
        h2h_count = int(definition["h2h_count"])
        h2h_trust = min(
            1.0,
            h2h_count / max(1, ROBOT_H2H_FULL_WEIGHT_MATCHES),
        )
        h2h_effective = base_market_score
        if h2h_count > 0:
            h2h_effective = (
                base_market_score * (1.0 - h2h_trust)
                + robot_float(definition["h2h_rate"]) * h2h_trust
            )

        learned_market_score = robot_skorunu_sinirla(
            base_market_score * ROBOT_LEARNING_WEIGHTS["base_market_signal"]
            + team_signal * ROBOT_LEARNING_WEIGHTS["team_statistics"]
            + h2h_effective * ROBOT_LEARNING_WEIGHTS["h2h_history"]
        )
        recommendation_score = robot_skorunu_sinirla(
            power_score * ROBOT_RECOMMENDATION_WEIGHTS["power_score"]
            + confidence_score * ROBOT_RECOMMENDATION_WEIGHTS["confidence_score"]
            + learned_market_score * ROBOT_RECOMMENDATION_WEIGHTS["learned_market_score"]
        )
        rows.append(
            {
                **definition,
                "team_statistics_score": team_signal,
                "h2h_trust": round(h2h_trust, 2),
                "h2h_effective_score": robot_skorunu_sinirla(h2h_effective),
                "learned_market_score": learned_market_score,
                "recommendation_score": recommendation_score,
            }
        )
    return sorted(rows, key=lambda row: row["recommendation_score"], reverse=True)


def robot_ogrenme_katmanini_uygula(
    coupon_report: dict[str, Any],
    analyzed_matches: list[dict[str, Any]],
    raw_pool: dict[str, Any],
) -> dict[str, Any]:
    """
    Mevcut kupon motorunu bozmadan PRO Robotun son karar sirasini yeniden agirliklandirir.

    Yeni karar; mevcut motor skorlarini, iki takimin ayri istatistiklerini ve
    son H2H rekabet gecmisini birlikte kullanir. H2H yetersizse mevcut motor
    sinyali korunur.
    """
    by_match_id = {
        str(row.get("match_id")): row
        for row in analyzed_matches
        if row.get("match_id") is not None
    }
    by_match_name = {
        f"{row.get('home_team')} - {row.get('away_team')}": row
        for row in analyzed_matches
    }

    learned_recommendations: list[dict[str, Any]] = []
    for recommendation in coupon_report.get("single_recommendations", []):
        if not isinstance(recommendation, dict):
            continue
        analysis_row = None
        match_id = recommendation.get("match_id")
        if match_id is not None:
            analysis_row = by_match_id.get(str(match_id))
        if analysis_row is None:
            analysis_row = by_match_name.get(str(recommendation.get("mac") or ""))
        if analysis_row is None:
            learned_recommendations.append(dict(recommendation))
            continue

        confidence_score = robot_float(recommendation.get("confidence_score"))
        h2h = robot_h2h_istatistikleri_hesapla(raw_pool, analysis_row)
        market_candidates = robot_market_adaylarini_uret(
            analysis_row,
            h2h,
            confidence_score,
        )
        if not market_candidates:
            learned_recommendations.append(dict(recommendation))
            continue
        strongest = market_candidates[0]
        risk_score = robot_skorunu_sinirla(100 - robot_float(strongest["recommendation_score"]))

        learned = dict(recommendation)
        learned["original_market"] = recommendation.get("market")
        learned["original_market_adi"] = recommendation.get("market_adi")
        learned["original_recommendation_score"] = recommendation.get("recommendation_score")
        learned["market"] = strongest["market"]
        learned["market_adi"] = strongest["market_adi"]
        learned["market_score"] = round(robot_float(strongest["base_market_score"]), 2)
        learned["learned_market_score"] = strongest["learned_market_score"]
        learned["recommendation_score"] = strongest["recommendation_score"]
        learned["risk_score"] = risk_score
        learned["risk_level"] = robot_risk_seviyesi(risk_score)
        learned["ilk_yari_kg_olasiligi"] = round(
            robot_float(analysis_row.get("ilk_yari_kg_score")),
            2,
        )
        learned["robot_learning"] = {
            "active": True,
            "team_statistics_score": strongest["team_statistics_score"],
            "h2h": h2h,
            "h2h_trust": strongest["h2h_trust"],
            "h2h_effective_score": strongest["h2h_effective_score"],
            "market_candidates": market_candidates,
        }
        learned_recommendations.append(learned)

    ranked = sorted(
        learned_recommendations,
        key=lambda row: robot_float(row.get("recommendation_score")),
        reverse=True,
    )
    learned_report = dict(coupon_report)
    learned_report["single_recommendations"] = ranked
    learned_report["double_coupons"] = kombinasyon_kuponlari_uret(ranked, 2)
    learned_report["triple_coupons"] = kombinasyon_kuponlari_uret(ranked, 3)
    rules = dict(coupon_report.get("rules") or {})
    rules["robot_learning_layer"] = {
        "base_market_signal": ROBOT_LEARNING_WEIGHTS["base_market_signal"],
        "team_statistics": ROBOT_LEARNING_WEIGHTS["team_statistics"],
        "h2h_history": ROBOT_LEARNING_WEIGHTS["h2h_history"],
        "h2h_last_matches": ROBOT_H2H_LIMIT,
        "h2h_full_weight_after_matches": ROBOT_H2H_FULL_WEIGHT_MATCHES,
        "markets": ["KG Var", "Ust 2.5", "Ilk Yari KG Var"],
    }
    learned_report["rules"] = rules
    return learned_report


def robot_ogrenme_markdownu_uret(coupon_report: dict[str, Any]) -> str:
    """PRO Robot ogrenme katmanini ana raporda denetlenebilir bicimde gosterir."""
    lines = [
        "## PRO Robot Ogrenme Katmani",
        "",
        "- Mevcut motor korunur; son karar katmani ek agirliklandirma yapar.",
        "- Iki takimin ayri form/hucum/savunma ve ev-deplasman istatistikleri kullanilir.",
        "- Son 10 H2H macinda KG Var, Ust 2.5 ve varsa Ilk Yari KG Var egilimleri hesaplanir.",
        "- H2H veri azsa etkisi otomatik azalir; 5 H2H macindan sonra tam H2H guveni kullanilir.",
        "",
        "### En Guclu Ogrenilmis Secimler",
        "",
    ]
    singles = coupon_report.get("single_recommendations", [])
    for row in singles[:5]:
        if not isinstance(row, dict):
            continue
        learning = row.get("robot_learning")
        learning = learning if isinstance(learning, dict) else {}
        h2h = learning.get("h2h")
        h2h = h2h if isinstance(h2h, dict) else {}
        lines.append(
            "- {mac}: {market} | skor {score} | H2H {count} mac | KG %{kg} | Ust2.5 %{over} | IY KG %{ht}".format(
                mac=row.get("mac"),
                market=row.get("market_adi"),
                score=row.get("recommendation_score"),
                count=h2h.get("match_count", 0),
                kg=h2h.get("kg_var_rate", 0),
                over=h2h.get("over_25_rate", 0),
                ht=h2h.get("first_half_kg_rate", 0),
            )
        )
    return "\n".join(lines)


def tahmin_takibini_guncelle(
    coupon_report: dict[str, object],
    source_report: str,
) -> dict[str, object]:
    """
    Kupon onerilerini tahmin gecmisine ekler ve basari ozetini uretir.
    """
    prediction_history_report = None
    prediction_history_write_error = None
    success_summary = None
    success_report_write_error = None
    success_markdown = ""

    try:
        prediction_history = tahmin_gecmisi_oku(ROBOT_HISTORY_FILE)
        prediction_history, prediction_history_report = tahmin_kayitlarini_ekle(
            prediction_history,
            coupon_report.get("single_recommendations", []),  # type: ignore[arg-type]
            source_report=source_report,
        )
        success_summary = basari_ozeti_hesapla(prediction_history)
        success_markdown = basari_markdown_uret(success_summary)
        try:
            tahmin_gecmisi_yaz(prediction_history, ROBOT_HISTORY_FILE)
        except OSError as exc:
            prediction_history_write_error = str(exc)
        try:
            ROBOT_SUCCESS_REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
            ROBOT_SUCCESS_REPORT_FILE.write_text(success_markdown, encoding="utf-8")
        except OSError as exc:
            success_report_write_error = str(exc)
    except OSError as exc:
        prediction_history_write_error = str(exc)

    return {
        "prediction_history_report": prediction_history_report,
        "prediction_history_write_error": prediction_history_write_error,
        "success_summary": success_summary,
        "success_report_write_error": success_report_write_error,
        "success_markdown": success_markdown,
    }


def demo_markdown_uret(
    coupon_report: dict[str, object],
    raw_pool_report: dict[str, int] | None,
    tracking_result: dict[str, object],
    warnings: list[str],
    active_secret: ActiveApiSecret,
) -> str:
    """Offline/demo mod icin ana Markdown raporunu uretir."""
    singles = coupon_report.get("single_recommendations", [])
    lines = [
        "# Bugunun En Guclu Maclari",
        "",
        "## Calisma Modu",
        "",
        "CALISMA_MODU: DEMO",
        "",
        aktif_veri_kaynagi_markdownu(active_secret),
        "",
        "Demo modda calisiyor.",
        "",
        "API key bulunmadigi icin robot canli API yerine yerel ornek veriyi kullandi.",
        "",
        "## Rapor Bilgisi",
        "",
        "ANALIZ_TARIHI: demo",
        "MAC_TARIHI: data/football_data_org_ornek.json",
        f"TOPLAM_MAC: {coupon_report.get('match_count', 0)}",
        "",
        "## Demo Skorlanan Maclar",
        "",
        "| Sira | Mac | Lig | En Guclu Market | Guc Skoru | KG Var | Ust 2.5 | Confidence | Oneri Skoru | Risk |",
        "|---:|---|---|---|---:|---:|---:|---:|---:|---|",
    ]

    if not singles:
        lines.append("| - | Demo veride mac bulunamadi | - | - | - | - | - | - | - | - |")
    for index, row in enumerate(singles, start=1):  # type: ignore[assignment]
        lines.append(
            "| {i} | {mac} | {league} | {market} | {guc} | {kg} | {ust} | {conf} | {score} | {risk} ({risk_level}) |".format(
                i=index,
                mac=row.get("mac"),
                league=row.get("competition_name") or "-",
                market=row.get("market_adi"),
                guc=row.get("guc_skoru"),
                kg=row.get("kg_var_olasiligi"),
                ust=row.get("ust_25_olasiligi"),
                conf=row.get("confidence_score"),
                score=row.get("recommendation_score"),
                risk=row.get("risk_score"),
                risk_level=row.get("risk_level"),
            )
        )

    lines.extend(["", "---", "", kupon_markdown_uret(coupon_report)])

    success_markdown = str(tracking_result.get("success_markdown") or "")
    if success_markdown:
        lines.extend(["", "---", "", success_markdown])

    if raw_pool_report:
        lines.extend(
            [
                "",
                "## Ham Veri Havuzu",
                "",
                f"- Gelen mac: {raw_pool_report.get('incoming_matches')}",
                f"- Yeni eklenen mac: {raw_pool_report.get('new_matches_added')}",
                f"- Tekrar mac: {raw_pool_report.get('duplicate_matches')}",
                f"- Toplam benzersiz mac: {raw_pool_report.get('total_unique_matches')}",
                f"- Dosya: {ROBOT_RAW_POOL_FILE}",
            ]
        )

    prediction_history_report = tracking_result.get("prediction_history_report")
    if isinstance(prediction_history_report, dict):
        lines.extend(
            [
                "",
                "## Tahmin Performans Takibi",
                "",
                f"- Gelen tahmin: {prediction_history_report.get('incoming_predictions')}",
                f"- Yeni eklenen tahmin: {prediction_history_report.get('new_predictions_added')}",
                f"- Tekrar tahmin: {prediction_history_report.get('duplicate_predictions')}",
                f"- Toplam tahmin: {prediction_history_report.get('total_predictions')}",
                f"- Dosya: {ROBOT_HISTORY_FILE}",
            ]
        )

    warning_lines = list(warnings)
    warning_lines.append("API key olmadigi icin demo mod kullanildi.")
    lines.extend(["", "## Ortam Uyarilari", ""])
    lines.extend(f"- {warning}" for warning in warning_lines)

    lines.extend(
        [
            "",
            "## Canli Moda Gecis",
            "",
            "- `FOOTBALL_DATA_API_KEY` veya `API_FOOTBALL_KEY` tanimlandiginda robot canli mod deneyecek.",
            "- API key yoksa robot durmaz; demo mod ile rapor uretir.",
        ]
    )
    return "\n".join(lines)


def demo_modda_calistir(
    warnings: list[str],
    active_secret: ActiveApiSecret,
) -> dict[str, object]:
    """API key yokken yerel ornek veriyle tam robot akisini calistirir."""
    mackolik_result = mackolik_adimini_guvenli_calistir()
    local_data = yerel_mac_verisini_yukle()
    coupon_report = yerel_ornek_kupon_raporu_uret()
    raw_pool_report = None
    raw_pool_write_error = None

    try:
        raw_pool = havuz_oku(ROBOT_RAW_POOL_FILE)
        raw_pool, raw_pool_report = maclari_havuza_ekle(
            raw_pool,
            local_data.get("matches", []),
            source="demo_mode_local_sample",
        )
        havuz_yaz(raw_pool, ROBOT_RAW_POOL_FILE)
    except OSError as exc:
        raw_pool_write_error = str(exc)

    tracking_result = tahmin_takibini_guncelle(
        coupon_report,
        source_report="demo_mode_outputs/bugunun_en_guclu_maclari.md",
    )
    markdown = demo_markdown_uret(
        coupon_report=coupon_report,
        raw_pool_report=raw_pool_report,
        tracking_result=tracking_result,
        warnings=warnings,
        active_secret=active_secret,
    )
    markdown = markdown + "\n\n---\n\n" + mackolik_durum_markdownu_uret(mackolik_result)
    if raw_pool_write_error:
        markdown = (
            markdown
            + "\n\n## Ham Veri Havuzu Uyarisi\n\n"
            + f"- Ham veri havuzu yazilamadi: {raw_pool_write_error}\n"
        )
    if tracking_result.get("prediction_history_write_error"):
        markdown = (
            markdown
            + "\n\n## Tahmin Performans Uyarisi\n\n"
            + f"- Tahmin gecmisi yazilamadi: {tracking_result.get('prediction_history_write_error')}\n"
        )
    if tracking_result.get("success_report_write_error"):
        markdown = (
            markdown
            + "\n\n## Basari Raporu Uyarisi\n\n"
            + f"- Basari raporu yazilamadi: {tracking_result.get('success_report_write_error')}\n"
        )

    output_path = ROBOT_OUTPUT_FILE
    write_error = None
    try:
        output_path = raporu_dosyaya_yaz(markdown, ROBOT_OUTPUT_FILE)
    except OSError as exc:
        write_error = str(exc)

    return {
        "mode": "demo",
        "message": "Demo modda calisiyor.",
        "active_data_source": active_secret.data_source,
        "active_secret": active_secret.env_name,
        "output_file": str(output_path),
        "write_error": write_error,
        "markdown": markdown if write_error else None,
        "warnings": warnings,
        "raw_pool_report": raw_pool_report,
        "raw_pool_write_error": raw_pool_write_error,
        "mackolik_result": mackolik_result,
        "coupon_report_summary": {
            "single_count": len(coupon_report["single_recommendations"]),
            "double_count": len(coupon_report["double_coupons"]),
            "triple_count": len(coupon_report["triple_coupons"]),
        },
        "prediction_history_report": tracking_result.get("prediction_history_report"),
        "prediction_history_write_error": tracking_result.get("prediction_history_write_error"),
        "success_report_write_error": tracking_result.get("success_report_write_error"),
        "success_summary": tracking_result.get("success_summary"),
        "total_matches": coupon_report.get("match_count", 0),
    }


def robotu_calistir() -> dict[str, object]:
    """
    Gunun maclarini tarar, analiz eder ve Markdown raporunu yazar.
    """
    calisma_klasorlerini_hazirla()
    active_secret = aktif_secret_bilgisi()
    print(active_secret.startup_log)
    print(f"Aktif Veri Kaynagi: {active_secret.data_source}")

    warnings = ortam_uyarilari(active_secret)
    if not canli_mod_mumkun_mu(active_secret):
        return demo_modda_calistir(warnings, active_secret)

    mackolik_result = mackolik_adimini_guvenli_calistir()
    scan_report = kaynak_secimli_mac_taramasi(day_count=7)
    raw_pool_report = None
    raw_pool_write_error = None
    raw_pool: dict[str, Any] = {"matches": []}
    try:
        found_matches = tum_bulunan_maclari_cikar(scan_report)
        raw_pool = havuz_oku(ROBOT_RAW_POOL_FILE)
        raw_pool, raw_pool_report = maclari_havuza_ekle(
            raw_pool,
            found_matches,
            source=str(scan_report.get("rapor_tipi") or "robot_scan"),
        )
        havuz_yaz(raw_pool, ROBOT_RAW_POOL_FILE)
    except OSError as exc:
        raw_pool_write_error = str(exc)

    analysis = aralik_maclarini_analiz_et(FootballDataClient(), scan_report, limit=1000)
    markdown = markdown_raporu_uret(analysis)
    markdown = (
        markdown
        + "\n\n"
        + aktif_veri_kaynagi_markdownu(active_secret)
        + "\n"
    )
    coupon_report = None
    tracking_result = {
        "prediction_history_report": None,
        "prediction_history_write_error": None,
        "success_summary": None,
        "success_report_write_error": None,
        "success_markdown": "",
    }
    if analysis.get("all_matches"):
        analyzed_matches = analysis.get("all_matches", [])
        coupon_report = kupon_raporu_analiz_sonuclarindan_uret(analyzed_matches)
        coupon_report = robot_ogrenme_katmanini_uygula(
            coupon_report,
            analyzed_matches,
            raw_pool,
        )
        markdown = (
            markdown
            + "\n\n---\n\n"
            + kupon_markdown_uret(coupon_report)
            + "\n\n"
            + robot_ogrenme_markdownu_uret(coupon_report)
            + "\n"
        )
        tracking_result = tahmin_takibini_guncelle(
            coupon_report,
            source_report="outputs/bugunun_en_guclu_maclari.md",
        )
        if tracking_result.get("success_markdown"):
            markdown = (
                markdown
                + "\n\n---\n\n"
                + str(tracking_result.get("success_markdown"))
                + "\n"
            )

    if warnings:
        warning_block = "\n".join(f"- {warning}" for warning in warnings)
        markdown = (
            markdown
            + "\n\n## Ortam Uyarilari\n\n"
            + warning_block
            + "\n"
        )

    markdown = markdown + "\n\n---\n\n" + mackolik_durum_markdownu_uret(mackolik_result) + "\n"

    source_manager = scan_report.get("source_manager", {})
    if source_manager:
        markdown = (
            markdown
            + "\n\n## Veri Kaynagi Durumu\n\n"
            + f"- Ana kaynak: {source_manager.get('primary_source')}\n"
            + f"- Fallback kaynak: {source_manager.get('fallback_source')}\n"
            + f"- Fallback denendi mi: {source_manager.get('fallback_attempted')}\n"
            + f"- Fallback hazir mi: {source_manager.get('fallback_ready')}\n"
            + f"- Durum: {source_manager.get('fallback_status')}\n"
        )

    if raw_pool_report:
        markdown = (
            markdown
            + "\n\n## Ham Veri Havuzu\n\n"
            + f"- Gelen mac: {raw_pool_report.get('incoming_matches')}\n"
            + f"- Yeni eklenen mac: {raw_pool_report.get('new_matches_added')}\n"
            + f"- Tekrar mac: {raw_pool_report.get('duplicate_matches')}\n"
            + f"- Toplam benzersiz mac: {raw_pool_report.get('total_unique_matches')}\n"
            + f"- Dosya: {ROBOT_RAW_POOL_FILE}\n"
        )
    if raw_pool_write_error:
        markdown = (
            markdown
            + "\n\n## Ham Veri Havuzu Uyarisi\n\n"
            + f"- Ham veri havuzu yazilamadi: {raw_pool_write_error}\n"
        )
    prediction_history_report = tracking_result.get("prediction_history_report")
    if isinstance(prediction_history_report, dict):
        markdown = (
            markdown
            + "\n\n## Tahmin Performans Takibi\n\n"
            + f"- Gelen tahmin: {prediction_history_report.get('incoming_predictions')}\n"
            + f"- Yeni eklenen tahmin: {prediction_history_report.get('new_predictions_added')}\n"
            + f"- Tekrar tahmin: {prediction_history_report.get('duplicate_predictions')}\n"
            + f"- Toplam tahmin: {prediction_history_report.get('total_predictions')}\n"
            + f"- Dosya: {ROBOT_HISTORY_FILE}\n"
        )
    if tracking_result.get("prediction_history_write_error"):
        markdown = (
            markdown
            + "\n\n## Tahmin Performans Uyarisi\n\n"
            + f"- Tahmin gecmisi yazilamadi: {tracking_result.get('prediction_history_write_error')}\n"
        )
    if tracking_result.get("success_report_write_error"):
        markdown = (
            markdown
            + "\n\n## Basari Raporu Uyarisi\n\n"
            + f"- Basari raporu yazilamadi: {tracking_result.get('success_report_write_error')}\n"
        )

    output_path = ROBOT_OUTPUT_FILE
    write_error = None
    try:
        output_path = raporu_dosyaya_yaz(markdown, ROBOT_OUTPUT_FILE)
    except OSError as exc:
        write_error = str(exc)

    return {
        "output_file": str(output_path),
        "write_error": write_error,
        "markdown": markdown if write_error else None,
        "mode": "live",
        "active_data_source": active_secret.data_source,
        "active_secret": active_secret.env_name,
        "warnings": warnings,
        "source_manager": source_manager,
        "raw_pool_report": raw_pool_report,
        "raw_pool_write_error": raw_pool_write_error,
        "mackolik_result": mackolik_result,
        "robot_learning_enabled": True,
        "coupon_report_summary": {
            "single_count": len(coupon_report["single_recommendations"])
            if coupon_report
            else 0,
            "double_count": len(coupon_report["double_coupons"])
            if coupon_report
            else 0,
            "triple_count": len(coupon_report["triple_coupons"])
            if coupon_report
            else 0,
        },
        "prediction_history_report": tracking_result.get("prediction_history_report"),
        "prediction_history_write_error": tracking_result.get("prediction_history_write_error"),
        "success_report_write_error": tracking_result.get("success_report_write_error"),
        "success_summary": tracking_result.get("success_summary"),
        "total_matches": analysis.get("total_matches"),
    }


if __name__ == "__main__":
    try:
        result = robotu_calistir()
        print("Futbol Laboratuvari robotu tamamlandi.")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        if result.get("write_error"):
            print("\nRapor dosyaya yazilamadi; Markdown cikti asagidadir:\n")
            print(result.get("markdown") or "")
    except Exception as exc:
        print(f"Robot calisma hatasi: {exc}")
        raise

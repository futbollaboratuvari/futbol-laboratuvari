"""
Futbol Laboratuvari tek tik robot giris noktasi.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

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
        coupon_report = kupon_raporu_analiz_sonuclarindan_uret(
            analysis.get("all_matches", [])
        )
        markdown = (
            markdown
            + "\n\n---\n\n"
            + kupon_markdown_uret(coupon_report)
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

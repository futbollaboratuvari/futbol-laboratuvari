"""
Futbol Laboratuvari V1 gunun maclari tarayicisi.

Bu modul football-data.org API'den bugunku maclari ceker, her maci mevcut
tahmin motorlariyla analiz eder ve en guclu ilk 10 maci Markdown raporu olarak
uretir.

Uretilen skorlar:

- Form Score
- KG Var Score
- Ilk Yari KG Score
- Ikinci Yari KG Score
- Ust 2.5 Score
- Guc Skoru
- Confidence
"""

from __future__ import annotations

import json
import re
import time
from datetime import date, timedelta
from pathlib import Path
from typing import Any

try:
    from guc_skoru_motoru import mac_guc_skoru_uret
    from ilk_veri_toplayici import FootballDataApiError, FootballDataClient
    from tahmin_motoru import tahmin_raporu_uret
except ImportError:
    from src.guc_skoru_motoru import mac_guc_skoru_uret
    from src.ilk_veri_toplayici import (
        FootballDataApiError,
        FootballDataClient,
    )
    from src.tahmin_motoru import tahmin_raporu_uret


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_FILE = PROJECT_ROOT / "outputs" / "bugunun_en_guclu_maclari.md"
DEFAULT_API_SCAN_REPORT_FILE = PROJECT_ROOT / "outputs" / "api_mac_tarama_raporu.md"
DEFAULT_RATE_LIMIT_REPORT_FILE = PROJECT_ROOT / "outputs" / "api_rate_limit_raporu.md"
DEFAULT_MATCH_LIMIT = 10
DEFAULT_LOOKAHEAD_DAYS = 7
DEFAULT_API_CALL_DELAY_SECONDS = 6
DEFAULT_RATE_LIMIT_RETRY_SECONDS = 60
DEFAULT_MAX_RATE_LIMIT_RETRIES = 5
DEFAULT_COMPETITION_CODES = [
    "PL",
    "PD",
    "SA",
    "BL1",
    "FL1",
    "ELC",
    "PPL",
    "DED",
    "BSA",
    "CLI",
    "CL",
    "EC",
    "WC",
]

MARKET_DISPLAY_NAMES = {
    "KG_VAR_SCORE": "KG Var",
    "ILK_YARI_KG_SCORE": "Ilk Yari KG Var",
    "IKINCI_YARI_KG_SCORE": "Ikinci Yari KG Var",
    "UST_25_SCORE": "Ust 2.5",
}


class GununMaclariTaramaHatasi(RuntimeError):
    """Gunun maclari tarama surecinde olusan hatalar icin kullanilir."""


def bugunun_tarihi() -> str:
    """
    Bugunun tarihini `YYYY-MM-DD` formatinda doner.
    """
    return date.today().isoformat()


def tarih_araligi_uret(start_date: str, lookahead_days: int) -> list[str]:
    """
    Bugun, yarin ve devaminda taranacak tarih listesini uretir.

    `lookahead_days=7` oldugunda bugun dahil 7 gunluk bir pencere olusur.
    """
    first_day = date.fromisoformat(start_date)
    return [
        (first_day + timedelta(days=offset)).isoformat()
        for offset in range(max(1, lookahead_days))
    ]


def bitis_tarihi_hesapla(start_date: str, day_count: int) -> str:
    """
    Baslangic tarihi dahil olacak sekilde aralik bitis tarihini hesaplar.

    Ornek: 2026-06-18 ve 7 gun icin 2026-06-24 doner.
    """
    first_day = date.fromisoformat(start_date)
    return (first_day + timedelta(days=max(1, day_count) - 1)).isoformat()


def guc_skoru_hesapla(scores: dict[str, float]) -> float:
    """
    Ana market skorlarindan 0-100 arasi guc skoru uretir.

    Agirliklar:
    - Ust 2.5: %30
    - KG Var: %30
    - Ikinci yari KG: %20
    - Ilk yari KG: %20
    """
    score = (
        float(scores.get("UST_25_SCORE", 0)) * 0.30
        + float(scores.get("KG_VAR_SCORE", 0)) * 0.30
        + float(scores.get("IKINCI_YARI_KG_SCORE", 0)) * 0.20
        + float(scores.get("ILK_YARI_KG_SCORE", 0)) * 0.20
    )
    return round(max(0, min(100, score)), 2)


def marketleri_sirala(scores: dict[str, float]) -> list[dict[str, Any]]:
    """
    Ana market skorlarini yuksekten dusuge siralar.
    """
    rows = [
        {
            "market": MARKET_DISPLAY_NAMES[key],
            "market_kodu": key,
            "score": float(value),
        }
        for key, value in scores.items()
        if key in MARKET_DISPLAY_NAMES
    ]
    return sorted(rows, key=lambda row: row["score"], reverse=True)


def maclari_parse_et(api_response: dict[str, Any]) -> list[dict[str, Any]]:
    """
    API mac yanitini tarayici icin gerekli alanlarla sade listeye cevirir.

    Ortak parserdan farkli olarak `competition_code` alanini da korur. Bu alan
    bugunku maclarin lig gecmisini cekmek icin kullanilir.
    """
    parsed_matches: list[dict[str, Any]] = []

    for match in api_response.get("matches", []):
        score = match.get("score", {})
        full_time = score.get("fullTime", {})
        half_time = score.get("halfTime", {})
        home_team = match.get("homeTeam", {})
        away_team = match.get("awayTeam", {})
        competition = match.get("competition", {})

        parsed_matches.append(
            {
                "match_id": match.get("id"),
                "utc_date": match.get("utcDate"),
                "competition_id": competition.get("id"),
                "competition_code": competition.get("code"),
                "competition_name": competition.get("name"),
                "matchday": match.get("matchday"),
                "status": match.get("status"),
                "home_team_id": home_team.get("id"),
                "home_team_name": home_team.get("name"),
                "away_team_id": away_team.get("id"),
                "away_team_name": away_team.get("name"),
                "home_goals": full_time.get("home"),
                "away_goals": full_time.get("away"),
                "home_half_time_goals": half_time.get("home"),
                "away_half_time_goals": half_time.get("away"),
                "winner": score.get("winner"),
            }
        )

    return parsed_matches


def bugunku_maclari_cek(
    client: FootballDataClient,
    target_date: str | None = None,
) -> list[dict[str, Any]]:
    """
    football-data.org API'den hedef tarihteki maclari ceker.

    Status filtresi verilmez; boylece SCHEDULED, TIMED, IN_PLAY veya FINISHED
    gibi bugune ait tum mac durumlari gelebilir.
    """
    active_date = target_date or bugunun_tarihi()
    response = client.get_recent_matches(
        competition_code=None,
        limit=1000,
        status=None,  # type: ignore[arg-type]
        date_from=active_date,
        date_to=active_date,
    )
    return maclari_parse_et(response)


def lig_maclarini_aralikta_cek(
    client: FootballDataClient,
    competition_code: str,
    date_from: str,
    date_to: str,
) -> list[dict[str, Any]]:
    """
    Tek bir lig icin dateFrom/dateTo araligindaki tum maclari ceker.

    Status filtresi kullanilmaz; fikstur, oynanan ve zamanlanmis maclar ayni
    taramada gorulebilir.
    """
    response = client.get_recent_matches(
        competition_code=competition_code,
        limit=10_000,
        status=None,  # type: ignore[arg-type]
        date_from=date_from,
        date_to=date_to,
    )
    return maclari_parse_et(response)


def hata_kodu_cikar(error_message: str) -> str | None:
    """
    API hata mesajindan HTTP hata kodunu cikarir.
    """
    match = re.search(r"API HTTP hatasi:\s*(\d+)", error_message)
    if not match:
        return None
    return match.group(1)


def header_degeri_al(headers: dict[str, str] | None, header_name: str) -> str | None:
    """
    Header adini buyuk/kucuk harf duyarsiz sekilde okur.
    """
    if not headers:
        return None

    expected = header_name.lower()
    for key, value in headers.items():
        if key.lower() == expected:
            return value
    return None


def retry_after_saniye_cikar(headers: dict[str, str] | None) -> int:
    """
    `Retry-After` header'ini saniye olarak okur.
    """
    raw_value = header_degeri_al(headers, "Retry-After")
    if raw_value is None:
        return DEFAULT_RATE_LIMIT_RETRY_SECONDS

    try:
        return max(1, int(float(raw_value)))
    except ValueError:
        return DEFAULT_RATE_LIMIT_RETRY_SECONDS


def kalan_istek_hakki_cikar(headers: dict[str, str] | None) -> str | None:
    """
    football-data.org veya proxy yanitlarinda kalan istek hakkini gosterebilecek
    header degerini cikarir.
    """
    if not headers:
        return None

    known_headers = [
        "X-Requests-Available-Minute",
        "X-RateLimit-Remaining",
        "RateLimit-Remaining",
        "X-Request-Remaining",
    ]
    for header_name in known_headers:
        value = header_degeri_al(headers, header_name)
        if value is not None:
            return value

    for key, value in headers.items():
        lower_key = key.lower()
        if "remaining" in lower_key or "available" in lower_key:
            return f"{key}: {value}"

    return None


def bekle(seconds: int | float) -> None:
    """
    API kuyruk sistemi icin merkezi bekleme fonksiyonu.
    """
    if seconds <= 0:
        return
    time.sleep(seconds)


def mac_tarih_araligi_ozeti(matches: list[dict[str, Any]]) -> dict[str, str | None]:
    """
    Donen maclar icindeki ilk ve son mac tarihini hesaplar.
    """
    dates = sorted(
        {
            str(match.get("utc_date", ""))[:10]
            for match in matches
            if match.get("utc_date")
        }
    )
    if not dates:
        return {
            "first_match_date": None,
            "last_match_date": None,
        }

    return {
        "first_match_date": dates[0],
        "last_match_date": dates[-1],
    }


def competition_mac_taramasi_yap(
    client: FootballDataClient | None = None,
    competition_codes: list[str] | None = None,
    date_from: str | None = None,
    day_count: int = DEFAULT_LOOKAHEAD_DAYS,
    api_call_delay_seconds: int = 0,
    use_rate_limit_queue: bool = False,
) -> dict[str, Any]:
    """
    Verilen competition code listesini 7 gunluk tarih araliginda tarar.

    Her lig/kupa icin:
    - kac mac dondu
    - donen maclar hangi tarih araliginda
    - erisim hatasi var mi
    - bulunan maclar neler

    bilgilerini raporlar.
    """
    active_client = client or FootballDataClient()
    active_codes = competition_codes or DEFAULT_COMPETITION_CODES
    active_date_from = date_from or bugunun_tarihi()
    active_date_to = bitis_tarihi_hesapla(active_date_from, day_count)

    rows = []
    total_matches = 0

    for code in active_codes:
        try:
            if use_rate_limit_queue:
                queue_result = lig_maclarini_aralikta_cek_kuyruklu(
                    active_client,
                    competition_code=code,
                    date_from=active_date_from,
                    date_to=active_date_to,
                    api_call_delay_seconds=api_call_delay_seconds,
                )
                matches = queue_result["matches"]
                status_code = queue_result["status_code"]
                response_headers = queue_result["headers"]
                retry_count = queue_result["retry_count"]
                waited_seconds = queue_result["waited_seconds"]
            else:
                matches = lig_maclarini_aralikta_cek(
                    active_client,
                    competition_code=code,
                    date_from=active_date_from,
                    date_to=active_date_to,
                )
                status_code = active_client.last_status_code
                response_headers = active_client.last_response_headers or {}
                retry_count = 0
                waited_seconds = 0

            date_summary = mac_tarih_araligi_ozeti(matches)
            match_count = len(matches)
            total_matches += match_count
            rows.append(
                {
                    "competition_code": code,
                    "match_count": match_count,
                    "first_match_date": date_summary["first_match_date"],
                    "last_match_date": date_summary["last_match_date"],
                    "matches": matches,
                    "access_error": None,
                    "error_code": None,
                    "api_response_code": status_code,
                    "remaining_requests": kalan_istek_hakki_cikar(response_headers),
                    "retry_count": retry_count,
                    "waited_seconds": waited_seconds,
                    "status": "ok",
                }
            )
        except FootballDataApiError as exc:
            error_message = str(exc)
            rows.append(
                {
                    "competition_code": code,
                    "match_count": 0,
                    "first_match_date": None,
                    "last_match_date": None,
                    "matches": [],
                    "access_error": error_message,
                    "error_code": hata_kodu_cikar(error_message),
                    "api_response_code": exc.status_code,
                    "remaining_requests": kalan_istek_hakki_cikar(exc.headers),
                    "retry_count": 0,
                    "waited_seconds": 0,
                    "status": "error",
                }
            )

    return {
        "rapor_tipi": "API_MAC_TARAMA_RAPORU",
        "analysis_date": bugunun_tarihi(),
        "date_from": active_date_from,
        "date_to": active_date_to,
        "day_count": day_count,
        "competition_count": len(active_codes),
        "total_matches": total_matches,
        "rows": rows,
    }


def lig_maclarini_aralikta_cek_kuyruklu(
    client: FootballDataClient,
    competition_code: str,
    date_from: str,
    date_to: str,
    api_call_delay_seconds: int = DEFAULT_API_CALL_DELAY_SECONDS,
    max_rate_limit_retries: int = DEFAULT_MAX_RATE_LIMIT_RETRIES,
) -> dict[str, Any]:
    """
    Tek bir competition icin kuyruklu API istegi yapar.

    Kurallar:
    - Her API isteginden sonra `api_call_delay_seconds` kadar bekler.
    - 429 donerse `Retry-After` header'ini okur, bekler ve ayni istegi tekrar dener.
    - Maksimum tekrar sayisi dolarsa son 429 hatasini yukari firlatir.
    """
    retry_count = 0
    waited_seconds = 0

    while True:
        try:
            matches = lig_maclarini_aralikta_cek(
                client,
                competition_code=competition_code,
                date_from=date_from,
                date_to=date_to,
            )
            bekle(api_call_delay_seconds)
            waited_seconds += api_call_delay_seconds
            return {
                "matches": matches,
                "status_code": client.last_status_code,
                "headers": client.last_response_headers or {},
                "retry_count": retry_count,
                "waited_seconds": waited_seconds,
            }
        except FootballDataApiError as exc:
            status_code = exc.status_code or int(hata_kodu_cikar(str(exc)) or 0)
            if status_code != 429:
                bekle(api_call_delay_seconds)
                waited_seconds += api_call_delay_seconds
                raise

            retry_count += 1
            wait_seconds = retry_after_saniye_cikar(exc.headers)
            bekle(wait_seconds)
            waited_seconds += wait_seconds

            if retry_count > max_rate_limit_retries:
                raise


def api_rate_limit_markdown_uret(report: dict[str, Any]) -> str:
    """
    Kuyruklu API tarama surecindeki response code ve kalan hak bilgisini yazar.
    """
    lines = [
        "# API Rate Limit Raporu",
        "",
        "## Rapor Bilgisi",
        "",
        f"ANALIZ_TARIHI: {report['analysis_date']}",
        f"DATE_FROM: {report['date_from']}",
        f"DATE_TO: {report['date_to']}",
        f"TARANAN_COMPETITION_SAYISI: {report['competition_count']}",
        f"TOPLAM_MAC: {report['total_matches']}",
        "",
        "## Lig Bazli Rate Limit Durumu",
        "",
        "| Competition | Mac Sayisi | API Response Code | Kalan Istek Hakki | Retry | Bekleme Saniyesi | Durum |",
        "|---|---:|---:|---|---:|---:|---|",
    ]

    for row in report["rows"]:
        response_code = row.get("api_response_code") or row.get("error_code") or "-"
        remaining = row.get("remaining_requests") or "-"
        lines.append(
            "| {code} | {count} | {response_code} | {remaining} | {retry} | {waited} | {status} |".format(
                code=row["competition_code"],
                count=row["match_count"],
                response_code=response_code,
                remaining=str(remaining).replace("|", "/"),
                retry=row.get("retry_count", 0),
                waited=row.get("waited_seconds", 0),
                status=row["status"],
            )
        )

    lines.extend(
        [
            "",
            "## Kuyruk Kurali",
            "",
            f"- Her API cagrisindan sonra {DEFAULT_API_CALL_DELAY_SECONDS} saniye beklenir.",
            "- 429 gelirse `Retry-After` header'i okunur ve ayni istek tekrar denenir.",
            "- Tum competition kodlari bitene kadar kuyruk ilerler.",
        ]
    )
    return "\n".join(lines)


def api_rate_limit_raporu_uret(
    client: FootballDataClient | None = None,
    competition_codes: list[str] | None = None,
    date_from: str | None = None,
    day_count: int = DEFAULT_LOOKAHEAD_DAYS,
    api_call_delay_seconds: int = DEFAULT_API_CALL_DELAY_SECONDS,
    output_file: Path = DEFAULT_RATE_LIMIT_REPORT_FILE,
) -> dict[str, Any]:
    """
    Kuyruklu competition taramasini calistirir ve rate limit raporu yazar.
    """
    report = competition_mac_taramasi_yap(
        client=client,
        competition_codes=competition_codes,
        date_from=date_from,
        day_count=day_count,
        api_call_delay_seconds=api_call_delay_seconds,
        use_rate_limit_queue=True,
    )
    markdown_report = api_rate_limit_markdown_uret(report)
    report_path = raporu_dosyaya_yaz(markdown_report, output_file)
    return {
        "output_file": str(report_path),
        "report": report,
        "markdown": markdown_report,
    }


def api_mac_tarama_markdown_uret(report: dict[str, Any]) -> str:
    """
    Competition bazli API mac tarama raporunu Markdown metnine cevirir.
    """
    lines = [
        "# API Mac Tarama Raporu",
        "",
        "## Rapor Bilgisi",
        "",
        f"ANALIZ_TARIHI: {report['analysis_date']}",
        f"DATE_FROM: {report['date_from']}",
        f"DATE_TO: {report['date_to']}",
        f"TARANAN_COMPETITION_SAYISI: {report['competition_count']}",
        f"TOPLAM_MAC: {report['total_matches']}",
        "",
        "## Competition Bazli Sonuc",
        "",
        "| Competition | Tarih Araligi | Mac Sayisi | Durum | Hata Kodu | Erisim Hatasi |",
        "|---|---|---:|---|---|---|",
    ]

    for row in report["rows"]:
        if row["first_match_date"] and row["last_match_date"]:
            match_range = f"{row['first_match_date']} - {row['last_match_date']}"
        else:
            match_range = "-"

        error_text = row["access_error"] or "-"
        if len(error_text) > 180:
            error_text = error_text[:177] + "..."

        lines.append(
            "| {code} | {range} | {count} | {status} | {error_code} | {error} |".format(
                code=row["competition_code"],
                count=row["match_count"],
                range=match_range,
                status=row["status"],
                error_code=row["error_code"] or "-",
                error=error_text.replace("\n", " "),
            )
        )

    lines.extend(
        [
            "",
            "## Bulunan Maclar",
            "",
            "| Competition | Tarih | Mac | Durum |",
            "|---|---|---|---|",
        ]
    )

    found_any_match = False
    for row in report["rows"]:
        for match in row["matches"]:
            found_any_match = True
            match_date = str(match.get("utc_date") or "")[:10] or "-"
            lines.append(
                "| {code} | {date} | {home} - {away} | {status} |".format(
                    code=row["competition_code"],
                    date=match_date,
                    home=match.get("home_team_name") or "-",
                    away=match.get("away_team_name") or "-",
                    status=match.get("status") or "-",
                )
            )

    if not found_any_match:
        lines.append("| - | - | Mac bulunamadi | - |")

    lines.extend(
        [
            "",
            "## API Kapsam Notu",
            "",
            "Bu API ücretsiz planda sınırlı maç döndürüyor.",
        ]
    )

    lines.extend(
        [
            "",
            "## Not",
            "",
            "- Tarama `dateFrom` ve `dateTo` parametreleriyle 7 gunluk aralikta yapilir.",
            "- Status filtresi kullanilmaz; API'nin dondurdugu tum mac durumlari sayilir.",
            "- Erisim hatasi olan competition kodlari raporda `error` olarak isaretlenir.",
        ]
    )
    return "\n".join(lines)


def tum_bulunan_maclari_cikar(scan_report: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Competition tarama raporundaki tum bulunan maclari tek listeye indirger.
    """
    all_matches = []
    for row in scan_report["rows"]:
        for match in row["matches"]:
            match_copy = dict(match)
            match_copy["competition_code"] = row["competition_code"]
            all_matches.append(match_copy)
    return sorted(all_matches, key=lambda item: item.get("utc_date") or "")


def aralik_maclarini_analiz_et(
    client: FootballDataClient,
    scan_report: dict[str, Any],
    limit: int = DEFAULT_MATCH_LIMIT,
) -> dict[str, Any]:
    """
    Competition taramasinda bulunan tum maclari mevcut motorlarla analiz eder.
    """
    all_matches = tum_bulunan_maclari_cikar(scan_report)
    competition_keys = lig_kodlarini_cikar(all_matches)
    history_by_competition = gecmis_maclari_cek(client, competition_keys)

    analyzed_matches = []
    for match in all_matches:
        competition_key = mac_lig_anahtari(match)
        history = history_by_competition.get(competition_key or "", [])
        analyzed_matches.append(maci_analiz_et(match, history))

    ranked_matches = sorted(
        analyzed_matches,
        key=lambda row: row["guc_skoru"],
        reverse=True,
    )

    return {
        "rapor_tipi": "ARALIK_MACLARI_ANALIZ_RAPORU",
        "analysis_date": scan_report["analysis_date"],
        "match_date": f"{scan_report['date_from']} / {scan_report['date_to']}",
        "date_from": scan_report["date_from"],
        "date_to": scan_report["date_to"],
        "total_matches": len(all_matches),
        "analyzed_matches": len(analyzed_matches),
        "top_matches": ranked_matches[:limit],
        "all_matches": ranked_matches,
    }


def api_mac_tarama_raporu_uret(
    client: FootballDataClient | None = None,
    competition_codes: list[str] | None = None,
    date_from: str | None = None,
    day_count: int = DEFAULT_LOOKAHEAD_DAYS,
    output_file: Path = DEFAULT_API_SCAN_REPORT_FILE,
) -> dict[str, Any]:
    """
    Competition bazli mac taramasini calistirir ve Markdown raporunu yazar.
    """
    report = competition_mac_taramasi_yap(
        client=client,
        competition_codes=competition_codes,
        date_from=date_from,
        day_count=day_count,
    )
    markdown_report = api_mac_tarama_markdown_uret(report)
    report_path = raporu_dosyaya_yaz(markdown_report, output_file)
    return {
        "output_file": str(report_path),
        "report": report,
        "markdown": markdown_report,
    }


def ilk_macli_gunu_bul(
    client: FootballDataClient,
    start_date: str,
    lookahead_days: int = DEFAULT_LOOKAHEAD_DAYS,
) -> dict[str, Any]:
    """
    Bugunden baslayarak ilk mac bulunan tarihi arar.

    Arama sirasi:
    1. Bugun
    2. Yarin
    3. Onumuzdeki 7 gunluk pencere icindeki ilk dolu gun

    Returns:
        Kullanilan mac tarihi, taranan tarihler ve bulunan mac listesini iceren
        sozluk. Hic mac bulunamazsa son liste bos doner.
    """
    checked_dates: list[dict[str, Any]] = []
    candidate_dates = tarih_araligi_uret(start_date, lookahead_days)

    for candidate_date in candidate_dates:
        matches = bugunku_maclari_cek(client, candidate_date)
        checked_dates.append(
            {
                "date": candidate_date,
                "match_count": len(matches),
            }
        )
        if matches:
            return {
                "match_date": candidate_date,
                "matches": matches,
                "checked_dates": checked_dates,
                "fallback_used": candidate_date != start_date,
            }

    return {
        "match_date": candidate_dates[-1] if candidate_dates else start_date,
        "matches": [],
        "checked_dates": checked_dates,
        "fallback_used": bool(candidate_dates and candidate_dates[-1] != start_date),
    }


def lig_kodlarini_cikar(matches: list[dict[str, Any]]) -> list[str]:
    """
    Mac listesindeki benzersiz lig kodlarini cikarir.

    football-data.org genel mac endpointi bazi yanitlarda sadece lig adini
    dondurebilir. Kod yoksa bu lig icin gecmis veri cekme adimi atlanir.
    """
    codes: list[str] = []
    for match in matches:
        code = match.get("competition_code")
        if code is None:
            continue
        code_text = str(code)
        if code_text not in codes:
            codes.append(code_text)
    return codes


def mac_lig_anahtari(match: dict[str, Any]) -> str | None:
    """
    Macin lig anahtarini dondurur.
    """
    code = match.get("competition_code")
    if code is None:
        return None
    return str(code)


def gecmis_maclari_cek(
    client: FootballDataClient,
    competition_keys: list[str],
) -> dict[str, list[dict[str, Any]]]:
    """
    Bugunku maclarin ligleri icin bitmis mac gecmisi ceker.

    API yetkisi olmayan liglerde hata yutulur ve ilgili lig icin bos liste
    kullanilir. Bu durumda tahmin motoru dusuk confidence uretecektir.
    """
    history_by_competition: dict[str, list[dict[str, Any]]] = {}

    for competition_key in competition_keys:
        try:
            response = client.get_recent_matches(
                competition_code=competition_key,
                limit=10_000,
                status="FINISHED",
            )
            history_by_competition[competition_key] = maclari_parse_et(response)
        except FootballDataApiError:
            history_by_competition[competition_key] = []

    return history_by_competition


def maci_analiz_et(
    match: dict[str, Any],
    history_matches: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Tek bir bugunku maci mevcut motorlarla analiz eder.
    """
    report = tahmin_raporu_uret(
        history_matches,
        home_team_id=match.get("home_team_id"),
        away_team_id=match.get("away_team_id"),
        home_team_name=match.get("home_team_name"),
        away_team_name=match.get("away_team_name"),
        competition_code=str(match.get("competition_code") or ""),
        competition_name=match.get("competition_name"),
    )

    scores = report["scores"]
    markets = marketleri_sirala(scores)
    strongest_market = markets[0] if markets else {
        "market": "Belirsiz",
        "market_kodu": None,
        "score": 0,
    }

    form_detail = report["engine_details"]["form"]
    form_score = round(float(form_detail["average_form_score"]), 2)
    faz2_power_report = mac_guc_skoru_uret(
        history_matches,
        home_team_id=match.get("home_team_id"),
        away_team_id=match.get("away_team_id"),
        home_team_name=match.get("home_team_name"),
        away_team_name=match.get("away_team_name"),
        competition_code=str(match.get("competition_code") or ""),
        competition_name=match.get("competition_name"),
    )
    power_score = faz2_power_report["GUC_SKORU"]

    return {
        "match_id": match.get("match_id"),
        "utc_date": match.get("utc_date"),
        "competition_name": match.get("competition_name"),
        "home_team": match.get("home_team_name"),
        "away_team": match.get("away_team_name"),
        "status": match.get("status"),
        "form_score": form_score,
        "kg_var_score": scores["KG_VAR_SCORE"],
        "ilk_yari_kg_score": scores["ILK_YARI_KG_SCORE"],
        "ikinci_yari_kg_score": scores["IKINCI_YARI_KG_SCORE"],
        "ust_25_score": scores["UST_25_SCORE"],
        "guc_skoru": power_score,
        "confidence": faz2_power_report["confidence"],
        "kg_var_olasiligi": faz2_power_report["KG_VAR_OLASILIGI"],
        "ust_25_olasiligi": faz2_power_report["UST_25_OLASILIGI"],
        "en_guclu_market": strongest_market,
        "ilk_3_market": markets[:3],
        "engine_report": report,
        "faz2_power_report": faz2_power_report,
    }


def gunun_maclarini_tara(
    client: FootballDataClient | None = None,
    target_date: str | None = None,
    limit: int = DEFAULT_MATCH_LIMIT,
    lookahead_days: int = DEFAULT_LOOKAHEAD_DAYS,
) -> dict[str, Any]:
    """
    Ilk mac bulunan gunu ceker, analiz eder ve en guclu ilk maclari siralar.
    """
    active_client = client or FootballDataClient()
    analysis_date = target_date or bugunun_tarihi()
    selected_day = ilk_macli_gunu_bul(
        active_client,
        start_date=analysis_date,
        lookahead_days=lookahead_days,
    )
    selected_matches = selected_day["matches"]
    match_date = selected_day["match_date"]

    competition_keys = lig_kodlarini_cikar(selected_matches)
    history_by_competition = gecmis_maclari_cek(active_client, competition_keys)

    analyzed_matches = []
    for match in selected_matches:
        competition_key = mac_lig_anahtari(match)
        history = history_by_competition.get(competition_key or "", [])
        analyzed_matches.append(maci_analiz_et(match, history))

    ranked_matches = sorted(
        analyzed_matches,
        key=lambda row: row["guc_skoru"],
        reverse=True,
    )

    return {
        "rapor_tipi": "GUNUN_MACLARI_TARAMA_RAPORU",
        "analysis_date": analysis_date,
        "match_date": match_date,
        "date": match_date,
        "checked_dates": selected_day["checked_dates"],
        "fallback_used": selected_day["fallback_used"],
        "total_matches": len(selected_matches),
        "analyzed_matches": len(analyzed_matches),
        "top_matches": ranked_matches[:limit],
    }


def markdown_raporu_uret(report: dict[str, Any]) -> str:
    """
    Gunun maclari tarama raporunu Markdown metnine cevirir.
    """
    lines = [
        "# Bugunun En Guclu Maclari",
        "",
        "## Rapor Bilgisi",
        "",
        f"ANALIZ_TARIHI: {report['analysis_date']}",
        f"MAC_TARIHI: {report['match_date']}",
        f"TOPLAM_MAC: {report['total_matches']}",
        "",
        "## Ozet",
        "",
        f"API'den cekilen mac sayisi: {report['total_matches']}",
        f"Analiz edilen mac sayisi: {report['analyzed_matches']}",
        "",
        "## Skorlanan Maclar",
        "",
        (
            "| Sira | Mac | Lig | En Guclu Market | Ilk 3 Market | "
            "Form | KG Var | Ilk Yari KG | Ikinci Yari KG | Ust 2.5 | "
            "KG Olasilik | Ust 2.5 Olasilik | Guc Skoru | Confidence |"
        ),
        "|---:|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|",
    ]

    if not report["top_matches"]:
        lines.extend(
            [
                "| - | Taranan tarih araliginda mac bulunamadi | - | - | - | - | - | - | - | - | - | - | - | - |",
                "",
                "## Taranan Tarihler",
                "",
                *[
                    f"- {row['date']}: {row['match_count']} mac"
                    for row in report.get("checked_dates", [])
                ],
                "",
                "## Not",
                "",
                "API hedef tarih araligi icin mac dondurmedi veya abonelik kapsami disinda kaldi.",
            ]
        )
        return "\n".join(lines)

    for index, match in enumerate(report["top_matches"], start=1):
        first_three = ", ".join(
            f"{row['market']} ({row['score']})" for row in match["ilk_3_market"]
        )
        strongest = match["en_guclu_market"]
        lines.append(
            "| {sira} | {home} - {away} | {league} | {market} ({market_score}) | "
            "{first_three} | {form} | {kg} | {iy} | {iiy} | {ust} | "
            "{kg_prob} | {ust_prob} | {power} | {confidence} |".format(
                sira=index,
                home=match["home_team"],
                away=match["away_team"],
                league=match["competition_name"] or "-",
                market=strongest["market"],
                market_score=strongest["score"],
                first_three=first_three,
                form=match["form_score"],
                kg=match["kg_var_score"],
                iy=match["ilk_yari_kg_score"],
                iiy=match["ikinci_yari_kg_score"],
                ust=match["ust_25_score"],
                kg_prob=match.get("kg_var_olasiligi", match["kg_var_score"]),
                ust_prob=match.get("ust_25_olasiligi", match["ust_25_score"]),
                power=match["guc_skoru"],
                confidence=match["confidence"].upper(),
            )
        )

    lines.extend(
        [
            "",
            "## Taranan Tarihler",
            "",
            *[
                f"- {row['date']}: {row['match_count']} mac"
                for row in report.get("checked_dates", [])
            ],
            "",
            "## Yorumlama Notu",
            "",
            "- Bugun mac yoksa sistem yarini, sonra 7 gunluk pencereyi tarar.",
            "- Raporda kullanilan mac tarihi `MAC_TARIHI` alaninda gosterilir.",
            "- Guc skoru 0-100 araligindadir.",
            "- Ilk 3 market, ilgili mac icin en yuksek skorlu marketleri gosterir.",
            "- Confidence seviyesi mac gecmisi ve devre verisi miktarina gore belirlenir.",
            "- Bu rapor karar destek amaclidir; kesin sonuc iddiasi olarak kullanilmamalidir.",
        ]
    )
    return "\n".join(lines)


def raporu_dosyaya_yaz(
    markdown_report: str,
    output_file: Path = DEFAULT_OUTPUT_FILE,
) -> Path:
    """
    Markdown raporunu dosyaya yazar.
    """
    output_file.parent.mkdir(parents=True, exist_ok=True)
    output_file.write_text(markdown_report, encoding="utf-8")
    return output_file


def gunun_maclari_raporu_uret(
    client: FootballDataClient | None = None,
    target_date: str | None = None,
    output_file: Path = DEFAULT_OUTPUT_FILE,
) -> dict[str, Any]:
    """
    Uc adimli tam is akisini calistirir: cek, analiz et, Markdown raporu yaz.
    """
    report = gunun_maclarini_tara(client=client, target_date=target_date)
    markdown_report = markdown_raporu_uret(report)
    report_path = raporu_dosyaya_yaz(markdown_report, output_file)
    return {
        "output_file": str(report_path),
        "report": report,
        "markdown": markdown_report,
    }


if __name__ == "__main__":
    try:
        result = gunun_maclari_raporu_uret()
        print(result["markdown"])
        print("\nJSON_RAPOR:")
        print(json.dumps(result["report"], ensure_ascii=False, indent=2))
    except Exception as exc:
        print(f"Gunun maclari tarama hatasi: {exc}")

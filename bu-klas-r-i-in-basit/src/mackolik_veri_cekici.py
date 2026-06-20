"""
Mackolik Arsiv veri cekme modulu.

Bu modul bahis/kupon/uyelik/odeme islemi yapmaz. Sadece herkese gorunen
mac programi ve oran alanlarini okuyup ham veri havuzuna eklemeye calisir.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    from ham_veri_havuzu import havuz_oku, havuz_yaz, maclari_havuza_ekle
except ImportError:
    from src.ham_veri_havuzu import havuz_oku, havuz_yaz, maclari_havuza_ekle


MACKOLIK_URL = "https://arsiv.mackolik.com/Iddaa-Programi"
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RAW_POOL_FILE = Path("data") / "ham_mac_havuzu.json"
DEFAULT_REPORT_FILE = Path("outputs") / "mackolik_veri_cekme_raporu.md"

FORBIDDEN_ACTION_TEXTS = (
    "kupona ekle",
    "kupon oyna",
    "para yatır",
    "para yatir",
    "para çek",
    "para cek",
    "satın al",
    "satin al",
    "onayla",
    "bahis al",
    "üye ol",
    "uye ol",
    "üyelik oluştur",
    "uyelik olustur",
)

ODD_FIELDS = {
    "ms_1": ("1", "ms 1", "mac sonucu 1", "maç sonucu 1"),
    "ms_x": ("x", "ms x", "mac sonucu x", "maç sonucu x"),
    "ms_2": ("2", "ms 2", "mac sonucu 2", "maç sonucu 2"),
    "kg_var": ("kg var", "var", "karşılıklı gol var", "karsilikli gol var"),
    "kg_yok": ("kg yok", "yok", "karşılıklı gol yok", "karsilikli gol yok"),
    "alt_25": ("2.5 alt", "alt 2.5", "2,5 alt", "alt 2,5"),
    "ust_25": ("2.5 üst", "2.5 ust", "üst 2.5", "ust 2.5", "2,5 üst", "2,5 ust"),
    "alt_35": ("3.5 alt", "alt 3.5", "3,5 alt", "alt 3,5"),
    "ust_35": ("3.5 üst", "3.5 ust", "üst 3.5", "ust 3.5", "3,5 üst", "3,5 ust"),
    "iy_kg": ("iy kg", "ilk yari kg", "ilk yarı kg", "ilk yarı karşılıklı gol", "ilk yari karsilikli gol"),
    "ikinci_yari_kg": ("2y kg", "ikinci yari kg", "ikinci yarı kg", "ikinci yarı karşılıklı gol", "ikinci yari karsilikli gol"),
    "iy_ms": ("iy/ms", "iy ms", "ilk yari/mac sonucu", "ilk yarı/maç sonucu"),
    "iy_1": ("ilk yarı 1", "ilk yari 1", "iy 1"),
    "iy_x": ("ilk yarı x", "ilk yari x", "iy x"),
    "iy_2": ("ilk yarı 2", "ilk yari 2", "iy 2"),
    "cifte_1x": ("1x", "çifte şans 1x", "cifte sans 1x"),
    "cifte_12": ("12", "çifte şans 12", "cifte sans 12"),
    "cifte_x2": ("x2", "çifte şans x2", "cifte sans x2"),
}

# Detay metni icinde tek harfli "1", "x", "2" cok fazla yanlis eslesme yapar.
# Bu nedenle detay okuma icin yalnizca acik market adlari kullanilir.
DETAIL_ODD_FIELDS = {
    field: tuple(alias for alias in aliases if len(alias.strip()) > 1)
    for field, aliases in ODD_FIELDS.items()
}


def simdi_iso() -> str:
    """UTC zaman damgasini ISO formatinda doner."""
    return datetime.now(timezone.utc).isoformat()


def bos_sonuc(url: str = MACKOLIK_URL) -> dict[str, Any]:
    """Mackolik veri cekme isinin varsayilan sonuc sozlugunu olusturur."""
    return {
        "source": "mackolik",
        "url": url,
        "started_at": simdi_iso(),
        "finished_at": None,
        "status": "not_started",
        "found_matches": 0,
        "saved_matches": 0,
        "duplicate_matches": 0,
        "leagues": [],
        "readable_odd_fields": [],
        "unreadable_odd_fields": list(ODD_FIELDS.keys()),
        "errors": [],
        "raw_pool_total_matches": 0,
        "matches": [],
        "ready": False,
    }


def oran_metni_mi(value: str) -> bool:
    """Metnin oran degeri gibi gorunup gorunmedigini kontrol eder."""
    text = value.strip().replace(",", ".")
    return bool(re.fullmatch(r"\d{1,3}\.\d{1,3}", text))


def sayi_metnine_cevir(value: str) -> float | None:
    """Oran metnini float degerine cevirir."""
    cleaned = value.strip().replace(",", ".")
    if not oran_metni_mi(cleaned):
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def yasakli_aksiyon_metni_mi(text: str) -> bool:
    """Tiklarken kesinlikle dokunulmayacak aksiyon metinlerini denetler."""
    normalized = text.casefold()
    return any(forbidden in normalized for forbidden in FORBIDDEN_ACTION_TEXTS)


def mac_anahtari(match: dict[str, Any]) -> str:
    """Mackolik icin tarih + saat + takimlardan benzersiz anahtar uretir."""
    return "mackolik:{date}:{time}:{home}:{away}".format(
        date=match.get("tarih") or match.get("utc_date") or "",
        time=match.get("saat") or "",
        home=match.get("ev_sahibi") or match.get("home_team_name") or "",
        away=match.get("deplasman") or match.get("away_team_name") or "",
    ).casefold()


def normalize_match_for_pool(match: dict[str, Any]) -> dict[str, Any]:
    """Mackolik kaydini mevcut ham veri havuzu semasina uyumlu hale getirir."""
    normalized = dict(match)
    normalized["match_id"] = mac_anahtari(match)
    normalized["source"] = "mackolik"
    normalized["raw_pool_key"] = normalized["match_id"]
    normalized["competition_name"] = match.get("lig")
    normalized["home_team_name"] = match.get("ev_sahibi")
    normalized["away_team_name"] = match.get("deplasman")
    normalized["utc_date"] = match.get("tarih") or ""
    normalized["source_url"] = match.get("sayfa_url") or MACKOLIK_URL
    normalized.setdefault("status", "SCHEDULED")
    normalized.setdefault("stored_at", simdi_iso())
    return normalized


def hucre_metnini_temizle(value: str) -> str:
    """DOM hucre metnini tek satirlik temiz metne cevirir."""
    return re.sub(r"\s+", " ", value or "").strip()


def kolon_eslestirmesi(headers: list[str]) -> dict[str, int]:
    """Tablo basliklarindan bilinen alanlara kolon eslestirmesi uretir."""
    mapping: dict[str, int] = {}
    for index, header in enumerate(headers):
        key = header.casefold()
        if "saat" in key:
            mapping.setdefault("saat", index)
        elif "lig" in key:
            mapping.setdefault("lig", index)
        elif "kod" in key:
            mapping.setdefault("mac_kodu", index)
        elif "ev" in key and ("sahibi" in key or "takım" in key or "takim" in key):
            mapping.setdefault("ev_sahibi", index)
        elif "misafir" in key or "deplasman" in key:
            mapping.setdefault("deplasman", index)
        for field, aliases in ODD_FIELDS.items():
            if any(alias in key for alias in aliases):
                mapping.setdefault(field, index)
    return mapping


def hucreden(headers: list[str], cells: list[str], mapping: dict[str, int], field: str) -> str | None:
    """Kolon eslestirmesiyle hucre degeri okur."""
    index = mapping.get(field)
    if index is None or index >= len(cells):
        return None
    value = hucre_metnini_temizle(cells[index])
    return value or None


def satirdan_mac_cikar(
    headers: list[str],
    cells: list[str],
    mapping: dict[str, int],
    current_date: str,
    url: str,
    current_league: str | None = None,
) -> dict[str, Any] | None:
    """Bir tablo satirindan mac kaydi uretmeye calisir."""
    if len(cells) < 4:
        return None

    if re.fullmatch(r"\d{1,2}:\d{2}", cells[0] or ""):
        team_cell_index = next(
            (
                idx
                for idx, value in enumerate(cells)
                if " - " in value and not oran_metni_mi(value)
            ),
            None,
        )
        if team_cell_index is not None:
            home, away = [part.strip() for part in cells[team_cell_index].split(" - ", 1)]
            code_index = team_cell_index + 2 if team_cell_index + 2 < len(cells) else None
            odds: dict[str, float] = {}
            if code_index is not None:
                field_indexes = {
                    "ms_1": code_index + 1,
                    "ms_x": code_index + 2,
                    "ms_2": code_index + 3,
                    "alt_25": code_index + 5,
                    "ust_25": code_index + 6,
                }
                for field, idx in field_indexes.items():
                    if idx < len(cells):
                        odd = sayi_metnine_cevir(cells[idx])
                        if odd is not None:
                            odds[field] = odd
            unreadable = [field for field in ODD_FIELDS if field not in odds]
            return {
                "tarih": current_date,
                "saat": cells[0],
                "lig": current_league,
                "ev_sahibi": home,
                "deplasman": away,
                "mac_kodu": cells[code_index] if code_index is not None else None,
                "oranlar": odds,
                "okunamayan_oran_alanlari": unreadable,
                "kaynak": "mackolik",
                "sayfa_url": url,
                "raw_cells": cells,
            }

    if not any(re.fullmatch(r"\d{1,2}:\d{2}", cell or "") for cell in cells):
        return None

    saat = hucreden(headers, cells, mapping, "saat")
    ev_sahibi = hucreden(headers, cells, mapping, "ev_sahibi")
    deplasman = hucreden(headers, cells, mapping, "deplasman")

    if not ev_sahibi or not deplasman:
        candidates = [
            value
            for value in cells
            if value and not oran_metni_mi(value) and not re.fullmatch(r"\d{1,5}", value)
        ]
        if len(candidates) >= 2:
            ev_sahibi = ev_sahibi or candidates[-2]
            deplasman = deplasman or candidates[-1]

    if not ev_sahibi or not deplasman:
        return None

    odds: dict[str, float] = {}
    unreadable = []
    for field in ODD_FIELDS:
        value = hucreden(headers, cells, mapping, field)
        odd = sayi_metnine_cevir(value or "")
        if odd is None:
            unreadable.append(field)
        else:
            odds[field] = odd

    return {
        "tarih": current_date,
        "saat": saat,
        "lig": hucreden(headers, cells, mapping, "lig") or current_league,
        "ev_sahibi": ev_sahibi,
        "deplasman": deplasman,
        "mac_kodu": hucreden(headers, cells, mapping, "mac_kodu"),
        "oranlar": odds,
        "okunamayan_oran_alanlari": unreadable,
        "kaynak": "mackolik",
        "sayfa_url": url,
        "raw_cells": cells,
    }


def detay_oranlarini_metinden_cikar(text: str) -> dict[str, float]:
    """Acilan detay bolumu metninden ek market oranlarini okur."""
    normalized = hucre_metnini_temizle(text).casefold().replace(",", ".")
    odds: dict[str, float] = {}
    if not normalized:
        return odds

    for field, aliases in DETAIL_ODD_FIELDS.items():
        if not aliases:
            continue
        for alias in aliases:
            clean_alias = re.escape(alias.casefold().replace(",", "."))
            patterns = (
                rf"{clean_alias}[^0-9]{{0,80}}(\d{{1,3}}\.\d{{1,3}})",
                rf"(\d{{1,3}}\.\d{{1,3}})[^a-zA-ZğüşöçıİĞÜŞÖÇ0-9]{{0,40}}{clean_alias}",
            )
            for pattern in patterns:
                match = re.search(pattern, normalized)
                if not match:
                    continue
                odd = sayi_metnine_cevir(match.group(1))
                if odd is not None:
                    odds[field] = odd
                    break
            if field in odds:
                break
    return odds


def mac_kodu_satirdan_al(cells: list[str], row_text: str = "") -> str | None:
    """Detay butonunun bulundugu satirdan mac kodunu bulur."""
    for cell in cells:
        if re.fullmatch(r"\d{4,5}", cell or ""):
            return cell
    match = re.search(r"\b\d{4,5}\b", row_text or "")
    return match.group(0) if match else None


def yakin_detay_metni(row: Any) -> str:
    """Tumu tiklandiktan sonra mac satiri ve takip eden detay satirlarindan metin toplar."""
    try:
        return row.evaluate(
            """
            (tr) => {
              const texts = [];
              let current = tr;
              for (let index = 0; index < 8 && current; index += 1) {
                if (current.innerText) texts.push(current.innerText);
                current = current.nextElementSibling;
              }
              return texts.join('\n');
            }
            """
        )
    except Exception:
        try:
            return row.inner_text(timeout=1000)
        except Exception:
            return ""


def detaylari_acmayi_dene(page: Any) -> dict[str, Any]:
    """
    Mac detayindaki "Tumu" alanlarini sadece veri okumak icin acmayi dener.

    Yasakli aksiyon metinleri iceren buton/linklere tiklanmaz.
    """
    report = {
        "attempted": 0,
        "opened": 0,
        "skipped_forbidden": 0,
        "detail_odds_matches": 0,
        "detail_odd_fields": 0,
        "details_by_code": {},
        "errors": [],
    }
    try:
        candidates = page.locator("text=/^\\s*T(ü|u)m(ü|u)?\\s*$/i")
        count = min(candidates.count(), 25)
    except Exception as exc:
        report["errors"].append(f"Detay adaylari okunamadi: {exc}")
        return report

    for index in range(count):
        report["attempted"] += 1
        try:
            item = candidates.nth(index)
            text = hucre_metnini_temizle(item.inner_text(timeout=1000))
            if yasakli_aksiyon_metni_mi(text):
                report["skipped_forbidden"] += 1
                continue

            row = item.locator("xpath=ancestor::tr[1]")
            row_cells = [hucre_metnini_temizle(value) for value in row.locator("td").all_inner_texts()]
            row_text = hucre_metnini_temizle(row.inner_text(timeout=1000))
            match_code = mac_kodu_satirdan_al(row_cells, row_text)

            item.click(timeout=2000, force=True)
            page.wait_for_timeout(450)
            report["opened"] += 1

            detail_text = yakin_detay_metni(row)
            detail_odds = detay_oranlarini_metinden_cikar(detail_text)
            if match_code and detail_odds:
                existing = report["details_by_code"].setdefault(match_code, {})
                existing.update(detail_odds)
        except Exception as exc:
            report["errors"].append(f"Detay acilamadi #{index + 1}: {exc}")

    report["detail_odds_matches"] = len(report["details_by_code"])
    report["detail_odd_fields"] = sum(len(odds) for odds in report["details_by_code"].values())
    return report


def detay_oranlarini_maclara_ekle(matches: list[dict[str, Any]], detail_report: dict[str, Any]) -> None:
    """Detaydan okunan oranlari ayni mac kaydinin oranlar alanina ekler."""
    details_by_code = detail_report.get("details_by_code") or {}
    for match in matches:
        code = str(match.get("mac_kodu") or "").strip()
        if not code or code not in details_by_code:
            continue
        detail_odds = details_by_code[code]
        odds = match.setdefault("oranlar", {})
        odds.update(detail_odds)
        match["detay_oranlar"] = detail_odds
        match["detay_oran_sayisi"] = len(detail_odds)
        match["okunamayan_oran_alanlari"] = [field for field in ODD_FIELDS if field not in odds]


def sayfadaki_maclari_oku(page: Any, url: str = MACKOLIK_URL) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Acik Playwright sayfasindan tablo satirlarini okuyup mac listesi uretir."""
    detail_report = detaylari_acmayi_dene(page)
    current_date = hucre_metnini_temizle(page.locator("body").inner_text(timeout=5000))
    date_match = re.search(r"\b\d{1,2}\.\d{1,2}\.\d{4}\b", current_date)
    current_date_text = date_match.group(0) if date_match else datetime.now().strftime("%d.%m.%Y")
    current_league: str | None = None

    rows = page.locator("table tr")
    row_count = rows.count()
    matches: list[dict[str, Any]] = []
    headers: list[str] = []
    mapping: dict[str, int] = {}

    for index in range(row_count):
        row = rows.nth(index)
        header_cells = [
            hucre_metnini_temizle(value)
            for value in row.locator("th").all_inner_texts()
        ]
        if header_cells:
            headers = header_cells
            mapping = kolon_eslestirmesi(headers)
            continue

        cells = [
            hucre_metnini_temizle(value)
            for value in row.locator("td").all_inner_texts()
        ]
        if not cells:
            continue

        if len(cells) == 1 and cells[0] and not re.search(r"\d{1,2}\.\d{1,2}\.\d{4}", cells[0]):
            text = cells[0]
            if "lige göre" not in text.casefold() and "tarihe göre" not in text.casefold():
                current_league = text
            continue

        row_date = next(
            (
                cell
                for cell in cells
                if re.fullmatch(r"\d{1,2}\.\d{1,2}\.\d{4}", cell or "")
            ),
            None,
        )
        if row_date:
            current_date_text = row_date
            continue

        match = satirdan_mac_cikar(
            headers,
            cells,
            mapping,
            current_date_text,
            url,
            current_league=current_league,
        )
        if match:
            matches.append(match)

    unique: dict[str, dict[str, Any]] = {}
    for match in matches:
        unique[mac_anahtari(match)] = match
    unique_matches = list(unique.values())
    detay_oranlarini_maclara_ekle(unique_matches, detail_report)

    return unique_matches, detail_report


def mackolik_verilerini_cek(
    url: str = MACKOLIK_URL,
    headless: bool = True,
    timeout_ms: int = 30000,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Playwright ile Mackolik arsiv sayfasini acip gorunen maclari okur."""
    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        raise RuntimeError(
            "Playwright kurulu degil. Kurulum: python -m pip install -r requirements.txt "
            "ve ardindan python -m playwright install chromium"
        ) from exc

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=headless)
        page = browser.new_page()
        page.set_default_timeout(timeout_ms)
        page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
        page.wait_for_timeout(1500)
        matches, detail_report = sayfadaki_maclari_oku(page, url)
        browser.close()
    return matches, detail_report


def havuza_kaydet(
    matches: list[dict[str, Any]],
    raw_pool_file: str | Path = DEFAULT_RAW_POOL_FILE,
) -> tuple[dict[str, Any], dict[str, int]]:
    """Mackolik maclarini mevcut ham havuza tekrar etmeden ekler."""
    normalized_matches = [normalize_match_for_pool(match) for match in matches]
    pool = havuz_oku(raw_pool_file)
    pool, duplicate_report = maclari_havuza_ekle(
        pool,
        normalized_matches,
        source="mackolik_arsiv",
    )
    havuz_yaz(pool, raw_pool_file)
    return pool, duplicate_report


def rapor_markdown_uret(result: dict[str, Any]) -> str:
    """Mackolik veri cekme sonucundan Markdown raporu uretir."""
    lines = [
        "# Mackolik Veri Cekme Raporu",
        "",
        f"Tarih: {simdi_iso()}",
        "",
        "## Ozet",
        "",
        f"- Kaynak: {result.get('url')}",
        f"- Durum: {result.get('status')}",
        f"- Kac mac bulundu: {result.get('found_matches')}",
        f"- Kac mac kaydedildi: {result.get('saved_matches')}",
        f"- Kac mac zaten vardi: {result.get('duplicate_matches')}",
        f"- Ham veri havuzu toplam mac sayisi: {result.get('raw_pool_total_matches')}",
        "",
        "## Ligler",
        "",
    ]
    leagues = result.get("leagues") or []
    if leagues:
        lines.extend(f"- {league}" for league in leagues)
    else:
        lines.append("- Lig verisi okunamadi veya mac bulunamadi.")

    lines.extend(["", "## Okunabilen Oran Alanlari", ""])
    readable = result.get("readable_odd_fields") or []
    if readable:
        lines.extend(f"- {field}" for field in readable)
    else:
        lines.append("- Oran alani okunamadi.")

    lines.extend(["", "## Okunamayan Oran Alanlari", ""])
    unreadable = result.get("unreadable_odd_fields") or []
    if unreadable:
        lines.extend(f"- {field}" for field in unreadable)
    else:
        lines.append("- Okunamayan oran alani yok.")

    detail_report = result.get("detail_report") or {}
    lines.extend(
        [
            "",
            "## Mac Detay Pencereleri",
            "",
            f"- Denenen Tumu alani: {detail_report.get('attempted', 0)}",
            f"- Acilan detay: {detail_report.get('opened', 0)}",
            f"- Detaydan oran okunan mac: {detail_report.get('detail_odds_matches', 0)}",
            f"- Detaydan okunan oran alani: {detail_report.get('detail_odd_fields', 0)}",
            f"- Yasakli aksiyon nedeniyle atlanan: {detail_report.get('skipped_forbidden', 0)}",
        ]
    )

    errors = list(result.get("errors") or [])
    errors.extend(detail_report.get("errors") or [])
    lines.extend(["", "## Hatalar", ""])
    if errors:
        lines.extend(f"- {error}" for error in errors)
    else:
        lines.append("- Hata yok.")

    lines.extend(["", "## Ornek Maclar", ""])
    matches = result.get("matches") or []
    if matches:
        lines.extend(
            [
                "| Tarih | Saat | Lig | Ev Sahibi | Deplasman | Mac Kodu | Okunan Oran Sayisi |",
                "|---|---|---|---|---|---|---:|",
            ]
        )
        for match in matches[:20]:
            odds = match.get("oranlar") or {}
            lines.append(
                "| {tarih} | {saat} | {lig} | {home} | {away} | {code} | {odd_count} |".format(
                    tarih=match.get("tarih") or "-",
                    saat=match.get("saat") or "-",
                    lig=match.get("lig") or "-",
                    home=match.get("ev_sahibi") or "-",
                    away=match.get("deplasman") or "-",
                    code=match.get("mac_kodu") or "-",
                    odd_count=len(odds),
                )
            )
    else:
        lines.append("- Ornek mac yok.")

    ready_text = "EVET" if result.get("ready") else "HAYIR"
    lines.extend(
        [
            "",
            "## Sonuc",
            "",
            f"MAÇKOLİK VERİ ÇEKME SİSTEMİ HAZIR MI? {ready_text}",
        ]
    )
    return "\n".join(lines)


def raporu_yaz(markdown: str, report_file: str | Path = DEFAULT_REPORT_FILE) -> Path:
    """Markdown raporunu dosyaya yazar."""
    path = Path(report_file)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(markdown, encoding="utf-8")
    return path


def mackolik_veri_cekme_isini_calistir(
    url: str = MACKOLIK_URL,
    raw_pool_file: str | Path = DEFAULT_RAW_POOL_FILE,
    report_file: str | Path = DEFAULT_REPORT_FILE,
    headless: bool = True,
) -> dict[str, Any]:
    """Mackolik veri cekme, havuza yazma ve raporlama isini tek adimda calistirir."""
    result = bos_sonuc(url)
    try:
        matches, detail_report = mackolik_verilerini_cek(url=url, headless=headless)
        result["detail_report"] = detail_report
        result["matches"] = matches
        result["found_matches"] = len(matches)
        result["leagues"] = sorted({match.get("lig") for match in matches if match.get("lig")})

        readable_fields = sorted(
            {
                field
                for match in matches
                for field in (match.get("oranlar") or {}).keys()
            }
        )
        result["readable_odd_fields"] = readable_fields
        result["unreadable_odd_fields"] = [
            field for field in ODD_FIELDS if field not in readable_fields
        ]

        try:
            pool, duplicate_report = havuza_kaydet(matches, raw_pool_file)
            result["saved_matches"] = duplicate_report.get("new_matches_added", 0)
            result["duplicate_matches"] = duplicate_report.get("duplicate_matches", 0)
            result["raw_pool_total_matches"] = pool.get("match_count", len(pool.get("matches", [])))
            result["status"] = "success"
            result["ready"] = True
        except OSError as exc:
            result["errors"].append(f"Ham veri havuzu yazilamadi: {exc}")
            result["status"] = "partial_success" if matches else "error"
            result["ready"] = False
            try:
                pool = havuz_oku(raw_pool_file)
                result["raw_pool_total_matches"] = pool.get("match_count", len(pool.get("matches", [])))
            except Exception as pool_exc:
                result["errors"].append(f"Ham veri havuzu okunamadi: {pool_exc}")
    except Exception as exc:
        result["status"] = "error"
        result["errors"].append(str(exc))
        try:
            pool = havuz_oku(raw_pool_file)
            result["raw_pool_total_matches"] = pool.get("match_count", len(pool.get("matches", [])))
        except Exception as pool_exc:
            result["errors"].append(f"Ham veri havuzu okunamadi: {pool_exc}")
        result["ready"] = False
    finally:
        result["finished_at"] = simdi_iso()
        markdown = rapor_markdown_uret(result)
        try:
            raporu_yaz(markdown, report_file)
        except OSError as exc:
            result["errors"].append(f"Rapor dosyaya yazilamadi: {exc}")
            result["markdown"] = markdown
    return result


if __name__ == "__main__":
    output = mackolik_veri_cekme_isini_calistir()
    print(json.dumps(output, ensure_ascii=False, indent=2))

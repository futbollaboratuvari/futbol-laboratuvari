from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import mackolik_veri_cekici as base

ISTANBUL_TZ = ZoneInfo("Europe/Istanbul")


def bugun() -> str:
    return datetime.now(ISTANBUL_TZ).strftime("%d.%m.%Y")


def dun() -> str:
    return (datetime.now(ISTANBUL_TZ) - timedelta(days=1)).strftime("%d.%m.%Y")


def erken_saat(value: str | None) -> bool:
    match = re.fullmatch(r"(\d{1,2}):(\d{2})", str(value or "").strip())
    if not match:
        return False
    hour = int(match.group(1))
    minute = int(match.group(2))
    return 0 <= hour < 8 and 0 <= minute < 60


def sayfadaki_maclari_oku(page: Any, url: str = base.MACKOLIK_URL) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    detail_report = base.detaylari_acmayi_dene(page)
    target_date_text = bugun()
    previous_date_text = dun()
    current_date_text = target_date_text
    current_league: str | None = None

    rows = page.locator("table tr")
    row_count = rows.count()
    matches: list[dict[str, Any]] = []
    headers: list[str] = []
    mapping: dict[str, int] = {}

    for index in range(row_count):
        row = rows.nth(index)
        header_cells = [base.hucre_metnini_temizle(value) for value in row.locator("th").all_inner_texts()]
        if header_cells:
            headers = header_cells
            mapping = base.kolon_eslestirmesi(headers)
            continue

        cells = [base.hucre_metnini_temizle(value) for value in row.locator("td").all_inner_texts()]
        if not cells:
            continue

        if len(cells) == 1 and cells[0] and not re.search(r"\d{1,2}\.\d{1,2}\.\d{4}", cells[0]):
            text = cells[0]
            if "lige göre" not in text.casefold() and "tarihe göre" not in text.casefold():
                current_league = text
            continue

        row_date = next((cell for cell in cells if re.fullmatch(r"\d{1,2}\.\d{1,2}\.\d{4}", cell or "")), None)
        if row_date:
            current_date_text = row_date
            continue

        row_time = next((cell for cell in cells if re.fullmatch(r"\d{1,2}:\d{2}", cell or "")), None)
        use_date_text = current_date_text
        if current_date_text == previous_date_text and erken_saat(row_time):
            use_date_text = target_date_text
        elif current_date_text != target_date_text:
            continue

        match = base.satirdan_mac_cikar(
            headers,
            cells,
            mapping,
            use_date_text,
            url,
            current_league=current_league,
        )
        if match:
            matches.append(match)

    unique: dict[str, dict[str, Any]] = {}
    for match in matches:
        unique[base.mac_anahtari(match)] = match
    unique_matches = list(unique.values())
    base.detay_oranlarini_maclara_ekle(unique_matches, detail_report)
    return unique_matches, detail_report


base.sayfadaki_maclari_oku = sayfadaki_maclari_oku


if __name__ == "__main__":
    output = base.mackolik_veri_cekme_isini_calistir()
    print(json.dumps(output, ensure_ascii=False, indent=2))

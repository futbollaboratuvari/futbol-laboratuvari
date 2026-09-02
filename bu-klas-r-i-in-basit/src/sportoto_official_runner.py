import json
import re
import sys

from playwright.sync_api import sync_playwright


OFFICIAL_URL = "https://www.sportoto.gov.tr/spor-toto-listeler"


def clean(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def read_program():
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=["--no-sandbox"])
        try:
            page = browser.new_page(viewport={"width": 1440, "height": 1100}, locale="tr-TR")
            page.goto(OFFICIAL_URL, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_selector("table tbody tr", timeout=30000)
            body_text = page.locator("body").inner_text(timeout=10000)
            season_match = re.search(r"(20\d{2})\s*/\s*(20\d{2})\s+Sezonu", body_text, re.IGNORECASE)
            week_match = re.search(r"(?:^|\n)\s*(\d+)\.\s*Hafta\s*(?:\n|$)", body_text, re.IGNORECASE)
            matches = []
            for row in page.locator("table tbody tr").all():
                cells = [clean(value) for value in row.locator("td").all_inner_texts()]
                if len(cells) < 4:
                    continue
                no_match = re.search(r"\b(\d{1,2})\b", cells[0])
                teams_match = re.match(r"^(.+?)\s+[—–-]\s+(.+)$", cells[1])
                date_match = re.search(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", cells[2])
                time_match = re.search(r"\b(\d{1,2}:\d{2})\b", cells[3])
                if not (no_match and teams_match and date_match and time_match):
                    continue
                matches.append({
                    "no": int(no_match.group(1)),
                    "date": f"{date_match.group(3)}-{date_match.group(2).zfill(2)}-{date_match.group(1).zfill(2)}",
                    "time": time_match.group(1),
                    "home": clean(teams_match.group(1)),
                    "away": clean(teams_match.group(2)),
                })
            return {
                "source": OFFICIAL_URL,
                "fetch_mode": "official_rendered_page",
                "season": f"{season_match.group(1)}/{season_match.group(2)}" if season_match else None,
                "week": int(week_match.group(1)) if week_match else None,
                "matches": matches,
            }
        finally:
            browser.close()


def main():
    payload = read_program()
    if len(payload["matches"]) != 15:
        raise RuntimeError(f"official Spor Toto list must contain 15 matches; found {len(payload['matches'])}")
    if [match["no"] for match in payload["matches"]] != list(range(1, 16)):
        raise RuntimeError("official Spor Toto order is invalid")
    print(json.dumps(payload, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(str(error), file=sys.stderr)
        raise

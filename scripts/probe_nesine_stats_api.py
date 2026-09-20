import asyncio
import json
from pathlib import Path
from urllib.parse import urlparse

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = DATA / "nesine-api-probe.json"
ROUTES = ["ozet", "puan-tablosu", "rekabet-gecmisi", "son-maclari", "kadrolar", "korner-ve-kart", "hakem-bilgileri"]


def current_matches():
    payload = json.loads((DATA / "full-bulletin.json").read_text(encoding="utf-8"))
    rows = list(payload.get("matches", [])) + list(payload.get("live_matches", []))
    out = []
    for row in rows:
        event_id = row.get("nesine_stats_id") or row.get("iddaa_event_id") or row.get("official_event_id")
        if not event_id or not str(event_id).isdigit() or not (6 <= len(str(event_id)) <= 12):
            continue
        out.append({
            "id": str(event_id),
            "home": row.get("home", ""),
            "away": row.get("away", ""),
            "date": row.get("date", ""),
        })
        if len(out) >= 2:
            break
    return out


async def main():
    matches = current_matches()
    result = {"schema_version": 1, "matches": [], "observed_api_calls": []}
    seen = set()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            locale="tr-TR",
            user_agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/153 Safari/537.36",
        )
        page = await context.new_page()

        async def capture(response):
            url = response.url
            if "apistats.nesine.com" not in url:
                return
            key = (response.request.method, url)
            if key in seen:
                return
            seen.add(key)
            item = {
                "method": response.request.method,
                "url": url,
                "status": response.status,
                "resource_type": response.request.resource_type,
                "content_type": response.headers.get("content-type", ""),
            }
            try:
                body = await response.text()
                item["body_preview"] = body[:12000]
            except Exception as exc:
                item["body_error"] = str(exc)
            result["observed_api_calls"].append(item)

        page.on("response", capture)

        for match in matches:
            row = dict(match)
            row["routes"] = []
            for route in ROUTES:
                url = f"https://istatistik.nesine.com/{match['id']}/{route}"
                status = None
                title = ""
                error = ""
                try:
                    response = await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                    status = response.status if response else None
                    await page.wait_for_timeout(3500)
                    title = await page.title()
                except Exception as exc:
                    error = str(exc)
                row["routes"].append({"route": route, "url": url, "status": status, "title": title, "error": error})
            result["matches"].append(row)

        await browser.close()

    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    hosts = sorted({urlparse(x["url"]).netloc for x in result["observed_api_calls"]})
    print(f"Nesine API probe: matches={len(matches)} calls={len(result['observed_api_calls'])} hosts={hosts}")
    for item in result["observed_api_calls"][:40]:
        print(item["method"], item["status"], item["url"])


if __name__ == "__main__":
    asyncio.run(main())

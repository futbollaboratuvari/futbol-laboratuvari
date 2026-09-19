import os
import re
from collections import Counter

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

LIVE_URL = os.environ.get("LIVE_URL", "https://futbollaboratuuvari.org")
TEST_MEMBER_CODE = os.environ["TEST_MEMBER_CODE"]

def norm(value):
    s = str(value or "").lower()
    s = s.translate(str.maketrans({"ç":"c","ğ":"g","ı":"i","ö":"o","ş":"s","ü":"u","İ":"i","I":"i"}))
    s = re.sub(r"[^a-z0-9+/. ]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def family(market):
    m = norm(market)
    if ("iy kg" in m and "2y kg" in m) or ("1 yari" in m and "2 yari" in m and "kg" in m):
        return "half_btts_combo"
    if ("ilk yari" in m or "1 yari" in m or "iy kg" in m) and "kg" in m:
        return "first_half_btts"
    if ("ikinci yari" in m or "2 yari" in m or "2y kg" in m) and "kg" in m:
        return "second_half_btts"
    if "6+" in m or "6 plus" in m or "6 gol" in m:
        return "six_plus"
    if "3.5" in m and ("ust" in m or "over" in m):
        return "over35"
    if "2.5" in m and ("ust" in m or "over" in m):
        return "over25"
    if "kg var" in m or "kg yok" in m or "btts" in m or "karsilikli gol" in m:
        return "btts"
    if re.match(r"^(ms\s*[12x]|mac sonucu)", m):
        return "match_result"
    if "/" in m and any(x in m for x in ("1/1", "1/2", "2/1", "iy/ms")):
        return "htft"
    return "other"

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-gpu")
opts.add_argument("--disable-dev-shm-usage")
opts.add_argument("--window-size=1440,1200")

driver = webdriver.Chrome(options=opts)
wait = WebDriverWait(driver, 60)

try:
    driver.set_page_load_timeout(60)
    driver.get(LIVE_URL + "/?member-e2e=1#membership-code-access")

    try:
        reject = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, '[data-cookie-choice="reject"]'))
        )
        reject.click()
        wait.until(lambda d: not d.find_elements(By.ID, "fl-cookie-backdrop"))
    except Exception:
        pass

    input_el = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-pa3-code]")))
    input_el.clear()
    input_el.send_keys(TEST_MEMBER_CODE)
    unlock = driver.find_element(By.CSS_SELECTOR, "[data-pa3-unlock]")
    driver.execute_script("arguments[0].focus();", unlock)
    unlock.send_keys(Keys.ENTER)

    wait.until(lambda d: d.find_element(By.CSS_SELECTOR, "[data-pa3-code-active]").is_displayed())
    wait.until(lambda d: d.execute_script(
        "return !!(window.__flProtectedProIndex && Array.isArray(window.__flProtectedProIndex.matches) && window.__flProtectedProIndex.matches.length > 0)"
    ))

    wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, "#ai-guven-merkezi [data-flai-id]")) >= 10)
    cards = driver.find_elements(By.CSS_SELECTOR, "#ai-guven-merkezi [data-flai-id]")
    if len(cards) != 10:
        raise AssertionError(f"AI Şeffaflık kart sayısı 10 değil: {len(cards)}")

    markets = driver.execute_script("""
      return Array.from(document.querySelectorAll('#ai-guven-merkezi [data-flai-id] .flai-pick-main > span'))
        .map(el => (el.textContent || '').trim());
    """)
    families = [family(m) for m in markets]
    family_counts = Counter(families)
    exact_counts = Counter(norm(m) for m in markets)

    required = {
        "half_btts_combo",
        "first_half_btts",
        "second_half_btts",
        "six_plus",
        "over35",
        "over25",
        "btts",
    }
    missing = sorted(required - set(families))
    if missing:
        raise AssertionError(f"AI Şeffaflık gerekli market aileleri eksik: {missing}; markets={markets}")
    if len(set(families)) < 7:
        raise AssertionError(f"Market çeşitliliği yetersiz: {families}")
    if max(exact_counts.values()) > 3:
        raise AssertionError(f"Aynı market 3'ten fazla tekrarlandı: {exact_counts}")

    locked_text = driver.find_element(By.ID, "ai-guven-merkezi").text
    if "PRO veri üyelikle açılır" in locked_text:
        raise AssertionError("AI Şeffaflık üyelik doğrulamasından sonra kilitli kaldı")

    total_text = wait.until(lambda d: d.find_element(By.CSS_SELECTOR, "[data-pa3-total]").text)
    m = re.search(r"(\d+)\s+yaklaşan maç", total_text)
    if not m or int(m.group(1)) <= 0:
        raise AssertionError(f"Özel Analiz yaklaşan maç göstermiyor: {total_text}")

    match_buttons = driver.find_elements(By.CSS_SELECTOR, "[data-pa3-match-id]")
    if not match_buttons:
        raise AssertionError("Özel Analiz maç kartı yok")
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", match_buttons[0])
    match_buttons[0].click()

    analyze = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "[data-pa-analyze]")))
    analyze.click()
    wait.until(lambda d: "Sonuç burada görünecek" not in d.find_element(By.CSS_SELECTOR, "[data-pa-output]").text)
    output_text = driver.find_element(By.CSS_SELECTOR, "[data-pa-output]").text.strip()
    if len(output_text) < 30:
        raise AssertionError("Özel Analiz sonuç alanı anlamlı çıktı üretmedi")

    summary = driver.execute_script("""
      const data = window.__flProtectedProIndex || {};
      return {
        matches: Array.isArray(data.matches) ? data.matches.length : 0,
        options: Number(data.summary?.analysis_option_count || 0),
        cards: document.querySelectorAll('#ai-guven-merkezi [data-flai-id]').length,
        markets: Array.from(document.querySelectorAll('#ai-guven-merkezi [data-flai-id] .flai-pick-main > span')).map(x => x.textContent.trim()),
        proTotal: document.querySelector('[data-pa3-total]')?.textContent || '',
        access: document.querySelector('[data-pa3-access]')?.dataset.state || '',
        resultPreview: (document.querySelector('[data-pa-output]')?.textContent || '').trim().slice(0, 200)
      };
    """)
    print("LIVE MEMBER E2E PASS")
    print(summary)
    print("families=", dict(family_counts))
finally:
    driver.quit()

# rerun-marker: half-btts-poisson-live-v1

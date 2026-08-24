const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const waitForTasks = () => new Promise((resolve) => setTimeout(resolve, 20));

async function testSharedJsonRequests() {
  const calls = [];
  const window = { location: { href: "https://futbollaboratuuvari.org/" } };
  const document = {
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {}
  };
  const fetch = async (url) => {
    calls.push(String(url));
    const data = String(url).includes("fixtures")
      ? []
      : String(url).includes("analiz_sonuclari")
        ? { active_items: [], completed_items: [] }
        : { matches: [], match_count: 0 };
    return { ok: true, status: 200, json: async () => data };
  };

  vm.runInNewContext(read("script.js"), {
    window,
    document,
    fetch,
    URL,
    Intl,
    Date,
    Map,
    Promise,
    setTimeout,
    clearTimeout
  });
  await waitForTasks();
  await Promise.all([
    window.__flReadJsonShared("./data/full-bulletin.json"),
    window.__flReadJsonShared("./data/full-bulletin.json")
  ]);

  assert.equal(calls.filter((url) => url.includes("full-bulletin.json")).length, 1);
  assert.equal(calls.some((url) => url.includes("fixtures.json")), false);
  assert.equal(typeof window.__flReadJsonShared, "function");
  const waitingCards = window.__flResultsPerformance.performanceCards({
    completed_items: [],
    performance: { prediction_count: 850, pending_count: 850, measured_count: 0, success_rate: null }
  });
  assert.equal(waitingCards.length, 4);
  assert.equal(waitingCards[0].value, "—");
  assert.equal(waitingCards[2].value, 850);
  const measured = window.__flResultsPerformance.performanceFromPayload({
    performance: { prediction_count: 10, pending_count: 2, measured_count: 8, won_count: 6, lost_count: 2, success_rate: 75 }
  });
  assert.equal(measured.successRate, 75);
}

async function testHomepageSkipsAdminPayloads() {
  const calls = [];
  const window = {
    __flReadJsonShared: async (url) => {
      calls.push(String(url));
      if (String(url).includes("daily-coupons")) return { coupons: {} };
      if (String(url).includes("analiz_sonuclari")) return { active_items: [], completed_items: [] };
      if (String(url).includes("robot-engine-bridge")) return { status: "ready" };
      return { matches: [] };
    }
  };
  const document = {
    querySelector: () => null,
    querySelectorAll: () => []
  };

  vm.runInNewContext(read("robot-dashboard.js"), {
    window,
    document,
    fetch: async () => { throw new Error("Beklenmeyen doğrudan istek"); },
    Promise,
    String,
    Number,
    Object,
    Array
  });
  await waitForTasks();

  assert.equal(calls.some((url) => url.includes("robot-analysis.json")), false);
  assert.equal(calls.some((url) => url.includes("ham_mac_havuzu.json")), false);
  assert.equal(calls.some((url) => url.includes("/outputs/")), false);
  assert.equal(calls.some((url) => url.includes("live-matches.json")), true);
}

function testLegacyStartupChainRemoved() {
  const cacheVersion = read("cache-version.js");
  const navigation = read("nav-routing.js");
  const dailyWidget = read("daily-matches-widget.js");

  [
    "robot-analysis.json",
    "learning-visibility.js",
    "learning-output-visibility.js",
    "pro12-2-wide-market-engine.js",
    "kupon-center-fallback.js",
    "widget-navigation-buttons.js"
  ].forEach((name) => assert.equal(cacheVersion.includes(name), false, `${name} başlangıçtan kaldırılmalı`));

  ["daily-toggle.js", "daily-past-filter.js", "daily-live-score-presenter.js"]
    .forEach((name) => assert.equal(navigation.includes(name), false, `${name} eski panel eklentisi yüklenmemeli`));

  assert.match(dailyWidget, /const twoDayRes = fullHasMatches[\s\S]*skipped: true/);
  assert.match(dailyWidget, /__flPremiumBulletinMatches = app\.bulletin/);
}

(async () => {
  await testSharedJsonRequests();
  console.log("✓ aynı JSON isteği başlangıçta tek ağ çağrısında birleşir");
  await testHomepageSkipsAdminPayloads();
  console.log("✓ ana sayfa yönetim ve 4,9 MB robot yüklerini indirmez");
  testLegacyStartupChainRemoved();
  console.log("✓ eski panel zinciri kaldırıldı ve bülten geri dönüşü koşullu çalışır");
  console.log("Performans yükleme testleri tamamlandı.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

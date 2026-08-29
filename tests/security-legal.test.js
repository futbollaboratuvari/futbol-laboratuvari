const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { EventEmitter } = require("node:events");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const { buildProAnalysisIndex } = require("../scripts/build-pro-analysis-index");

function responseCapture() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[String(name).toLowerCase()] = value; },
    end(value = "") { this.body = String(value); },
  };
}

function request(method, body = {}, headers = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.body = body;
  req.headers = { host: "futbollaboratuuvari.org", origin: "https://futbollaboratuuvari.org", ...headers };
  req.socket = { remoteAddress: "127.0.0.1" };
  return req;
}

async function testProtectedProRoute() {
  buildProAnalysisIndex();
  const handler = require("../api/pro-analysis");
  const originalFetch = global.fetch;
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ ok: true, membership: { planCode: "test" } }) });
  try {
    const invalid = responseCapture();
    await handler(request("POST", { code: "" }, { "x-forwarded-for": "127.0.0.10" }), invalid);
    assert.equal(invalid.statusCode, 400);

    const valid = responseCapture();
    await handler(request("POST", { code: "TEST-1234", clientId: "test-client" }, { "x-forwarded-for": "127.0.0.11" }), valid);
    const payload = JSON.parse(valid.body);
    assert.equal(valid.statusCode, 200);
    assert.equal(payload.ok, true);
    assert.ok(Array.isArray(payload.data.matches));
    assert.match(valid.headers["cache-control"], /no-store/);
  } finally {
    global.fetch = originalFetch;
  }
}

async function testLegalOrderGate() {
  const names = ["SELLER_LEGAL_NAME", "SELLER_ADDRESS", "SELLER_TAX_ID", "SELLER_TAX_OFFICE", "SELLER_EMAIL", "SELLER_PHONE"];
  const backup = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  names.forEach((name) => { delete process.env[name]; });
  const handler = require("../api/bank-order");
  const originalFetch = global.fetch;
  try {
    const blocked = responseCapture();
    await handler(request("POST", { plan_id: "starter" }, { "x-forwarded-for": "127.0.0.20" }), blocked);
    assert.equal(blocked.statusCode, 503);
    assert.equal(JSON.parse(blocked.body).error, "seller_profile_incomplete");

    assert.equal(handler.validAcceptance({}), false);
    assert.equal(handler.validAcceptance({
      accept_preinformation: true,
      accept_distance_contract: true,
      accept_privacy_notice: true,
      accept_immediate_performance: true,
      legal_version: handler.LEGAL_VERSION,
      legal_accepted_at: new Date().toISOString(),
    }), true);

    Object.assign(process.env, {
      SELLER_LEGAL_NAME: "Test Satıcı",
      SELLER_ADDRESS: "Test Adres",
      SELLER_TAX_ID: "1234567890",
      SELLER_TAX_OFFICE: "Test",
      SELLER_EMAIL: "test@example.com",
      SELLER_PHONE: "+90 555 000 00 00",
    });
    let forwarded = null;
    global.fetch = async (_url, options) => {
      forwarded = JSON.parse(options.body);
      return { ok: true, status: 200, json: async () => ({ ok: true, order: { order_code: "FL-TEST" } }) };
    };
    const accepted = responseCapture();
    await handler(request("POST", {
      plan_id: "starter",
      name: "Alıcı",
      email: "alici@example.com",
      phone: "05550000000",
      accept_preinformation: true,
      accept_distance_contract: true,
      accept_privacy_notice: true,
      accept_immediate_performance: true,
      legal_version: handler.LEGAL_VERSION,
      legal_accepted_at: new Date().toISOString(),
    }, { "x-forwarded-for": "127.0.0.21" }), accepted);
    assert.equal(accepted.statusCode, 200);
    assert.equal(forwarded.legal_acceptance.distance_contract, true);
    assert.equal(forwarded.legal_acceptance.seller_legal_name, "Test Satıcı");
  } finally {
    global.fetch = originalFetch;
    names.forEach((name) => {
      if (backup[name] === undefined) delete process.env[name];
      else process.env[name] = backup[name];
    });
  }
}

function testStaticProtectionAndConsent() {
  const premium = read("premium-analysis-v3.js");
  const insights = read("analysis-insights-v1.js");
  const build = read("scripts/vercel-build.js");
  const cookie = read("cookie-consent.js");
  const payment = read("bank-transfer-payment.js");
  const daily = read("daily-matches-widget.js");
  const { sanitizePublicLive } = require("../scripts/sanitize-public-live");
  const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith(".html"));

  assert.equal(premium.includes("./data/pro-analysis-index.json"), false);
  assert.equal(insights.includes("pro-analysis-index.json"), false);
  assert.match(premium, /fetch\("\/api\/pro-analysis"/);
  assert.match(build, /data\/pro-analysis-index\.json/);
  assert.match(cookie, /data-cookie-choice="accept"/);
  assert.match(cookie, /data-cookie-choice="reject"/);
  assert.match(cookie, /data-cookie-choice="preferences"/);
  htmlFiles.forEach((file) => {
    assert.equal(read(file).includes("<script async src=\"https://pagead2.googlesyndication.com"), false, `${file} reklam betiğini onaydan önce yüklememeli`);
  });
  ["accept_preinformation", "accept_distance_contract", "accept_privacy_notice", "accept_immediate_performance"]
    .forEach((name) => assert.match(payment, new RegExp(`name="${name}"`)));
  assert.match(payment, /Ödeme Yükümlülüğü Doğuran Talebi Oluştur/);
  assert.match(daily, /PAGE_SIZE = 30/);
  assert.match(daily, /Piyasa Oran Özeti/);
  assert.equal(daily.includes("Kontrollü oynanabilir"), false);
  const safeLive = sanitizePublicLive({
    counts: { active_analysis: 12, coupon_candidates: 4 },
    matches: [{ home: "A", away: "B", decision: "Kupon Adayı", analysis_score: 88, recommended_market: "MS 1", robot_reason: "gizli", available_odds: { ms1: 1.8 } }],
    active_items: [{ recommendation: "gizli" }],
  });
  assert.equal(safeLive.active_items.length, 0);
  assert.equal(safeLive.counts.active_analysis, 0);
  assert.deepEqual(Object.keys(safeLive.matches[0]).sort(), ["available_odds", "away", "home"]);
}

(async () => {
  await testProtectedProRoute();
  console.log("✓ PRO veri yalnız doğrulanmış sunucu isteğiyle döner");
  await testLegalOrderGate();
  console.log("✓ eksik satıcı profili ve yasal onay olmadan sipariş alınmaz");
  testStaticProtectionAndConsent();
  console.log("✓ statik PRO sızıntısı, erken reklam ve yanıltıcı oran yorumu engellendi");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

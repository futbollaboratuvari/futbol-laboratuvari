const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { EventEmitter } = require("node:events");
const { generateKeyPairSync, sign } = require("node:crypto");

const handlerModule = require("../api/send-coupon-mail");
const {
  DISCLAIMER,
  GITHUB_OIDC_AUDIENCE,
  GITHUB_OIDC_ISSUER,
  GITHUB_OIDC_JWKS_URL,
  SUBJECT,
  TRUSTED_GITHUB_OWNER_ID,
  TRUSTED_GITHUB_REPOSITORY,
  TRUSTED_GITHUB_REPOSITORY_ID,
  TRUSTED_GITHUB_WORKFLOW_REF,
  couponIdentity,
  createResendSender,
  extractValidCoupons,
  supabaseRequestHeaders,
  verifyGitHubActionsOidc,
} = require("../server-lib/_lib/coupon-mail");
const { triggerCouponNotification, trustedActionsOidcUrl } = require("../scripts/send-coupon-notification");

const root = path.resolve(__dirname, "..");

function validLeg(index, suffix = "") {
  return {
    no: index,
    id: `match-${index}${suffix}`,
    match_name: `Takım ${index}A${suffix} VS Takım ${index}B${suffix}`,
    league: "Test Ligi",
    start_time: "20:00",
    recommended_market: index % 2 ? "KG Var" : "2.5 Üst",
    estimated_odds: index % 2 ? "1.80" : "1.70",
    model_score: 75,
    analysis_score: 75,
    estimated_probability: 60,
    market_probability: 54,
    edge_percent: 6,
    data_completeness: 80,
    independent_evidence: true,
    include_in_coupon: true,
    risk_level: "Düşük",
    data_gap_risk: "Düşük",
    squad_risk_level: "Düşük",
    lineup_risk_level: "Düşük",
    robot_reason: "Doğrulanmış model ve piyasa sinyali birlikte destekliyor.",
  };
}

function validPayload(generatedAt = "2026-09-07T16:02:38.137Z", suffix = "") {
  return {
    generated_at: generatedAt,
    date: generatedAt.slice(0, 10),
    source: "PRO merkezi kupon uygunluk motoru",
    coupons: {
      balanced: {
        coupon_name: "Dengeli Kupon",
        coupon_type: "balanced",
        selected_matches: [validLeg(1, suffix), validLeg(2, suffix), validLeg(3, suffix)],
        total_odds: "5.20",
        average_confidence_score: "75%",
        risk_level: "Düşük-Orta",
        short_description: "Yalnız doğrulanmış adaylardan oluşturuldu.",
        robot_reason: "Üç seçim merkezi kupon kalite kuralını geçti.",
        is_available: true,
      },
    },
  };
}

function responseCapture() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[String(name).toLowerCase()] = value; },
    end(value = "") { this.body = String(value); },
  };
}

function request(method = "POST", body = {}, token = "test-internal-secret") {
  const req = new EventEmitter();
  req.method = method;
  req.body = body;
  req.headers = token ? { authorization: `Bearer ${token}` } : {};
  return req;
}

function runtimeEnv(overrides = {}) {
  return {
    COUPON_MAIL_SECRET: "test-internal-secret",
    COUPON_MAIL_TO: "owner@example.com",
    COUPON_MAIL_FROM: "Futbol Laboratuvarı <mail@example.com>",
    RESEND_API_KEY: "resend-test-key",
    SUPABASE_URL: "https://project.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-test-key",
    ...overrides,
  };
}

function durableTestStore(database) {
  return {
    async claim(entry) {
      const current = database.get(entry.couponId);
      if (current?.status === "sent" || current?.status === "sending") {
        return { claimed: false, reason: current.status === "sent" ? "duplicate" : "in_progress" };
      }
      const claimToken = `claim-${database.size + 1}`;
      database.set(entry.couponId, { status: "sending", claimToken });
      return { claimed: true, claimToken };
    },
    async complete(entry, claimToken, providerMessageId) {
      const current = database.get(entry.couponId);
      assert.equal(current.claimToken, claimToken);
      database.set(entry.couponId, { status: "sent", claimToken, providerMessageId });
    },
    async fail(entry, claimToken, error) {
      database.set(entry.couponId, { status: "failed", claimToken, error: error.message });
    },
  };
}

async function callHandler(handler, req) {
  const res = responseCapture();
  await handler(req, res);
  return { res, body: JSON.parse(res.body) };
}

async function testNewDuplicateChangedAndRestart() {
  const database = new Map();
  const sent = [];
  let payload = validPayload();
  const makeHandler = () => handlerModule.createHandler({
    env: runtimeEnv(),
    loadCouponPayload: async () => payload,
    store: durableTestStore(database),
    sendEmail: async (entry, content) => {
      sent.push({ entry, content });
      return { provider: "resend", id: `mail-${sent.length}` };
    },
  });

  const first = await callHandler(makeHandler(), request());
  assert.equal(first.res.statusCode, 200);
  assert.equal(first.body.status, "sent");
  assert.equal(first.body.sent, 1);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].content.subject, SUBJECT);
  assert.match(sent[0].content.text, /Kupon tipi \/ risk profili: Dengeli Kupon \/ Düşük-Orta/);
  assert.match(sent[0].content.text, /Takım 1A VS Takım 1B/);
  assert.match(sent[0].content.text, /Market: KG Var/);
  assert.match(sent[0].content.text, /Tahmini oran: 1\.80/);
  assert.match(sent[0].content.text, /Model \/ güven: 75%/);
  assert.match(sent[0].content.text, /Edge: 6%/);
  assert.match(sent[0].content.text, /Toplam oran: 5\.20/);
  assert.match(sent[0].content.text, new RegExp(DISCLAIMER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  const afterRestart = await callHandler(makeHandler(), request());
  assert.equal(afterRestart.res.statusCode, 200);
  assert.equal(afterRestart.body.status, "already_processed");
  assert.equal(afterRestart.body.sent, 0);
  assert.equal(afterRestart.body.skipped, 1);
  assert.equal(sent.length, 1, "aynı kalıcı kayıt yeni handler örneğinde tekrar maili engellemeli");

  payload = validPayload("2026-09-07T17:02:38.137Z", "-yeni");
  const changed = await callHandler(makeHandler(), request());
  assert.equal(changed.res.statusCode, 200);
  assert.equal(changed.body.sent, 1);
  assert.equal(sent.length, 2);
  assert.notEqual(first.body.coupon_ids[0], changed.body.coupon_ids[0]);
}

async function testNoCouponAndWeakCoupon() {
  let storeCalls = 0;
  const store = {
    async claim() { storeCalls += 1; throw new Error("çağrılmamalı"); },
  };
  const emptyPayload = { generated_at: new Date().toISOString(), coupons: {} };
  const emptyHandler = handlerModule.createHandler({
    env: { COUPON_MAIL_SECRET: "test-internal-secret" },
    loadCouponPayload: async () => emptyPayload,
    store,
    sendEmail: async () => { throw new Error("çağrılmamalı"); },
  });
  const empty = await callHandler(emptyHandler, request());
  assert.equal(empty.res.statusCode, 200);
  assert.equal(empty.body.status, "no_valid_coupon");

  const weak = validPayload();
  weak.coupons.balanced.selected_matches[0].include_in_coupon = false;
  const weakHandler = handlerModule.createHandler({
    env: { COUPON_MAIL_SECRET: "test-internal-secret" },
    loadCouponPayload: async () => weak,
    store,
    sendEmail: async () => { throw new Error("çağrılmamalı"); },
  });
  const weakResult = await callHandler(weakHandler, request());
  assert.equal(weakResult.body.status, "no_valid_coupon");
  assert.equal(storeCalls, 0);
}

async function testEnvironmentAndAuthorizationFailures() {
  const payload = validPayload();
  let sent = 0;
  const noConfig = await callHandler(handlerModule.createHandler({ env: {} }), request("POST", {}, ""));
  assert.equal(noConfig.res.statusCode, 503);
  assert.deepEqual(noConfig.body.missing.sort(), [
    "COUPON_MAIL_FROM",
    "COUPON_MAIL_SECRET",
    "COUPON_MAIL_TO",
    "RESEND_API_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_URL",
  ].sort());

  const missingHandler = handlerModule.createHandler({
    env: { COUPON_MAIL_SECRET: "test-internal-secret" },
    loadCouponPayload: async () => payload,
    store: durableTestStore(new Map()),
    sendEmail: async () => { sent += 1; },
  });
  const missing = await callHandler(missingHandler, request());
  assert.equal(missing.res.statusCode, 503);
  assert.equal(missing.body.error, "missing_environment");
  assert.deepEqual(missing.body.missing.sort(), [
    "COUPON_MAIL_FROM",
    "COUPON_MAIL_TO",
    "RESEND_API_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_URL",
  ].sort());
  assert.equal(sent, 0);

  const secureHandler = handlerModule.createHandler({
    env: runtimeEnv(),
    loadCouponPayload: async () => payload,
    store: durableTestStore(new Map()),
    sendEmail: async () => { sent += 1; },
  });
  const unauthorized = await callHandler(secureHandler, request("POST", {}, "wrong-secret"));
  assert.equal(unauthorized.res.statusCode, 401);
  const get = await callHandler(secureHandler, request("GET"));
  assert.equal(get.res.statusCode, 405);
  assert.equal(sent, 0);

  const oidcHandler = handlerModule.createHandler({
    env: runtimeEnv({ COUPON_MAIL_SECRET: "" }),
    loadCouponPayload: async () => payload,
    verifyGitHubActionsOidc: async (token) => token === "oidc.header.signature",
    store: durableTestStore(new Map()),
    sendEmail: async () => ({ provider: "resend", id: "oidc-mail" }),
  });
  const oidc = await callHandler(oidcHandler, request("POST", {}, "oidc.header.signature"));
  assert.equal(oidc.res.statusCode, 200);
  assert.equal(oidc.body.sent, 1);
}

async function testClientCannotReplaceCouponPayload() {
  const trusted = validPayload();
  let delivered = null;
  const handler = handlerModule.createHandler({
    env: runtimeEnv(),
    loadCouponPayload: async () => trusted,
    store: durableTestStore(new Map()),
    sendEmail: async (_entry, content) => {
      delivered = content;
      return { provider: "resend", id: "trusted-mail" };
    },
  });
  const result = await callHandler(handler, request("POST", {
    coupons: { balanced: { is_available: true, selected_matches: [{ match_name: "SAHTE MAÇ" }] } },
    recipient: "attacker@example.com",
  }));
  assert.equal(result.body.sent, 1);
  assert.match(delivered.text, /Takım 1A VS Takım 1B/);
  assert.doesNotMatch(delivered.text, /SAHTE MAÇ|attacker@example\.com/);
}

async function testResendIdempotencyHeader() {
  const payload = validPayload();
  const entry = extractValidCoupons(payload)[0];
  let requestOptions = null;
  const sender = createResendSender({
    apiKey: "secret-api-key",
    from: "mail@example.com",
    to: "owner@example.com",
    fetchImpl: async (_url, options) => {
      requestOptions = options;
      return { ok: true, status: 200, json: async () => ({ id: "resend-id" }) };
    },
  });
  await sender(entry, { subject: SUBJECT, text: "text", html: "<p>html</p>" });
  assert.equal(requestOptions.headers["Idempotency-Key"], entry.couponId);
  assert.equal(JSON.parse(requestOptions.body).to[0], "owner@example.com");
}

async function testWorkflowScriptSendsNoCouponBody() {
  const payload = validPayload();
  let body = null;
  const result = await triggerCouponNotification({
    env: { COUPON_MAIL_SECRET: "workflow-secret", COUPON_MAIL_ENDPOINT: "https://example.com/api/send-coupon-mail" },
    payload,
    fetchImpl: async (_url, options) => {
      body = JSON.parse(options.body);
      return { ok: true, status: 200, json: async () => ({ ok: true, status: "sent", sent: 1 }) };
    },
  });
  assert.equal(result.sent, 1);
  assert.deepEqual(body, { trigger: "coupon-data-workflow" });
  assert.equal(JSON.stringify(body).includes("Takım"), false);

  let called = false;
  const skipped = await triggerCouponNotification({
    env: {},
    payload: { generated_at: new Date().toISOString(), coupons: {} },
    fetchImpl: async () => { called = true; },
  });
  assert.equal(skipped.status, "no_valid_coupon");
  assert.equal(called, false);
}

function encodedJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function signedOidcToken(privateKey, payload, kid = "test-key") {
  const input = `${encodedJson({ alg: "RS256", typ: "JWT", kid })}.${encodedJson(payload)}`;
  const signature = sign("RSA-SHA256", Buffer.from(input, "utf8"), privateKey).toString("base64url");
  return `${input}.${signature}`;
}

async function testGitHubActionsOidcVerification() {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: "jwk" }), kid: "test-key", alg: "RS256", use: "sig" };
  const now = new Date("2026-09-08T06:00:00.000Z");
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const claims = {
    iss: GITHUB_OIDC_ISSUER,
    aud: GITHUB_OIDC_AUDIENCE,
    sub: `repo:${TRUSTED_GITHUB_REPOSITORY}:ref:refs/heads/main`,
    exp: nowSeconds + 600,
    nbf: nowSeconds - 10,
    iat: nowSeconds - 10,
    jti: "test-jti",
    repository: TRUSTED_GITHUB_REPOSITORY,
    repository_id: TRUSTED_GITHUB_REPOSITORY_ID,
    repository_owner_id: TRUSTED_GITHUB_OWNER_ID,
    ref: "refs/heads/main",
    workflow: "Coupon Mail Notification",
    workflow_ref: TRUSTED_GITHUB_WORKFLOW_REF,
    event_name: "workflow_dispatch",
    runner_environment: "github-hosted",
  };
  const fetchJwks = async (url) => {
    assert.equal(url, GITHUB_OIDC_JWKS_URL);
    return { ok: true, status: 200, text: async () => JSON.stringify({ keys: [jwk] }) };
  };
  assert.equal(await verifyGitHubActionsOidc(signedOidcToken(privateKey, claims), { fetchImpl: fetchJwks, now: () => now }), true);
  assert.equal(await verifyGitHubActionsOidc(signedOidcToken(privateKey, { ...claims, repository_id: "wrong" }), { fetchImpl: fetchJwks, now: () => now }), false);
  assert.equal(await verifyGitHubActionsOidc("invalid-token", { fetchImpl: fetchJwks, now: () => now }), false);
}

async function testWorkflowOidcRequest() {
  const oidcRequestUrl = "https://pipelines.actions.githubusercontent.com/example?api-version=2.0";
  const oidcToken = "header.payload.signature";
  let calls = 0;
  const result = await triggerCouponNotification({
    env: {
      ACTIONS_ID_TOKEN_REQUEST_URL: oidcRequestUrl,
      ACTIONS_ID_TOKEN_REQUEST_TOKEN: "runner-request-token",
      COUPON_MAIL_ENDPOINT: "https://example.com/api/send-coupon-mail",
    },
    payload: validPayload(),
    fetchImpl: async (url, options) => {
      calls += 1;
      if (calls === 1) {
        const parsed = new URL(url);
        assert.equal(parsed.searchParams.get("audience"), GITHUB_OIDC_AUDIENCE);
        assert.equal(options.headers.Authorization, "Bearer runner-request-token");
        return { ok: true, status: 200, text: async () => JSON.stringify({ value: oidcToken }) };
      }
      assert.equal(options.headers.Authorization, `Bearer ${oidcToken}`);
      return { ok: true, status: 200, json: async () => ({ ok: true, status: "sent", sent: 1 }) };
    },
  });
  assert.equal(result.sent, 1);
  assert.equal(calls, 2);
  assert.equal(trustedActionsOidcUrl(oidcRequestUrl), true);
  assert.equal(trustedActionsOidcUrl("https://actions.githubusercontent.com.attacker.example/token"), false);
}

function testStableIdentityAndSecretIsolation() {
  const payload = validPayload();
  const coupon = payload.coupons.balanced;
  const first = couponIdentity(payload, "balanced", coupon);
  const second = couponIdentity(JSON.parse(JSON.stringify(payload)), "balanced", JSON.parse(JSON.stringify(coupon)));
  assert.equal(first.couponId, second.couponId);
  assert.match(first.couponId, /^FL-COUPON:[a-f0-9]{64}$/);

  const frontend = ["nesine-coupon-assistant.js", "nav-routing.js", "index.html"]
    .map((file) => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
  assert.equal(frontend.includes("RESEND_API_KEY"), false);
  assert.equal(frontend.includes("SUPABASE_SERVICE_ROLE_KEY"), false);
  assert.equal(frontend.includes("COUPON_MAIL_TO"), false);

  const schema = fs.readFileSync(path.join(root, "backend/supabase/coupon-mail-notifications.sql"), "utf8");
  assert.match(schema, /coupon_id text primary key/);
  assert.match(schema, /enable row level security/);
  assert.match(schema, /revoke all.*public, anon, authenticated/);

}

function testSupabaseServerKeyHeaders() {
  const current = supabaseRequestHeaders("sb_secret_current-key", "return=representation");
  assert.equal(current.apikey, "sb_secret_current-key");
  assert.equal(Object.hasOwn(current, "Authorization"), false);
  assert.equal(current.Prefer, "return=representation");

  const legacy = supabaseRequestHeaders("legacy-service-role-jwt");
  assert.equal(legacy.apikey, "legacy-service-role-jwt");
  assert.equal(legacy.Authorization, "Bearer legacy-service-role-jwt");
}

(async () => {
  await testNewDuplicateChangedAndRestart();
  console.log("✓ yeni, duplicate, değişen kupon ve handler yeniden başlatma senaryoları başarılı");
  await testNoCouponAndWeakCoupon();
  console.log("✓ boş ve kalite filtresini geçmeyen kuponlar mail üretmiyor");
  await testEnvironmentAndAuthorizationFailures();
  console.log("✓ eksik environment ve yetkisiz istek güvenli biçimde reddediliyor");
  await testClientCannotReplaceCouponPayload();
  console.log("✓ istemci gövdesi güvenilir kupon kaynağını değiştiremiyor");
  await testResendIdempotencyHeader();
  console.log("✓ Resend çağrısı deterministik idempotency anahtarı kullanıyor");
  await testWorkflowScriptSendsNoCouponBody();
  console.log("✓ workflow scripti kupon verisini istemciden endpoint'e taşımıyor");
  await testGitHubActionsOidcVerification();
  console.log("✓ GitHub Actions OIDC imzası ve sabit workflow claim'leri doğrulanıyor");
  await testWorkflowOidcRequest();
  console.log("✓ workflow kalıcı GitHub secret olmadan kısa ömürlü OIDC kullanıyor");
  testStableIdentityAndSecretIsolation();
  console.log("✓ hash kararlı, kalıcı şema korumalı ve frontend'de secret yok");
  testSupabaseServerKeyHeaders();
  console.log("✓ yeni Supabase secret ve eski service_role anahtar başlıkları güvenli");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const CREATE_ORDER_URL = process.env.FL_BANK_TRANSFER_CREATE_URL
  || "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-bank-transfer?action=create-order";
const LEGAL_VERSION = "2026-08-29-v1";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const RATE_KEY = "__FL_BANK_ORDER_RATE_LIMIT__";
const REQUIRED_SELLER_ENV = ["SELLER_LEGAL_NAME", "SELLER_ADDRESS", "SELLER_TAX_ID", "SELLER_TAX_OFFICE", "SELLER_EMAIL", "SELLER_PHONE"];
const ALLOWED_PLANS = new Set(["starter", "pro", "vip"]);
const TRUSTED_BROWSER_ORIGINS = new Set([
  "https://futbollaboratuuvari.org",
  "https://www.futbollaboratuuvari.org",
]);

globalThis[RATE_KEY] = globalThis[RATE_KEY] || new Map();

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

function sellerProfile() {
  const missing = REQUIRED_SELLER_ENV.filter((name) => !String(process.env[name] || "").trim());
  if (missing.length) return { complete: false, missing };
  return {
    complete: true,
    legalName: String(process.env.SELLER_LEGAL_NAME).trim(),
    address: String(process.env.SELLER_ADDRESS).trim(),
    taxId: String(process.env.SELLER_TAX_ID).trim(),
    taxOffice: String(process.env.SELLER_TAX_OFFICE).trim(),
    email: String(process.env.SELLER_EMAIL).trim(),
    phone: String(process.env.SELLER_PHONE).trim(),
    mersis: String(process.env.SELLER_MERSIS || "").trim(),
  };
}

function requestIp(req) {
  return String(req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || "unknown")
    .split(",")[0].trim().slice(0, 80);
}

function rateLimited(req, now = Date.now()) {
  const store = globalThis[RATE_KEY];
  const key = requestIp(req);
  const current = store.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    store.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") {
    try { return Promise.resolve(JSON.parse(req.body || "{}")); } catch { return Promise.resolve({}); }
  }
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 32 * 1024) reject(new Error("payload_too_large"));
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
    req.on("error", reject);
  });
}

function originAllowed(req) {
  const origin = String(req.headers?.origin || "").trim();
  if (!origin) return true;
  const host = String(req.headers?.["x-forwarded-host"] || req.headers?.host || "").trim();
  try {
    const parsed = new URL(origin);
    return parsed.host === host || TRUSTED_BROWSER_ORIGINS.has(parsed.origin);
  } catch {
    return false;
  }
}

function configureCors(req, res) {
  const origin = String(req.headers?.origin || "").trim();
  if (!origin) return true;
  if (!originAllowed(req)) return false;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
  return true;
}

function validAcceptance(body) {
  const acceptedAt = Date.parse(body.legal_accepted_at || "");
  const age = Date.now() - acceptedAt;
  return body.accept_preinformation === true
    && body.accept_distance_contract === true
    && body.accept_privacy_notice === true
    && body.accept_immediate_performance === true
    && body.legal_version === LEGAL_VERSION
    && Number.isFinite(acceptedAt)
    && age >= -60_000
    && age <= 30 * 60 * 1000;
}

async function handler(req, res) {
  if (!configureCors(req, res)) return send(res, 403, { ok: false, error: "origin_not_allowed" });
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method === "GET") {
    const seller = sellerProfile();
    return send(res, 200, {
      ok: true,
      salesEnabled: seller.complete,
      legalVersion: LEGAL_VERSION,
      seller: seller.complete ? seller : null,
      reason: seller.complete ? null : "seller_profile_incomplete",
    });
  }
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "method_not_allowed" });
  if (!originAllowed(req)) return send(res, 403, { ok: false, error: "origin_not_allowed" });
  if (rateLimited(req)) return send(res, 429, { ok: false, error: "too_many_attempts" });

  const seller = sellerProfile();
  if (!seller.complete) {
    return send(res, 503, { ok: false, error: "seller_profile_incomplete", message: "Satıcı yasal bilgileri tamamlanmadan ödeme talebi alınamaz." });
  }

  try {
    const body = await readBody(req);
    if (!ALLOWED_PLANS.has(String(body.plan_id || ""))) {
      return send(res, 400, { ok: false, error: "invalid_plan" });
    }
    if (!validAcceptance(body)) {
      return send(res, 400, { ok: false, error: "legal_acceptance_required", message: "Zorunlu ön bilgilendirme ve sözleşme onayları eksik veya güncel değil." });
    }

    const upstream = await fetch(CREATE_ORDER_URL, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        legal_acceptance: {
          version: LEGAL_VERSION,
          accepted_at: body.legal_accepted_at,
          preinformation: true,
          distance_contract: true,
          privacy_notice: true,
          immediate_performance: true,
          seller_legal_name: seller.legalName,
        },
      }),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok || data.ok === false) {
      return send(res, upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502, {
        ok: false,
        error: data.error || "order_service_unavailable",
        message: data.message || "Ödeme talebi oluşturulamadı.",
      });
    }
    return send(res, 200, data);
  } catch (error) {
    if (error?.message === "payload_too_large") return send(res, 413, { ok: false, error: "payload_too_large" });
    return send(res, 502, { ok: false, error: "order_service_unavailable", message: "Ödeme talebi servisine ulaşılamadı." });
  }
}

handler.sellerProfile = sellerProfile;
handler.validAcceptance = validAcceptance;
handler.originAllowed = originAllowed;
handler.LEGAL_VERSION = LEGAL_VERSION;

module.exports = handler;

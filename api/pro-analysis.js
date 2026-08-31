const fs = require("fs");
const path = require("path");
const { buildOfficialProIndex } = require("../scripts/official-pro-analysis");

const VERIFY_URL = process.env.FL_BANK_TRANSFER_VERIFY_URL
  || "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-bank-transfer?action=verify-code";
const PRO_INDEX_PATH = path.join(process.cwd(), "data", "pro-analysis-index.json");
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 20;
const RATE_KEY = "__FL_PRO_ANALYSIS_RATE_LIMIT__";
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
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");
  return true;
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
      if (raw.length > 8192) reject(new Error("payload_too_large"));
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
    req.on("error", reject);
  });
}

function readProIndex() {
  const payload = JSON.parse(fs.readFileSync(PRO_INDEX_PATH, "utf8"));
  if (!payload || !Array.isArray(payload.matches)) throw new Error("invalid_pro_index");
  return payload;
}

async function verifyMembership(code, clientId) {
  const response = await fetch(VERIFY_URL, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, clientId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    const error = new Error("membership_denied");
    error.status = response.status === 429 ? 429 : 401;
    throw error;
  }
  return data;
}

function membershipHasRights(membership) {
  if (!membership || typeof membership !== "object" || membership.active === false) return false;
  const plan = String(membership.planCode ?? membership.plan_code ?? membership.planName ?? membership.plan_name ?? "");
  if (/founder|kurucu/i.test(plan)) return true;
  const rawRemaining = membership.remainingAnalysisCount ?? membership.remaining_analysis_count;
  if (rawRemaining === null || rawRemaining === undefined || rawRemaining === "") return false;
  const remaining = Number(rawRemaining);
  return Number.isFinite(remaining) && remaining > 0;
}

async function handler(req, res) {
  if (!configureCors(req, res)) return send(res, 403, { ok: false, error: "origin_not_allowed" });
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "POST") return send(res, 405, { ok: false, error: "method_not_allowed" });
  if (rateLimited(req)) return send(res, 429, { ok: false, error: "too_many_attempts" });

  try {
    const body = await readBody(req);
    const code = String(body.code || "").trim().replace(/\s+/g, "").toLocaleUpperCase("tr-TR");
    const clientId = String(body.clientId || "").trim().slice(0, 160);
    if (code.length < 4 || code.length > 128) {
      return send(res, 400, { ok: false, error: "membership_code_required" });
    }

    const verified = await verifyMembership(code, clientId);
    if (!verified.membership) {
      return send(res, 401, { ok: false, error: "membership_invalid_or_expired" });
    }
    if (!membershipHasRights(verified.membership)) {
      return send(res, 403, { ok: false, error: "membership_rights_exhausted" });
    }
    const storedPro = readProIndex();
    let pro = storedPro;
    try {
      // Membership verification happens first. Official odds and BTTS model
      // details therefore stay inside the protected PRO response.
      pro = await buildOfficialProIndex(storedPro);
    } catch {
      // A temporary provider error must not take the already verified static
      // analysis away from the member.
      pro = { ...storedPro, official_feed: false, official_feed_status: "temporary_fallback" };
    }
    return send(res, 200, {
      ok: true,
      membership: verified.membership || null,
      data: pro,
    });
  } catch (error) {
    if (error?.status === 429) return send(res, 429, { ok: false, error: "too_many_attempts" });
    if (error?.message === "membership_denied") {
      return send(res, 401, { ok: false, error: "membership_invalid_or_expired" });
    }
    return send(res, 503, { ok: false, error: "protected_analysis_unavailable" });
  }
}

handler.readProIndex = readProIndex;
handler.verifyMembership = verifyMembership;
handler.membershipHasRights = membershipHasRights;
handler.originAllowed = originAllowed;

module.exports = handler;

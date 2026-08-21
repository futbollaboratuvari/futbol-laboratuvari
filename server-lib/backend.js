const crypto = require("crypto");

const OWNER = "futbollaboratuvari";
const REPO = "futbol-laboratuvari";
const USAGE_LOG_PATH = "data/usage-log.json";
const MEMBERSHIP_CODES_PATH = "data/membership-codes.json";
const ORDERS_PATH = "data/orders.json";
const MAX_USAGE_RECORDS = 200;
const MAX_ORDERS = 500;

const PLANS = {
  starter: {
    id: "starter",
    name: "Gold Paket",
    amountKurus: 14900,
    durationDays: 3,
    trialDays: 1,
    paidUses: 10,
    trialUses: 2,
    dailyUses: 3,
    renewalType: "manual_purchase_required",
  },
  pro: {
    id: "pro",
    name: "Diamond Paket",
    amountKurus: 29900,
    durationDays: 14,
    trialDays: 1,
    paidUses: 40,
    trialUses: 3,
    dailyUses: 10,
    renewalType: "manual_purchase_required",
  },
  vip: {
    id: "vip",
    name: "Premium Paket",
    amountKurus: 49900,
    durationDays: 28,
    trialDays: 1,
    paidUses: 120,
    trialUses: 5,
    dailyUses: 30,
    renewalType: "manual_purchase_required",
  },
};

function allowPublicResponse(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  allowPublicResponse(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function text(res, statusCode, payload) {
  res.statusCode = statusCode;
  allowPublicResponse(res);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(payload);
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("application/json")) return JSON.parse(raw);
  if (contentType.includes("application/x-www-form-urlencoded")) return Object.fromEntries(new URLSearchParams(raw));
  try { return JSON.parse(raw); } catch { return Object.fromEntries(new URLSearchParams(raw)); }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} eksik`);
  return value;
}

function getPlan(planId) {
  return PLANS[planId] || null;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + Number(days || 0));
  return next;
}

function baseMembership(plan, orderId, startedAt, expiresAt, mode) {
  const isTrial = mode === "trial";
  return {
    plan_id: plan.id,
    plan_name: plan.name,
    status: isTrial ? "trial_active" : "active",
    access_mode: mode,
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    duration_days: isTrial ? plan.trialDays : plan.durationDays,
    uses_total: isTrial ? plan.trialUses : plan.paidUses,
    uses_left: isTrial ? plan.trialUses : plan.paidUses,
    daily_uses_limit: plan.dailyUses,
    daily_uses_left: plan.dailyUses,
    payment_required_after_trial: isTrial,
    auto_renew: false,
    last_order_id: orderId || null,
  };
}

function createTrialMembershipFromPlan(plan, startedAtValue = new Date()) {
  const startedAt = new Date(startedAtValue);
  const expiresAt = addDays(startedAt, plan.trialDays);
  return baseMembership(plan, null, startedAt, expiresAt, "trial");
}

function paytrToken(payload, merchantSalt, merchantKey) {
  const hashStr = [
    payload.merchant_id,
    payload.user_ip,
    payload.merchant_oid,
    payload.email,
    payload.payment_amount,
    payload.user_basket,
    payload.no_installment,
    payload.max_installment,
    payload.currency,
    payload.test_mode,
  ].join("");

  return crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64");
}

function verifyCallbackHash(post, merchantKey, merchantSalt) {
  const hashStr = `${post.merchant_oid}${merchantSalt}${post.status}${post.total_amount}`;
  const expected = crypto.createHmac("sha256", merchantKey).update(hashStr).digest("base64");
  return expected === post.hash;
}

function orderId() {
  const stamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `FL-${stamp}-${random}`;
}

async function getIframeToken(payload) {
  const form = new URLSearchParams(payload);
  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    body: form,
  });
  return response.json();
}

function getUsageToken() {
  return process.env.USAGE_LOG_TOKEN || process.env.KULLANIM_KAYIT_BELIRTECI || "";
}

function decodeContent(value) {
  return Buffer.from(String(value || ""), "base64").toString("utf8");
}

function encodeContent(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

function contentUrl(filePath, ref = "main") {
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, "/");
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;
}

async function githubJson(token, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "futbol-laboratuvari-api",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || `GitHub request failed with ${response.status}`;
    throw new Error(message);
  }
  return data;
}

async function readJsonFile(token, filePath) {
  const file = await githubJson(token, contentUrl(filePath));
  return {
    sha: file.sha,
    data: JSON.parse(decodeContent(file.content) || "{}")
  };
}

async function writeJsonFile(token, filePath, sha, data, message) {
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, "/");
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodedPath}`;
  return githubJson(token, url, {
    method: "PUT",
    body: JSON.stringify({
      branch: "main",
      sha,
      message,
      content: encodeContent(`${JSON.stringify(data, null, 2)}\n`)
    })
  });
}

async function appendUsageRecord(record) {
  const recordId = record && record.id ? record.id : "";
  const token = getUsageToken();
  if (!token) return { saved: false, reason: "token-missing", recordId };

  try {
    const current = await readJsonFile(token, USAGE_LOG_PATH);
    const nextData = {
      version: 1,
      updatedAt: new Date().toISOString(),
      records: [record, ...(current.data.records || [])].slice(0, MAX_USAGE_RECORDS)
    };
    await writeJsonFile(token, USAGE_LOG_PATH, current.sha, nextData, "Kullanim gecmisi kaydi eklendi");
    return { saved: true, recordId };
  } catch (error) {
    return { saved: false, reason: "write-failed", recordId };
  }
}

async function decreaseMembershipCount(codeHash) {
  const token = getUsageToken();
  if (!token) return { changed: false, reason: "token-missing" };

  try {
    const current = await readJsonFile(token, MEMBERSHIP_CODES_PATH);
    const codes = current.data.codes || [];
    const index = codes.findIndex(item => String(item.codeHash || "").toLowerCase() === String(codeHash || "").toLowerCase());
    if (index < 0) return { changed: false, reason: "code-not-found" };

    const item = codes[index];
    if (item.planCode === "founder") {
      return { changed: false, reason: "founder-fixed", remainingAnalysisCount: item.remainingAnalysisCount };
    }

    const currentCount = Number(item.remainingAnalysisCount || 0);
    if (currentCount <= 0) {
      item.active = false;
      return { changed: false, reason: "limit-finished", remainingAnalysisCount: 0 };
    }

    item.remainingAnalysisCount = currentCount - 1;
    if (item.remainingAnalysisCount <= 0) item.active = false;
    current.data.updatedAt = new Date().toISOString();
    await writeJsonFile(token, MEMBERSHIP_CODES_PATH, current.sha, current.data, "Uyelik kullanim hakki dusuruldu");
    return { changed: true, remainingAnalysisCount: item.remainingAnalysisCount };
  } catch (error) {
    return { changed: false, reason: "decrement-failed" };
  }
}

async function stageCodeRecord(record) {
  return {
    ready: false,
    reason: "stage-only",
    codeLabel: record && record.codeLabel ? record.codeLabel : ""
  };
}

async function appendPendingOrder(order) {
  const merchantOid = order && order.merchant_oid ? order.merchant_oid : "";
  const token = getUsageToken();
  if (!merchantOid) return { saved: false, reason: "merchant-oid-missing", merchantOid };
  if (!token) return { saved: false, reason: "token-missing", merchantOid };

  try {
    const current = await readJsonFile(token, ORDERS_PATH);
    const oldOrders = current.data.orders || [];
    if (oldOrders.some(item => item && item.merchant_oid === merchantOid)) {
      return { saved: true, reason: "already-exists", merchantOid };
    }

    const nextData = {
      version: 1,
      updatedAt: new Date().toISOString(),
      status: "active",
      note: current.data.note || "PayTR siparis kayit dosyasi",
      orders: [order, ...oldOrders].slice(0, MAX_ORDERS)
    };
    await writeJsonFile(token, ORDERS_PATH, current.sha, nextData, "PayTR pending siparis kaydi eklendi");
    return { saved: true, merchantOid };
  } catch (error) {
    return { saved: false, reason: "write-failed", merchantOid };
  }
}

function randomPart(size) {
  return crypto.randomBytes(size).toString("hex").toUpperCase();
}

function planPrefix(planCode) {
  const code = String(planCode || "gold").trim().toLowerCase();
  if (code === "diamond") return "DIA";
  if (code === "premium") return "PRE";
  if (code === "gift") return "GIFT";
  if (code === "founder") return "KURUCU";
  return "GOLD";
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code || "").trim()).digest("hex");
}

function maskCode(code) {
  const parts = String(code || "").split("-");
  if (parts.length >= 3) return `${parts[0]}-${parts[1]}-****-${parts[parts.length - 1]}`;
  return "AUTO-****";
}

function generateMembershipCode(planCode) {
  const prefix = planPrefix(planCode);
  const code = `${prefix}-${randomPart(2)}-${randomPart(2)}-${randomPart(2)}`;
  return { code, codeHash: hashCode(code), codeLabel: maskCode(code) };
}

async function findOrderByMerchantOid(token, merchantOid) {
  if (!token) return { ok: false, reason: "token-missing", found: false, order: null, generated: null };
  try {
    const current = await readJsonFile(token, ORDERS_PATH);
    const order = (current.data.orders || []).find(item => item && item.merchant_oid === merchantOid) || null;
    return {
      ok: true,
      reason: null,
      found: Boolean(order),
      order,
      generated: order ? generateMembershipCode(order.plan_id) : null
    };
  } catch (error) {
    return { ok: false, reason: "read-failed", found: false, order: null, generated: null };
  }
}

module.exports = {
  PLANS,
  json,
  text,
  readBody,
  requireEnv,
  getPlan,
  createTrialMembershipFromPlan,
  paytrToken,
  verifyCallbackHash,
  orderId,
  getIframeToken,
  getUsageToken,
  readJsonFile,
  writeJsonFile,
  appendUsageRecord,
  decreaseMembershipCount,
  stageCodeRecord,
  appendPendingOrder,
  generateMembershipCode,
  findOrderByMerchantOid,
};

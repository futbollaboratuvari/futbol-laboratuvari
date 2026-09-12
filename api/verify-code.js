const SECURE_VERIFY_URL = process.env.FL_BANK_TRANSFER_VERIFY_URL
  || "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-bank-transfer?action=verify-code";

const TRUSTED_BROWSER_ORIGINS = new Set([
  "https://futbollaboratuuvari.org",
  "https://www.futbollaboratuuvari.org",
]);

function send(res, statusCode, payload) {
  res.statusCode = statusCode;
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

function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") {
    try {
      return Promise.resolve(JSON.parse(req.body || "{}"));
    } catch {
      return Promise.resolve({});
    }
  }
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 8192) reject(new Error("payload_too_large"));
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", reject);
  });
}

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toLocaleUpperCase("tr-TR");
}

function safeResponse(data) {
  const payload = data && typeof data === "object" ? data : {};
  const membership = payload.membership && typeof payload.membership === "object"
    ? {
        planCode: String(payload.membership.planCode || payload.membership.plan_code || ""),
        planName: String(payload.membership.planName || payload.membership.plan_name || ""),
        remainingAnalysisCount: Number(
          payload.membership.remainingAnalysisCount
          ?? payload.membership.remaining_analysis_count
          ?? 0,
        ),
        expiresAt: payload.membership.expiresAt || payload.membership.expires_at || null,
        codeLabel: String(payload.membership.codeLabel || payload.membership.code_label || ""),
      }
    : undefined;

  return {
    ok: payload.ok === true,
    message: String(payload.message || payload.error || "Üyelik doğrulanamadı.").slice(0, 300),
    ...(membership ? { membership } : {}),
  };
}

async function handler(req, res) {
  if (!configureCors(req, res)) {
    return send(res, 403, { ok: false, message: "Kaynak adresine izin verilmiyor." });
  }
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "POST") {
    return send(res, 405, { ok: false, message: "Sadece POST isteği kabul edilir." });
  }

  try {
    const body = await readBody(req);
    const code = normalizeCode(body.code);
    const clientId = String(body.clientId || "").trim().slice(0, 160);
    if (code.length < 4 || code.length > 128) {
      return send(res, 400, { ok: false, message: "Geçerli üyelik kodu gerekli." });
    }

    const response = await fetch(SECURE_VERIFY_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://futbollaboratuuvari.org",
      },
      body: JSON.stringify({ code, clientId }),
    });
    const raw = await response.text();
    if (raw.length > 16384) throw new Error("upstream_response_too_large");
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      throw new Error("upstream_invalid_json");
    }
    return send(res, response.status, safeResponse(data));
  } catch (error) {
    console.error("verify-code secure proxy", error?.message || error);
    return send(res, 503, { ok: false, message: "Üyelik doğrulama servisine ulaşılamadı." });
  }
}

handler.SECURE_VERIFY_URL = SECURE_VERIFY_URL;
handler.originAllowed = originAllowed;
handler.safeResponse = safeResponse;

module.exports = handler;

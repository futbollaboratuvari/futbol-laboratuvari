const fs = require("node:fs");
const path = require("node:path");
const { GITHUB_OIDC_AUDIENCE, extractValidCoupons } = require("../server-lib/_lib/coupon-mail");

const DEFAULT_ENDPOINT = "https://futbol-laboratuvari.vercel.app/api/send-coupon-mail";
const COUPON_FILE = path.join(__dirname, "..", "data", "daily-coupons.json");
const RETRY_DELAYS_MS = [1500, 4000, 8000];

function readCouponFile(filePath = COUPON_FILE) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Kupon verisi okunamadı: ${error.message}`);
  }
}

function trustedActionsOidcUrl(value) {
  try {
    const url = new URL(String(value || ""));
    const hostname = url.hostname.toLowerCase();
    return url.protocol === "https:"
      && (hostname === "token.actions.githubusercontent.com" || hostname.endsWith(".actions.githubusercontent.com"));
  } catch {
    return false;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function retryableStatus(status) {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

async function resolveAuthorizationToken(env, fetchImpl) {
  const sharedSecret = String(env.COUPON_MAIL_SECRET || "").trim();
  if (sharedSecret) return sharedSecret;

  const requestUrl = String(env.ACTIONS_ID_TOKEN_REQUEST_URL || "").trim();
  const requestToken = String(env.ACTIONS_ID_TOKEN_REQUEST_TOKEN || "").trim();
  if (!requestUrl || !requestToken) throw new Error("COUPON_MAIL_SECRET veya GitHub Actions OIDC kimliği eksik");
  if (!trustedActionsOidcUrl(requestUrl)) throw new Error("GitHub Actions OIDC adresi güvenilir değil");

  const url = new URL(requestUrl);
  url.searchParams.set("audience", GITHUB_OIDC_AUDIENCE);

  let lastStatus = 0;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetchImpl(url.toString(), {
        headers: {
          Authorization: `Bearer ${requestToken}`,
          Accept: "application/json",
          "User-Agent": "futbol-laboratuvari-coupon-workflow",
        },
      });
      const raw = await response.text();
      lastStatus = response.status;
      if (response.ok && raw.length <= 64 * 1024) {
        let token;
        try { token = JSON.parse(raw)?.value; } catch { token = ""; }
        if (typeof token === "string" && token.split(".").length === 3 && token.length <= 32 * 1024) return token;
        throw new Error("GitHub Actions OIDC yanıtı geçersiz");
      }
      if (!retryableStatus(response.status) || attempt === RETRY_DELAYS_MS.length) {
        throw new Error(`GitHub Actions OIDC alınamadı (http_${response.status})`);
      }
    } catch (error) {
      if (attempt === RETRY_DELAYS_MS.length || (lastStatus && !retryableStatus(lastStatus))) throw error;
    }
    await sleep(RETRY_DELAYS_MS[attempt]);
  }
  throw new Error(`GitHub Actions OIDC alınamadı (http_${lastStatus || "network"})`);
}

async function callCouponEndpoint(endpoint, authorizationToken, fetchImpl) {
  let lastError = "unknown";
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await fetchImpl(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authorizationToken}`,
          "Content-Type": "application/json",
          "User-Agent": "futbol-laboratuvari-coupon-workflow",
        },
        body: JSON.stringify({ trigger: "coupon-data-workflow" }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok !== false) return result;

      const code = result.error || result.status || `http_${response.status}`;
      const missing = Array.isArray(result.missing) && result.missing.length ? `: ${result.missing.join(", ")}` : "";
      lastError = `${code}${missing}`;
      const retryable = retryableStatus(response.status) || result.status === "partial_failure";
      if (!retryable || attempt === RETRY_DELAYS_MS.length) {
        throw new Error(`Kupon mail endpoint'i başarısız (${lastError})`);
      }
    } catch (error) {
      lastError = error?.message || String(error);
      if (attempt === RETRY_DELAYS_MS.length) throw error;
    }
    await sleep(RETRY_DELAYS_MS[attempt]);
  }
  throw new Error(`Kupon mail endpoint'i başarısız (${lastError})`);
}

async function triggerCouponNotification({
  env = process.env,
  fetchImpl = global.fetch,
  payload = readCouponFile(),
} = {}) {
  const validCoupons = extractValidCoupons(payload);
  if (!validCoupons.length) {
    return { ok: true, status: "no_valid_coupon", sent: 0, skipped: 0, failed: 0 };
  }

  const endpoint = String(env.COUPON_MAIL_ENDPOINT || DEFAULT_ENDPOINT).trim();
  if (!/^https:\/\//i.test(endpoint) && !/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(endpoint)) {
    throw new Error("COUPON_MAIL_ENDPOINT güvenli bir HTTPS adresi olmalıdır");
  }
  const authorizationToken = await resolveAuthorizationToken(env, fetchImpl);
  return callCouponEndpoint(endpoint, authorizationToken, fetchImpl);
}

async function main() {
  const result = await triggerCouponNotification();
  console.log(`Kupon mail bildirimi: durum=${result.status}, gönderilen=${result.sent || 0}, atlanan=${result.skipped || 0}, hata=${result.failed || 0}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  COUPON_FILE,
  DEFAULT_ENDPOINT,
  RETRY_DELAYS_MS,
  callCouponEndpoint,
  readCouponFile,
  resolveAuthorizationToken,
  retryableStatus,
  trustedActionsOidcUrl,
  triggerCouponNotification,
};

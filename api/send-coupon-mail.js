const { timingSafeEqual } = require("node:crypto");
const {
  createResendSender,
  createSupabaseDeliveryStore,
  extractValidCoupons,
  loadCouponPayload,
  processCouponNotifications,
  requiredRuntimeConfig,
  verifyGitHubActionsOidc,
} = require("../server-lib/_lib/coupon-mail");

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Allow", "POST");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

function bearerToken(req) {
  const header = String(req.headers?.authorization || "");
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

function sameSecret(value, expected) {
  const left = Buffer.from(String(value || ""), "utf8");
  const right = Buffer.from(String(expected || ""), "utf8");
  return left.length > 0 && left.length === right.length && timingSafeEqual(left, right);
}

function createHandler(overrides = {}) {
  return async function sendCouponMail(req, res) {
    if (req.method !== "POST") return json(res, 405, { ok: false, error: "method_not_allowed" });

    const env = overrides.env || process.env;
    const internalSecret = String(env.COUPON_MAIL_SECRET || "").trim();
    const requestToken = bearerToken(req);
    if (!internalSecret && !requestToken) {
      const missing = ["COUPON_MAIL_SECRET", ...requiredRuntimeConfig(env)];
      return json(res, 503, { ok: false, error: "missing_environment", missing });
    }
    let authorized = internalSecret ? sameSecret(requestToken, internalSecret) : false;
    if (!authorized && requestToken) {
      authorized = await (overrides.verifyGitHubActionsOidc || verifyGitHubActionsOidc)(requestToken, {
        fetchImpl: overrides.fetchImpl || global.fetch,
      });
    }
    if (!authorized) {
      return json(res, 401, { ok: false, error: "unauthorized" });
    }

    let payload;
    try {
      payload = await (overrides.loadCouponPayload || loadCouponPayload)({
        fetchImpl: overrides.fetchImpl || global.fetch,
        githubToken: env.COUPON_GITHUB_TOKEN || "",
      });
    } catch (error) {
      console.error("coupon-mail source", error?.message || error);
      return json(res, 502, { ok: false, error: "coupon_source_unavailable" });
    }

    const candidates = extractValidCoupons(payload);
    if (!candidates.length) {
      return json(res, 200, { ok: true, status: "no_valid_coupon", sent: 0, skipped: 0, failed: 0 });
    }

    const missing = requiredRuntimeConfig(env);
    if (missing.length) {
      return json(res, 503, { ok: false, error: "missing_environment", missing });
    }

    const fetchImpl = overrides.fetchImpl || global.fetch;
    const store = overrides.store || createSupabaseDeliveryStore({
      baseUrl: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      fetchImpl,
    });
    const sendEmail = overrides.sendEmail || createResendSender({
      apiKey: env.RESEND_API_KEY,
      from: env.COUPON_MAIL_FROM,
      to: env.COUPON_MAIL_TO,
      fetchImpl,
    });

    const result = await processCouponNotifications({ payload, store, sendEmail });
    const response = {
      ok: result.failed.length === 0,
      status: result.failed.length ? "partial_failure" : (result.sent.length ? "sent" : "already_processed"),
      candidates: result.candidates,
      sent: result.sent.length,
      skipped: result.skipped.length,
      failed: result.failed.length,
      coupon_ids: [...result.sent, ...result.skipped].map((item) => item.coupon_id),
    };
    if (result.failed.length) {
      console.error("coupon-mail failed", result.failed.map((item) => ({ coupon_id: item.coupon_id, stage: item.stage, error: item.error })));
      return json(res, 502, response);
    }
    return json(res, 200, response);
  };
}

const handler = createHandler();
handler.createHandler = createHandler;
handler.sameSecret = sameSecret;

module.exports = handler;

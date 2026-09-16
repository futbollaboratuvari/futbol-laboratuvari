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

const DELIVERY_STATE_RETRY_DELAYS_MS = [250, 750, 1500];
const PRIMARY_COUPON_RECIPIENT = "cemkaplanoglu@gmail.com";
const SECONDARY_COUPON_RECIPIENT = "arifkaplanoglu@gmail.com";

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

function supportsExternalRecipients(from) {
  const sender = String(from || "").trim().toLowerCase();
  return Boolean(sender) && !sender.includes("onboarding@resend.dev");
}

function mergeCouponRecipients(value, from) {
  const recipients = [
    ...String(value || "").split(","),
    PRIMARY_COUPON_RECIPIENT,
    ...(supportsExternalRecipients(from) ? [SECONDARY_COUPON_RECIPIENT] : []),
  ]
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(recipients)].join(",");
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function retryDeliveryState(operation, delays = DELIVERY_STATE_RETRY_DELAYS_MS) {
  let lastError;
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === delays.length) throw error;
      await sleep(delays[attempt]);
    }
  }
  throw lastError;
}

function withDeliveryStateRetries(store) {
  return {
    claim(entry) {
      return retryDeliveryState(() => store.claim(entry));
    },
    complete(entry, claimToken, providerMessageId) {
      return retryDeliveryState(() => store.complete(entry, claimToken, providerMessageId));
    },
    fail(entry, claimToken, error) {
      return retryDeliveryState(() => store.fail(entry, claimToken, error));
    },
  };
}

function createHandler(overrides = {}) {
  return async function sendCouponMail(req, res) {
    if (req.method !== "POST") return json(res, 405, { ok: false, error: "method_not_allowed" });

    const env = overrides.env || process.env;
    const couponMailTo = mergeCouponRecipients(env.COUPON_MAIL_TO, env.COUPON_MAIL_FROM);
    const runtimeEnv = { ...env, COUPON_MAIL_TO: couponMailTo };
    const internalSecret = String(env.COUPON_MAIL_SECRET || "").trim();
    const requestToken = bearerToken(req);
    if (!internalSecret && !requestToken) {
      const missing = ["COUPON_MAIL_SECRET", ...requiredRuntimeConfig(runtimeEnv)];
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

    const missing = requiredRuntimeConfig(runtimeEnv);
    if (missing.length) {
      return json(res, 503, { ok: false, error: "missing_environment", missing });
    }

    const fetchImpl = overrides.fetchImpl || global.fetch;
    const rawStore = overrides.store || createSupabaseDeliveryStore({
      baseUrl: env.SUPABASE_URL,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      fetchImpl,
    });
    const store = overrides.store ? rawStore : withDeliveryStateRetries(rawStore);
    const sendEmail = overrides.sendEmail || createResendSender({
      apiKey: env.RESEND_API_KEY,
      from: env.COUPON_MAIL_FROM,
      to: couponMailTo,
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
      recipient_count: couponMailTo.split(",").filter(Boolean).length,
      secondary_recipient_enabled: supportsExternalRecipients(env.COUPON_MAIL_FROM),
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
handler.supportsExternalRecipients = supportsExternalRecipients;
handler.mergeCouponRecipients = mergeCouponRecipients;
handler.PRIMARY_COUPON_RECIPIENT = PRIMARY_COUPON_RECIPIENT;
handler.SECONDARY_COUPON_RECIPIENT = SECONDARY_COUPON_RECIPIENT;
handler.retryDeliveryState = retryDeliveryState;
handler.withDeliveryStateRetries = withDeliveryStateRetries;

module.exports = handler;

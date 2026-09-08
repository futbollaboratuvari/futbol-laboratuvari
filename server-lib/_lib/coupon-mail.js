const { createHash, createPublicKey, randomUUID, verify } = require("node:crypto");
const couponRules = require("../../pro-coupon-eligibility.js");

const SUBJECT = "Futbol Laboratuvarı - Yeni Kupon";
const DISCLAIMER = "Bu kupon öneridir. Otomatik olarak oynanmaz ve kesin sonuç garantisi yoktur.";
const COUPON_SOURCE_URL = "https://api.github.com/repos/futbollaboratuvari/futbol-laboratuvari/contents/data/daily-coupons.json?ref=main";
const DELIVERY_TABLE = "coupon_mail_deliveries";
const CLAIM_LEASE_MS = 5 * 60 * 1000;
const GITHUB_OIDC_AUDIENCE = "futbol-laboratuvari-coupon-mail";
const GITHUB_OIDC_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_OIDC_JWKS_URL = "https://token.actions.githubusercontent.com/.well-known/jwks";
const TRUSTED_GITHUB_REPOSITORY = "futbollaboratuvari/futbol-laboratuvari";
const TRUSTED_GITHUB_REPOSITORY_ID = "1266874356";
const TRUSTED_GITHUB_OWNER_ID = "292969398";
const TRUSTED_GITHUB_WORKFLOW_REF = `${TRUSTED_GITHUB_REPOSITORY}/.github/workflows/coupon-mail-notification.yml@refs/heads/main`;

const cleanText = (value, max = 500) => String(value ?? "")
  .replace(/[\u0000-\u001f\u007f]/g, " ")
  .replace(/\s+/g, " ")
  .trim()
  .slice(0, max);

const identityText = (value) => cleanText(value, 500).normalize("NFKC");

const finiteNumber = (value) => {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#039;",
}[character]));

const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");

function decodeJwtPart(value, maxBytes = 16 * 1024) {
  if (typeof value !== "string" || !value || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("invalid_jwt_part");
  const decoded = Buffer.from(value, "base64url");
  if (!decoded.length || decoded.length > maxBytes) throw new Error("invalid_jwt_size");
  return JSON.parse(decoded.toString("utf8"));
}

function validGithubOidcClaims(payload, nowMs) {
  const nowSeconds = Math.floor(nowMs / 1000);
  const audiences = Array.isArray(payload?.aud) ? payload.aud : [payload?.aud];
  const eventAllowed = payload?.event_name === "workflow_run" || payload?.event_name === "workflow_dispatch";
  return payload?.iss === GITHUB_OIDC_ISSUER
    && audiences.includes(GITHUB_OIDC_AUDIENCE)
    && Number.isFinite(payload?.exp) && payload.exp >= nowSeconds - 60
    && Number.isFinite(payload?.nbf) && payload.nbf <= nowSeconds + 60
    && Number.isFinite(payload?.iat) && payload.iat <= nowSeconds + 60 && payload.iat >= nowSeconds - 15 * 60
    && cleanText(payload?.jti, 200).length > 0
    && payload?.repository === TRUSTED_GITHUB_REPOSITORY
    && String(payload?.repository_id || "") === TRUSTED_GITHUB_REPOSITORY_ID
    && String(payload?.repository_owner_id || "") === TRUSTED_GITHUB_OWNER_ID
    && payload?.ref === "refs/heads/main"
    && payload?.workflow_ref === TRUSTED_GITHUB_WORKFLOW_REF
    && payload?.workflow === "Coupon Mail Notification"
    && payload?.runner_environment === "github-hosted"
    && eventAllowed;
}

async function verifyGitHubActionsOidc(token, { fetchImpl = fetch, now = () => new Date() } = {}) {
  try {
    const compact = String(token || "").trim();
    if (!compact || compact.length > 32 * 1024) return false;
    const parts = compact.split(".");
    if (parts.length !== 3) return false;
    const header = decodeJwtPart(parts[0], 4 * 1024);
    const payload = decodeJwtPart(parts[1], 16 * 1024);
    if (header?.alg !== "RS256" || header?.typ !== "JWT" || !cleanText(header?.kid, 300)) return false;
    const current = now();
    const nowMs = current instanceof Date ? current.getTime() : Number(current);
    if (!Number.isFinite(nowMs) || !validGithubOidcClaims(payload, nowMs)) return false;

    const response = await fetchImpl(GITHUB_OIDC_JWKS_URL, {
      headers: { Accept: "application/json", "User-Agent": "futbol-laboratuvari-coupon-mail" },
      cache: "no-store",
    });
    const raw = await response.text();
    if (!response.ok || raw.length > 256 * 1024) return false;
    const jwks = JSON.parse(raw);
    const jwk = Array.isArray(jwks?.keys)
      ? jwks.keys.find((item) => item?.kid === header.kid && item?.kty === "RSA" && (!item.alg || item.alg === "RS256"))
      : null;
    if (!jwk) return false;
    const publicKey = createPublicKey({ key: jwk, format: "jwk" });
    const signature = Buffer.from(parts[2], "base64url");
    if (!signature.length) return false;
    return verify("RSA-SHA256", Buffer.from(`${parts[0]}.${parts[1]}`, "utf8"), publicKey, signature);
  } catch {
    return false;
  }
}

function canonicalCoupon(payload, key, coupon) {
  return {
    generated_at: identityText(payload.generated_at),
    coupon_type: identityText(coupon.coupon_type || key),
    selections: coupon.selected_matches.map((leg) => ({
      match: identityText(leg.match_name),
      market: identityText(leg.recommended_market),
    })),
  };
}

function couponIdentity(payload, key, coupon) {
  const canonical = JSON.stringify(canonicalCoupon(payload, key, coupon));
  const hash = sha256(canonical);
  return {
    couponId: `FL-COUPON:${hash}`,
    payloadHash: hash,
  };
}

function validGeneratedAt(value) {
  return Boolean(cleanText(value, 100)) && Number.isFinite(Date.parse(value));
}

function validCoupon(payload, coupon) {
  if (!validGeneratedAt(payload?.generated_at)) return false;
  if (!coupon || coupon.is_available !== true) return false;
  const legs = Array.isArray(coupon.selected_matches) ? coupon.selected_matches : [];
  if (!legs.length) return false;
  if (finiteNumber(coupon.total_odds) === null || finiteNumber(coupon.total_odds) <= 1) return false;
  return legs.every((leg) => cleanText(leg?.match_name, 200)
    && finiteNumber(leg?.estimated_odds) > 1
    && couponRules.isCouponEligible(leg));
}

function extractValidCoupons(payload) {
  const coupons = payload?.coupons && typeof payload.coupons === "object" ? payload.coupons : {};
  const seen = new Set();
  const rows = [];
  for (const [key, coupon] of Object.entries(coupons)) {
    if (!validCoupon(payload, coupon)) continue;
    const identity = couponIdentity(payload, key, coupon);
    if (seen.has(identity.couponId)) continue;
    seen.add(identity.couponId);
    rows.push({ key, coupon, generatedAt: payload.generated_at, ...identity });
  }
  return rows;
}

function formatTimestamp(value) {
  try {
    const formatted = new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "long",
      timeStyle: "medium",
      timeZone: "Europe/Istanbul",
    }).format(new Date(value));
    return `${formatted} (Türkiye saati)`;
  } catch {
    return cleanText(value, 100) || "-";
  }
}

function displayMetric(value, suffix = "") {
  const number = finiteNumber(value);
  if (number === null) return "-";
  return `${Math.round(number * 10) / 10}${suffix}`;
}

function buildCouponEmail(entry) {
  const { coupon, couponId, generatedAt, key } = entry;
  const couponType = cleanText(coupon.coupon_name || coupon.coupon_type || key, 120) || "Kupon";
  const risk = cleanText(coupon.risk_level, 80) || "-";
  const totalOdds = cleanText(coupon.total_odds, 40) || "-";
  const reason = cleanText(coupon.robot_reason || coupon.short_description, 600) || "Robot kalite filtrelerini geçen seçimlerden oluşturuldu.";
  const producedAt = formatTimestamp(generatedAt);

  const textLegs = coupon.selected_matches.map((leg, index) => {
    const model = leg.model_score ?? leg.confidence_score ?? leg.analysis_score;
    const rows = [
      `${index + 1}. ${cleanText(leg.match_name, 200)}`,
      `   Market: ${cleanText(leg.recommended_market, 120)}`,
      `   Tahmini oran: ${cleanText(leg.estimated_odds, 40) || "-"}`,
    ];
    if (finiteNumber(model) !== null) rows.push(`   Model / güven: ${displayMetric(model, "%")}`);
    if (finiteNumber(leg.edge_percent) !== null) rows.push(`   Edge: ${displayMetric(leg.edge_percent, "%")}`);
    if (cleanText(leg.robot_reason, 300)) rows.push(`   Gerekçe: ${cleanText(leg.robot_reason, 300)}`);
    return rows.join("\n");
  }).join("\n\n");

  const text = [
    SUBJECT,
    "",
    `Kupon tipi / risk profili: ${couponType} / ${risk}`,
    `Kupon kimliği: ${couponId}`,
    "",
    textLegs,
    "",
    `Toplam oran: ${totalOdds}`,
    `Üretildiği tarih ve saat: ${producedAt}`,
    `Kısa robot gerekçesi: ${reason}`,
    "",
    DISCLAIMER,
  ].join("\n");

  const htmlLegs = coupon.selected_matches.map((leg, index) => {
    const model = leg.model_score ?? leg.confidence_score ?? leg.analysis_score;
    const metrics = [
      `<strong>Tahmini oran:</strong> ${escapeHtml(cleanText(leg.estimated_odds, 40) || "-")}`,
    ];
    if (finiteNumber(model) !== null) metrics.push(`<strong>Model / güven:</strong> ${escapeHtml(displayMetric(model, "%"))}`);
    if (finiteNumber(leg.edge_percent) !== null) metrics.push(`<strong>Edge:</strong> ${escapeHtml(displayMetric(leg.edge_percent, "%"))}`);
    const legReason = cleanText(leg.robot_reason, 300);
    return `<tr>
      <td style="padding:12px;border-bottom:1px solid #dbe4ee;vertical-align:top">${index + 1}</td>
      <td style="padding:12px;border-bottom:1px solid #dbe4ee;vertical-align:top"><strong>${escapeHtml(cleanText(leg.match_name, 200))}</strong>${legReason ? `<br><span style="color:#526274">${escapeHtml(legReason)}</span>` : ""}</td>
      <td style="padding:12px;border-bottom:1px solid #dbe4ee;vertical-align:top">${escapeHtml(cleanText(leg.recommended_market, 120))}</td>
      <td style="padding:12px;border-bottom:1px solid #dbe4ee;vertical-align:top">${metrics.join("<br>")}</td>
    </tr>`;
  }).join("");

  const html = `<!doctype html>
  <html lang="tr"><body style="margin:0;background:#f3f6f9;color:#102033;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:760px;margin:0 auto;padding:24px">
      <div style="background:#071426;color:#fff;border-radius:14px 14px 0 0;padding:22px">
        <div style="color:#ffd166;font-size:13px;font-weight:700;letter-spacing:.08em">FUTBOL LABORATUVARI</div>
        <h1 style="font-size:24px;margin:8px 0 0">Yeni Kupon</h1>
      </div>
      <div style="background:#fff;border:1px solid #dbe4ee;border-top:0;border-radius:0 0 14px 14px;padding:22px">
        <p><strong>Kupon tipi / risk profili:</strong> ${escapeHtml(couponType)} / ${escapeHtml(risk)}</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
          <thead><tr style="background:#edf3f8;text-align:left"><th style="padding:10px">#</th><th style="padding:10px">Maç</th><th style="padding:10px">Önerilen market</th><th style="padding:10px">Veriler</th></tr></thead>
          <tbody>${htmlLegs}</tbody>
        </table>
        <p><strong>Toplam oran:</strong> ${escapeHtml(totalOdds)}<br><strong>Üretildiği tarih ve saat:</strong> ${escapeHtml(producedAt)}</p>
        <p><strong>Kısa robot gerekçesi:</strong> ${escapeHtml(reason)}</p>
        <p style="background:#fff4d6;border-left:4px solid #e59b00;padding:12px"><strong>${escapeHtml(DISCLAIMER)}</strong></p>
        <p style="color:#6b7788;font-size:12px">Kupon kimliği: ${escapeHtml(couponId)}</p>
      </div>
    </div>
  </body></html>`;

  return { subject: SUBJECT, text, html };
}

function parseRecipients(value) {
  const recipients = String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
  if (!recipients.length || recipients.length > 10) return [];
  return recipients.every((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)) ? recipients : [];
}

function validFrom(value) {
  const match = String(value || "").trim().match(/(?:^|<)([^<>\s]+@[^<>\s]+\.[^<>\s]+)>?$/);
  return Boolean(match);
}

function requiredRuntimeConfig(env) {
  const names = [
    "COUPON_MAIL_TO",
    "COUPON_MAIL_FROM",
    "RESEND_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const missing = names.filter((name) => !cleanText(env[name], 2000));
  if (!missing.includes("COUPON_MAIL_TO") && !parseRecipients(env.COUPON_MAIL_TO).length) missing.push("COUPON_MAIL_TO");
  if (!missing.includes("COUPON_MAIL_FROM") && !validFrom(env.COUPON_MAIL_FROM)) missing.push("COUPON_MAIL_FROM");
  return Array.from(new Set(missing));
}

async function loadCouponPayload({ fetchImpl = fetch, githubToken = "" } = {}) {
  const headers = {
    Accept: "application/vnd.github.raw+json",
    "User-Agent": "futbol-laboratuvari-coupon-mail",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (githubToken) headers.Authorization = `Bearer ${githubToken}`;
  const response = await fetchImpl(COUPON_SOURCE_URL, { headers, cache: "no-store" });
  const raw = await response.text();
  if (!response.ok) throw new Error(`coupon_source_http_${response.status}`);
  if (raw.length > 1024 * 1024) throw new Error("coupon_source_too_large");
  let payload;
  try {
    payload = JSON.parse(raw);
    if (payload?.encoding === "base64" && payload?.content) {
      payload = JSON.parse(Buffer.from(payload.content, "base64").toString("utf8"));
    }
  } catch {
    throw new Error("coupon_source_invalid_json");
  }
  return payload;
}

function supabaseUrl(base, path, query = null) {
  const url = new URL(`/rest/v1/${path}`, String(base).replace(/\/$/, ""));
  if (query) {
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  }
  return url.toString();
}

function supabaseRequestHeaders(serverKey, prefer = "") {
  const apiKey = String(serverKey || "").trim();
  const headers = {
    apikey: apiKey,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };

  // Supabase's current sb_secret_* keys must be sent only through `apikey`.
  // Legacy JWT service_role keys still require the Bearer header.
  if (!apiKey.startsWith("sb_secret_")) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

function createSupabaseDeliveryStore({ baseUrl, serviceRoleKey, fetchImpl = fetch, now = () => new Date() }) {
  const headers = (prefer) => supabaseRequestHeaders(serviceRoleKey, prefer);

  const parse = async (response) => {
    const raw = await response.text();
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return { message: cleanText(raw, 300) }; }
  };

  const readCurrent = async (couponId) => {
    const response = await fetchImpl(supabaseUrl(baseUrl, DELIVERY_TABLE, {
      coupon_id: `eq.${couponId}`,
      select: "coupon_id,status,claim_token,lease_expires_at,attempt_count",
      limit: "1",
    }), { headers: headers() });
    const data = await parse(response);
    if (!response.ok) throw new Error(`delivery_state_read_${response.status}`);
    return Array.isArray(data) ? data[0] || null : null;
  };

  const updateClaim = async (current, entry, claimToken, timestamp, leaseExpiresAt) => {
    const response = await fetchImpl(supabaseUrl(baseUrl, DELIVERY_TABLE, {
      coupon_id: `eq.${entry.couponId}`,
      claim_token: `eq.${current.claim_token}`,
      select: "coupon_id,status,claim_token,attempt_count",
    }), {
      method: "PATCH",
      headers: headers("return=representation"),
      body: JSON.stringify({
        status: "sending",
        claim_token: claimToken,
        lease_expires_at: leaseExpiresAt,
        attempt_count: Number(current.attempt_count || 0) + 1,
        payload_hash: entry.payloadHash,
        updated_at: timestamp,
        last_error: null,
      }),
    });
    const data = await parse(response);
    if (!response.ok) throw new Error(`delivery_state_reclaim_${response.status}`);
    return Array.isArray(data) && data.length ? { claimed: true, claimToken } : { claimed: false, reason: "in_progress" };
  };

  return {
    async claim(entry) {
      const timestamp = now().toISOString();
      const leaseExpiresAt = new Date(now().getTime() + CLAIM_LEASE_MS).toISOString();
      const claimToken = randomUUID();
      const response = await fetchImpl(supabaseUrl(baseUrl, DELIVERY_TABLE, null), {
        method: "POST",
        headers: headers("return=representation"),
        body: JSON.stringify({
          coupon_id: entry.couponId,
          payload_hash: entry.payloadHash,
          coupon_type: cleanText(entry.coupon.coupon_type || entry.key, 80),
          generated_at: entry.generatedAt,
          status: "sending",
          claim_token: claimToken,
          lease_expires_at: leaseExpiresAt,
          attempt_count: 1,
          updated_at: timestamp,
        }),
      });
      const data = await parse(response);
      if (response.ok) return { claimed: true, claimToken };
      if (response.status !== 409) throw new Error(`delivery_state_claim_${response.status}`);

      const current = await readCurrent(entry.couponId);
      if (!current) throw new Error("delivery_state_conflict_missing");
      if (current.status === "sent") return { claimed: false, reason: "duplicate" };
      const leaseActive = current.status === "sending"
        && Number.isFinite(Date.parse(current.lease_expires_at))
        && Date.parse(current.lease_expires_at) > now().getTime();
      if (leaseActive) return { claimed: false, reason: "in_progress" };
      return updateClaim(current, entry, claimToken, timestamp, leaseExpiresAt);
    },

    async complete(entry, claimToken, providerMessageId) {
      const timestamp = now().toISOString();
      const response = await fetchImpl(supabaseUrl(baseUrl, DELIVERY_TABLE, {
        coupon_id: `eq.${entry.couponId}`,
        claim_token: `eq.${claimToken}`,
        select: "coupon_id,status",
      }), {
        method: "PATCH",
        headers: headers("return=representation"),
        body: JSON.stringify({
          status: "sent",
          provider_message_id: cleanText(providerMessageId, 200) || null,
          sent_at: timestamp,
          lease_expires_at: null,
          last_error: null,
          updated_at: timestamp,
        }),
      });
      const data = await parse(response);
      if (!response.ok || !Array.isArray(data) || !data.length) throw new Error("delivery_state_finalize_failed");
    },

    async fail(entry, claimToken, error) {
      const timestamp = now().toISOString();
      const response = await fetchImpl(supabaseUrl(baseUrl, DELIVERY_TABLE, {
        coupon_id: `eq.${entry.couponId}`,
        claim_token: `eq.${claimToken}`,
      }), {
        method: "PATCH",
        headers: headers("return=minimal"),
        body: JSON.stringify({
          status: "failed",
          lease_expires_at: null,
          last_error: cleanText(error?.message || error, 500) || "mail_delivery_failed",
          updated_at: timestamp,
        }),
      });
      if (!response.ok) throw new Error(`delivery_state_fail_${response.status}`);
    },
  };
}

function createResendSender({ apiKey, from, to, fetchImpl = fetch }) {
  const recipients = parseRecipients(to);
  return async (entry, content) => {
    const response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": entry.couponId,
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: content.subject,
        text: content.text,
        html: content.html,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.id) {
      throw new Error(cleanText(data?.message, 300) || `resend_http_${response.status}`);
    }
    return { provider: "resend", id: cleanText(data.id, 200) };
  };
}

async function processCouponNotifications({ payload, store, sendEmail }) {
  const entries = extractValidCoupons(payload);
  const result = { candidates: entries.length, sent: [], skipped: [], failed: [] };
  for (const entry of entries) {
    let claim;
    try {
      claim = await store.claim(entry);
    } catch (error) {
      result.failed.push({ coupon_id: entry.couponId, stage: "claim", error: cleanText(error?.message || error, 200) });
      continue;
    }
    if (!claim.claimed) {
      result.skipped.push({ coupon_id: entry.couponId, reason: claim.reason || "duplicate" });
      continue;
    }
    let delivery;
    try {
      delivery = await sendEmail(entry, buildCouponEmail(entry));
    } catch (error) {
      try { await store.fail(entry, claim.claimToken, error); } catch {}
      result.failed.push({ coupon_id: entry.couponId, stage: "delivery", error: cleanText(error?.message || error, 200) });
      continue;
    }
    try {
      await store.complete(entry, claim.claimToken, delivery?.id);
      result.sent.push({ coupon_id: entry.couponId, provider: delivery?.provider || "resend", provider_message_id: delivery?.id || null });
    } catch (error) {
      // Provider accepted the email. Keep the durable claim in "sending" so a
      // transient state-finalization error cannot immediately create a duplicate.
      result.failed.push({ coupon_id: entry.couponId, stage: "finalize", error: cleanText(error?.message || error, 200) });
    }
  }
  return result;
}

module.exports = {
  CLAIM_LEASE_MS,
  COUPON_SOURCE_URL,
  DISCLAIMER,
  GITHUB_OIDC_AUDIENCE,
  GITHUB_OIDC_ISSUER,
  GITHUB_OIDC_JWKS_URL,
  SUBJECT,
  TRUSTED_GITHUB_OWNER_ID,
  TRUSTED_GITHUB_REPOSITORY,
  TRUSTED_GITHUB_REPOSITORY_ID,
  TRUSTED_GITHUB_WORKFLOW_REF,
  buildCouponEmail,
  couponIdentity,
  createResendSender,
  createSupabaseDeliveryStore,
  extractValidCoupons,
  loadCouponPayload,
  parseRecipients,
  processCouponNotifications,
  requiredRuntimeConfig,
  supabaseRequestHeaders,
  validCoupon,
  verifyGitHubActionsOidc,
};

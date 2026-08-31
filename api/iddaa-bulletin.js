"use strict";

const {
  fetchIddaaBulletin,
  fetchIddaaEventDetail,
} = require("../scripts/iddaa-data-source");

const TRUSTED_ORIGINS = new Set([
  "https://futbollaboratuuvari.org",
  "https://www.futbollaboratuuvari.org",
  "https://futbollaboratuvari.org",
  "https://www.futbollaboratuvari.org",
  "https://futbol-laboratuvari.vercel.app",
]);

function send(res, status, payload, cacheControl = "no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

function originAllowed(origin) {
  if (!origin) return true;
  try {
    return TRUSTED_ORIGINS.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

function configureCors(req, res) {
  const origin = String(req.headers?.origin || "").trim();
  if (!origin) return true;
  if (!originAllowed(origin)) return false;
  res.setHeader("Access-Control-Allow-Origin", new URL(origin).origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
  res.setHeader("Vary", "Origin");
  return true;
}

async function iddaaBulletin(req, res) {
  if (!configureCors(req, res)) return send(res, 403, { ok: false, error: "origin_not_allowed" });
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.end();
  }
  if (req.method !== "GET") return send(res, 405, { ok: false, error: "method_not_allowed" });
  const rawEventId = Array.isArray(req.query?.eventId) ? req.query.eventId[0] : req.query?.eventId;
  const eventId = String(rawEventId || "").trim();
  if (eventId && !/^\d{1,12}$/.test(eventId)) {
    return send(res, 400, { ok: false, error: "invalid_event_id" });
  }

  try {
    const data = eventId
      ? await fetchIddaaEventDetail(eventId)
      : await fetchIddaaBulletin({ includeMarkets: false });
    return send(res, 200, { ok: true, ...data }, "public, s-maxage=60, stale-while-revalidate=300");
  } catch (error) {
    const notFound = error?.message === "iddaa_event_not_found";
    return send(res, notFound ? 404 : 502, {
      ok: false,
      error: notFound ? "event_not_found" : "official_bulletin_unavailable",
    });
  }
}

iddaaBulletin.configureCors = configureCors;
iddaaBulletin.originAllowed = originAllowed;

module.exports = iddaaBulletin;

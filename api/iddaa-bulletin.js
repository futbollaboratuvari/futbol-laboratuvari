"use strict";

const {
  fetchIddaaBulletin,
  fetchIddaaEventDetail,
} = require("../scripts/iddaa-data-source");

function send(res, status, payload, cacheControl = "no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

module.exports = async function iddaaBulletin(req, res) {
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
};

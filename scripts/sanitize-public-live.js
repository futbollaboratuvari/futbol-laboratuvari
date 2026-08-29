const fs = require("fs");
const path = require("path");

const PUBLIC_MATCH_FIELDS = [
  "date", "time", "league", "home", "away", "status", "liveStatus",
  "status_verified", "status_source", "minute", "homeScore", "awayScore", "score",
  "source", "matchCode", "available_odds", "odds", "raw_market_guess_odds",
  "raw_odds_sequence", "market_odds_inventory", "wide_market_odds_count", "raw_market_value_count",
];

function publicMatch(item) {
  if (!item || typeof item !== "object") return null;
  const output = {};
  PUBLIC_MATCH_FIELDS.forEach((key) => {
    if (item[key] !== undefined) output[key] = item[key];
  });
  return output;
}

function list(value) {
  return (Array.isArray(value) ? value : []).map(publicMatch).filter(Boolean);
}

function sanitizePublicLive(payload) {
  const counts = payload?.counts || {};
  return {
    generated_at: payload?.generated_at || new Date().toISOString(),
    date: payload?.date || "",
    timezone: payload?.timezone || "Europe/Istanbul",
    source: payload?.source || "Güncel maç akışı",
    title: "Futbol Laboratuvarı Canlı Veri",
    status: payload?.status || "waiting",
    message: payload?.message || "Doğrulanmış maç verisi bekleniyor.",
    status_policy: "provider_verified_only",
    counts: {
      total: Number(counts.total || counts.current_window || 0),
      current_window: Number(counts.current_window || counts.total || 0),
      live: Number(counts.live || 0),
      scheduled: Number(counts.scheduled || 0),
      finished: Number(counts.finished || 0),
      unverified_or_expired: Number(counts.unverified_or_expired || 0),
      active_analysis: 0,
      completed_analysis: 0,
      coupon_candidates: 0,
      watch_candidates: 0,
    },
    next_match: publicMatch(payload?.next_match),
    active_items: [],
    completed_items: [],
    matches: list(payload?.matches),
    scheduled_matches: list(payload?.scheduled_matches),
    live_matches: list(payload?.live_matches),
    finished_matches: list(payload?.finished_matches),
  };
}

function sanitizeFile(inputFile, outputFile = inputFile) {
  const payload = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  const sanitized = sanitizePublicLive(payload);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(sanitized, null, 2)}\n`, "utf8");
  return sanitized;
}

if (require.main === module) {
  const input = process.argv[2] || path.join(__dirname, "..", "data", "live-matches.json");
  const output = process.argv[3] || input;
  sanitizeFile(input, output);
}

module.exports = { PUBLIC_MATCH_FIELDS, publicMatch, sanitizePublicLive, sanitizeFile };

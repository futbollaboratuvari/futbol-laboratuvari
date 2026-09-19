"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "data", "analiz_sonuclari.json");
const OUTPUT = path.join(ROOT, "data", "coupon-assistant-pool.json");
const MAX_ITEMS = 120;

function number(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const match = String(value ?? "").replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function clockInIstanbul(value) {
  const parsed = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(safeDate);
  const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${bag.year}-${bag.month}-${bag.day}`,
    time: `${bag.hour}:${bag.minute}`,
  };
}

function isUpcoming(item, clock) {
  const date = String(item?.date || "").slice(0, 10);
  if (!date) return false;
  if (date > clock.date) return true;
  if (date < clock.date) return false;
  const time = String(item?.time || item?.start_time || "").match(/^\d{2}:\d{2}/)?.[0] || "";
  return !time || time > clock.time;
}

function compactReason(item) {
  return String(
    item?.robot_reason
      || item?.robot_comment
      || item?.commentary
      || "Güncel PRO izleme analizi."
  ).replace(/\s+/g, " ").trim().slice(0, 600);
}

function normalizeCandidate(item, fallbackSource, clock) {
  if (!item || String(item.status || "").toLocaleLowerCase("tr-TR") !== "scheduled") return null;
  if (!isUpcoming(item, clock)) return null;

  const source = String(item.source || fallbackSource || "");
  if (!/iddaa/i.test(source)) return null;

  const matchName = String(
    item.match_name
      || item.match
      || item.title
      || `${item.home || ""} VS ${item.away || ""}`
  ).trim();
  const market = String(item.recommended_market || item.market || item.prediction || "").trim();
  const odds = number(item.estimated_odds);
  const model = number(item.model_score || item.confidence_score || item.analysis_score);
  const completeness = number(item.data_completeness);
  const edge = number(item.edge_percent);

  if (!matchName || !market || odds <= 1 || model < 54 || completeness < 45) return null;

  return {
    match_name: matchName,
    date: String(item.date || "").slice(0, 10),
    time: String(item.time || item.start_time || "").match(/^\d{2}:\d{2}/)?.[0] || "",
    league: String(item.league || ""),
    recommended_market: market,
    estimated_odds: Number(odds.toFixed(2)),
    model_score: Number(model.toFixed(1)),
    edge_percent: Number(edge.toFixed(1)),
    data_completeness: Number(completeness.toFixed(1)),
    estimated_probability: number(item.estimated_probability)
      ? Number(number(item.estimated_probability).toFixed(1))
      : null,
    risk_level: String(item.risk_level || item.risk || "Orta"),
    robot_reason: compactReason(item),
    source,
  };
}

function scoreCandidate(item) {
  return number(item.edge_percent) * 2.2
    + number(item.model_score) * 0.28
    + number(item.data_completeness) * 0.08;
}

function buildPool(analysis, options = {}) {
  const clock = clockInIstanbul(options.now);
  const active = Array.isArray(analysis?.active_items) ? analysis.active_items : [];
  const seen = new Set();
  const items = active
    .map((item) => normalizeCandidate(item, analysis?.source, clock))
    .filter(Boolean)
    .filter((item) => {
      const key = `${item.date}|${item.match_name.toLocaleLowerCase("tr-TR")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => scoreCandidate(b) - scoreCandidate(a)
      || number(b.model_score) - number(a.model_score)
      || number(b.edge_percent) - number(a.edge_percent))
    .slice(0, MAX_ITEMS);

  return {
    generated_at: new Date().toISOString(),
    analysis_generated_at: analysis?.generated_at || null,
    date: clock.date,
    timezone: "Europe/Istanbul",
    source: "Futbol Laboratuvarı PRO manuel kupon aday havuzu",
    candidate_policy: "scheduled + upcoming + official_iddaa_source + real_odds + model>=54 + completeness>=45",
    candidate_count: items.length,
    items,
  };
}

function main() {
  if (!fs.existsSync(INPUT)) throw new Error(`Input bulunamadı: ${INPUT}`);
  const analysis = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  const pool = buildPool(analysis);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(pool, null, 2)}\n`, "utf8");
  console.log(`Kupon Asistanı havuzu: ${pool.candidate_count} aday (${pool.date}).`);
}

module.exports = {
  main,
  buildPool,
  clockInIstanbul,
  isUpcoming,
  normalizeCandidate,
  scoreCandidate,
};

if (require.main === module) {
  main();
}

"use strict";

const fs = require("fs");
const path = require("path");
const { fetchIddaaBulletin, fetchIddaaEventDetail } = require("./iddaa-data-source");
const { scoreFixture, buildBttsAnalysis } = require("./robot-exact-scoring");

const root = path.join(__dirname, "..");
const robotFile = path.join(root, "data", "robot-analysis.json");
const DETAIL_LIMIT = Math.max(10, Math.min(80, Number(process.env.FL_OFFICIAL_DETAIL_LIMIT || 24)));
const DETAIL_CONCURRENCY = Math.max(1, Math.min(6, Number(process.env.FL_OFFICIAL_DETAIL_CONCURRENCY || 4)));
const MIN_ODD = 1.45;
const TARGET = /İlk Yarı KG|İkinci Yarı KG|İY KG\s*\/\s*2Y KG|2\.5 Üst|3\.5 Üst|KG Var|KG Yok|MS 1|MS X|MS 2/i;

const todayTR = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

const clean = (v) => String(v || "")
  .toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

function keyList(item) {
  const code = String(item?.match_code || item?.matchCode || item?.iddaa_event_id || "").trim();
  const date = String(item?.date || "").slice(0, 10);
  const home = String(item?.home || item?.home_team_name || "").trim();
  const away = String(item?.away || item?.away_team_name || "").trim();
  return [
    code ? `code:${code}` : "",
    date && home && away ? `pair:${date}|${clean(home)}|${clean(away)}` : "",
  ].filter(Boolean);
}

function indexMatches(rows) {
  const map = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    for (const key of keyList(row)) map.set(key, row);
  }
  return map;
}

function findMatch(item, map) {
  for (const key of keyList(item)) if (map.has(key)) return map.get(key);
  return null;
}

function current(item) {
  const date = String(item?.date || "").slice(0, 10);
  const status = String(item?.status || "scheduled").toLowerCase();
  return date >= todayTR() && !/^(live|finished|ended|cancelled|canceled|postponed|suspended|abandoned)$/.test(status);
}

function priority(item) {
  const m = item?.metrics || item?.analysis_metrics || {};
  return Number(item?.model_score || item?.analysis_score || 0)
    + (Number(m.firstHalfGoalTrend || 0) >= 55 ? 12 : 0)
    + (Number(m.secondHalfGoalTrend || 0) >= 60 ? 12 : 0)
    + (Number(m.over35Percent || 0) >= 40 ? 10 : 0)
    + (Number(m.bttsPercent || 0) >= 55 ? 8 : 0);
}

function mergeOfficial(base, official, detail = false) {
  if (!official) return { ...base };
  return {
    ...base,
    date: official.date || base.date,
    time: official.time || base.time,
    start_time: official.start_time || base.start_time || base.time,
    league: official.league || base.league,
    home: official.home || base.home,
    away: official.away || base.away,
    match_code: String(official.match_code || official.iddaa_event_id || base.match_code || ""),
    iddaa_event_id: String(official.iddaa_event_id || official.match_code || base.iddaa_event_id || base.match_code || ""),
    available_odds: { ...(base.available_odds || {}), ...(official.available_odds || {}) },
    iddaa_market_count: Number(official.iddaa_market_count || base.iddaa_market_count || 0),
    ...(detail && Array.isArray(official.market_groups) ? { market_groups: official.market_groups } : {}),
    ...(detail && Array.isArray(official.raw_market_blocks) ? { raw_market_blocks: official.raw_market_blocks } : {}),
    official_market_source: official.source || "iddaa.com resmi futbol bülteni",
    official_market_refreshed_at: new Date().toISOString(),
    official_market_detail: Boolean(detail),
  };
}

function safeOptions(scored) {
  const seen = new Set();
  return (Array.isArray(scored?.analysis_options) ? scored.analysis_options : [])
    .filter((row) => {
      const label = String(row?.label || row?.market || "");
      const odd = Number(row?.odd);
      if (!TARGET.test(label) || !Number.isFinite(odd) || odd < MIN_ODD) return false;
      if (String(row?.odd_source_type || "") === "raw_market_guess_odds") return false;
      const key = clean(label);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 16);
}

async function mapLimit(items, limit, worker) {
  const out = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      try { out[index] = await worker(items[index], index); }
      catch (error) { out[index] = { error: String(error?.message || error) }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return out;
}

async function main() {
  const robot = JSON.parse(fs.readFileSync(robotFile, "utf8"));
  const rows = Array.isArray(robot.matches) ? robot.matches : [];
  if (!rows.length) throw new Error("robot-analysis matches boş");

  const bulletin = await fetchIddaaBulletin({ includeMarkets: false });
  const officialMap = indexMatches(bulletin.matches);
  let enriched = rows.map((row) => mergeOfficial(row, findMatch(row, officialMap), false));

  const candidates = enriched
    .map((row, index) => ({ row, index, score: priority(row) }))
    .filter(({ row }) => current(row) && /^\d{1,12}$/.test(String(row.iddaa_event_id || row.match_code || "")))
    .sort((a, b) => b.score - a.score)
    .slice(0, DETAIL_LIMIT);

  let detailSuccess = 0;
  const details = await mapLimit(candidates, DETAIL_CONCURRENCY, async ({ row, index }) => {
    const eventId = String(row.iddaa_event_id || row.match_code);
    const detailPayload = await fetchIddaaEventDetail(eventId);
    const detail = detailPayload?.match || null;
    if (!detail) throw new Error("iddaa_event_detail_match_missing");
    return { index, detail };
  });

  for (const result of details) {
    if (!result || result.error || !result.detail) continue;
    detailSuccess += 1;
    enriched[result.index] = mergeOfficial(enriched[result.index], result.detail, true);
  }

  let optionMatches = 0;
  let optionCount = 0;
  const marketCounts = {};
  enriched = enriched.map((row) => {
    if (!current(row)) return row;
    const scored = scoreFixture(row);
    const options = safeOptions(scored);
    const btts = buildBttsAnalysis(row);
    if (options.length) optionMatches += 1;
    optionCount += options.length;
    for (const option of options) {
      const label = String(option.label || option.market || "");
      marketCounts[label] = (marketCounts[label] || 0) + 1;
    }
    return {
      ...row,
      analysis_options: options,
      btts_analysis: btts,
      official_analysis_refreshed_at: new Date().toISOString(),
    };
  });

  robot.matches = enriched;
  robot.summary = {
    ...(robot.summary || {}),
    official_market_enriched_count: enriched.filter((row) => row.official_market_refreshed_at).length,
    official_detail_checked_count: candidates.length,
    official_detail_success_count: detailSuccess,
    analysis_option_match_count: optionMatches,
    analysis_option_count: optionCount,
    analysis_option_market_counts: marketCounts,
  };
  robot.official_market_enrichment = {
    source: bulletin.source || "iddaa.com resmi futbol bülteni",
    source_url: bulletin.source_url || "https://www.iddaa.com/program/futbol",
    refreshed_at: new Date().toISOString(),
    detail_limit: DETAIL_LIMIT,
    detail_success_count: detailSuccess,
    minimum_odd: MIN_ODD,
    verified_market_only: true,
  };

  fs.writeFileSync(robotFile, `${JSON.stringify(robot, null, 2)}\n`, "utf8");
  console.log(`Official market enrichment OK: details=${detailSuccess}/${candidates.length}, option_matches=${optionMatches}, options=${optionCount}`);
}

if (require.main === module) main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = { current, findMatch, indexMatches, keyList, mergeOfficial, priority, safeOptions };

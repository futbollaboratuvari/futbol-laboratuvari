"use strict";

const fs = require("fs");
const path = require("path");
const { clean, collectCandidates, normalizeCandidate } = require("./robot-specialists/shared");
const { runBttsSpecialist } = require("./robot-specialists/btts-specialist");
const { runGoalsSpecialist } = require("./robot-specialists/goals-specialist");
const { runHtftSpecialist } = require("./robot-specialists/htft-specialist");
const { runMatchResultSpecialist } = require("./robot-specialists/match-result-specialist");

const VERSION = "robot-specialist-orchestrator-v2";
const root = path.join(__dirname, "..");
const robotPath = path.join(root, "data", "robot-analysis.json");
const htftFeedPath = path.join(root, "data", "high-odds-htft.json");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function teamsOf(item) {
  if (item?.home && item?.away) return { home: String(item.home).trim(), away: String(item.away).trim() };
  if (item?.home_team_name && item?.away_team_name) {
    return { home: String(item.home_team_name).trim(), away: String(item.away_team_name).trim() };
  }
  const parts = String(item?.match_name || item?.match || "").split(/\s+(?:vs\.?|v|-)\s+/i);
  return { home: String(parts[0] || "").trim(), away: String(parts[1] || "").trim() };
}

function identityKeys(item) {
  const keys = new Set();
  for (const value of [item?.iddaa_event_id, item?.event_id, item?.match_code, item?.matchCode]) {
    const token = String(value || "").trim();
    if (token) keys.add(`id:${token}`);
  }
  const date = String(item?.date || "").slice(0, 10);
  const { home, away } = teamsOf(item);
  if (date && home && away) keys.add(`teams:${date}|${clean(home)}|${clean(away)}`);
  return keys;
}

function supplementalHtftCandidates(item, feed) {
  if (!feed || !Array.isArray(feed.picks)) return [];
  const itemDate = String(item?.date || "").slice(0, 10);
  const feedDate = String(feed.date || "").slice(0, 10);
  if (itemDate && feedDate && itemDate !== feedDate) return [];

  const itemKeys = identityKeys(item);
  const rows = [];
  for (const pick of feed.picks) {
    if (!pick || pick.odds_verified !== true) continue;
    const market = String(pick.market || "").trim();
    if (!["1/2", "2/1"].includes(market)) continue;
    const pickKeys = identityKeys(pick);
    if (![...pickKeys].some((key) => itemKeys.has(key))) continue;
    const normalized = normalizeCandidate({
      ...pick,
      estimated_probability: pick.estimated_probability ?? pick.scenario_probability,
      model_score: pick.model_score ?? pick.model_confidence,
      analysis_score: pick.analysis_score ?? pick.model_confidence,
      odds: pick.odds ?? pick.bookmaker_odds ?? pick.real_odds,
      independent_evidence: true,
      signals: Array.isArray(pick.signals) && pick.signals.length
        ? pick.signals
        : pick.reason ? [pick.reason] : [],
    }, "verified_high_odds_htft");
    if (normalized) rows.push(normalized);
  }
  return rows;
}

function routeMatch(item, feeds = {}) {
  const baseCandidates = collectCandidates(item);
  const supplementalHtft = supplementalHtftCandidates(item, feeds.htftHighOdds);
  const supplementalMarkets = new Set(supplementalHtft.map((row) => clean(row.market)));
  const candidates = [
    ...supplementalHtft,
    ...baseCandidates.filter((row) => !supplementalMarkets.has(clean(row.market))),
  ];

  const specialistOutputs = {
    btts: runBttsSpecialist(item, candidates),
    goals: runGoalsSpecialist(item, candidates),
    htft: runHtftSpecialist(item, candidates),
    match_result: runMatchResultSpecialist(item, candidates),
  };
  return {
    ...item,
    specialist_outputs: specialistOutputs,
    specialist_router_version: VERSION,
  };
}

function summarize(matches) {
  const summary = {
    match_count: matches.length,
    candidate_count: 0,
    eligible_count: 0,
    specialists: {},
  };
  for (const id of ["btts", "goals", "htft", "match_result"]) {
    let candidates = 0;
    let eligible = 0;
    let readyMatches = 0;
    let supplementalCandidates = 0;
    for (const match of matches) {
      const result = match.specialist_outputs?.[id];
      candidates += Number(result?.candidate_count || 0);
      eligible += Number(result?.eligible_count || 0);
      if (result?.status === "ready") readyMatches += 1;
      supplementalCandidates += (Array.isArray(result?.candidates) ? result.candidates : [])
        .filter((row) => row.specialist_source === "verified_high_odds_htft").length;
    }
    summary.specialists[id] = {
      candidate_count: candidates,
      eligible_count: eligible,
      ready_match_count: readyMatches,
      supplemental_candidate_count: supplementalCandidates,
    };
    summary.candidate_count += candidates;
    summary.eligible_count += eligible;
  }
  return summary;
}

function runOrchestrator(payload, feeds = {}) {
  if (!payload || !Array.isArray(payload.matches)) throw new Error("invalid_robot_analysis");
  const matches = payload.matches.map((item) => routeMatch(item, feeds));
  const htftFeed = feeds.htftHighOdds || null;
  return {
    ...payload,
    matches,
    specialist_orchestrator: {
      version: VERSION,
      generated_at: payload.generated_at || new Date().toISOString(),
      policy: "Ortak veri çekirdeği korunur; marketler ayrı uzman robotlara yönlendirilir; uzman katman ana olasılığı yükseltmez ve bloklanan adayı geri açmaz.",
      feeds: {
        htft_high_odds: {
          status: htftFeed?.status || "unavailable",
          date: htftFeed?.date || null,
          verified_pick_count: Array.isArray(htftFeed?.picks)
            ? htftFeed.picks.filter((pick) => pick?.odds_verified === true).length
            : 0,
        },
      },
      ...summarize(matches),
    },
  };
}

function main() {
  const payload = readJson(robotPath, null);
  const htftHighOdds = readJson(htftFeedPath, null);
  const output = runOrchestrator(payload, { htftHighOdds });
  writeJson(robotPath, output);
  console.log(JSON.stringify(output.specialist_orchestrator));
  return output;
}

if (require.main === module) main();

module.exports = {
  VERSION,
  identityKeys,
  main,
  routeMatch,
  runOrchestrator,
  summarize,
  supplementalHtftCandidates,
};

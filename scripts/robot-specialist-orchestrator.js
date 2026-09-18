"use strict";

const fs = require("fs");
const path = require("path");
const { canonicalMarket } = require("./market-specialist-gates");
const { clean, collectCandidates, normalizeCandidate } = require("./robot-specialists/shared");
const { runBttsSpecialist } = require("./robot-specialists/btts-specialist");
const { runGoalsSpecialist } = require("./robot-specialists/goals-specialist");
const { runHtftSpecialist } = require("./robot-specialists/htft-specialist");
const { runMatchResultSpecialist } = require("./robot-specialists/match-result-specialist");

const VERSION = "robot-specialist-orchestrator-v3";
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

function marketKey(value) {
  return clean(canonicalMarket(
    typeof value === "object"
      ? value?.label || value?.market || value?.recommended_market || value?.selection
      : value
  ));
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

function compactDecision(candidate, specialistRobot) {
  const decision = String(candidate?.specialist_decision || candidate?.market_specialist?.decision || "keep");
  return {
    market: canonicalMarket(candidate?.market || candidate?.recommended_market || ""),
    specialist_robot: specialistRobot,
    decision,
    eligible: candidate?.specialist_eligible !== false && clean(decision) !== "block",
    quality_score: Number.isFinite(Number(candidate?.specialist_quality_score))
      ? Number(candidate.specialist_quality_score)
      : Number.isFinite(Number(candidate?.market_specialist?.quality_score))
        ? Number(candidate.market_specialist.quality_score)
        : null,
    source: String(candidate?.specialist_source || ""),
  };
}

function compactOutput(result) {
  const best = result?.best || null;
  const supplementalCandidateCount = (Array.isArray(result?.candidates) ? result.candidates : [])
    .filter((row) => row?.specialist_source === "verified_high_odds_htft").length;
  return {
    id: result?.id || "",
    label: result?.label || "",
    status: result?.status || "no_candidate",
    candidate_count: Number(result?.candidate_count || 0),
    eligible_count: Number(result?.eligible_count || 0),
    best_market: best?.market || null,
    best_decision: best?.specialist_decision || best?.market_specialist?.decision || null,
    best_quality_score: Number.isFinite(Number(best?.specialist_quality_score))
      ? Number(best.specialist_quality_score)
      : null,
    supplemental_candidate_count: supplementalCandidateCount,
  };
}

function compactPersistedCandidate(candidate) {
  return {
    key: `specialist_${String(candidate?.market || "").replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`,
    label: canonicalMarket(candidate?.market || candidate?.recommended_market || ""),
    market: canonicalMarket(candidate?.market || candidate?.recommended_market || ""),
    odd: candidate?.odds ?? candidate?.estimated_odds ?? null,
    model_score: candidate?.model_score ?? candidate?.analysis_score ?? null,
    analysis_score: candidate?.analysis_score ?? candidate?.model_score ?? null,
    estimated_probability: candidate?.estimated_probability ?? null,
    market_probability: candidate?.market_probability ?? null,
    edge_percent: candidate?.edge_percent ?? null,
    data_completeness: candidate?.data_completeness ?? null,
    independent_evidence: candidate?.independent_evidence !== false,
    risk_level: String(candidate?.risk_level || "Belirsiz"),
    signals: Array.isArray(candidate?.signals) ? candidate.signals.map(String).filter(Boolean).slice(0, 4) : [],
    specialist_source: String(candidate?.specialist_source || ""),
    specialist_robot: String(candidate?.specialist_robot || "htft"),
    specialist_decision: String(candidate?.specialist_decision || "keep"),
    specialist_eligible: candidate?.specialist_eligible !== false,
    specialist_quality_score: Number.isFinite(Number(candidate?.specialist_quality_score))
      ? Number(candidate.specialist_quality_score)
      : null,
  };
}

function annotateOptions(options, decisionMap, supplementalByMarket = new Map()) {
  const rows = [];
  const seen = new Set();

  for (const candidate of supplementalByMarket.values()) {
    const key = marketKey(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    rows.push(compactPersistedCandidate(candidate));
  }

  for (const option of Array.isArray(options) ? options : []) {
    const key = marketKey(option);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const decision = decisionMap.get(key);
    rows.push(decision ? {
      ...option,
      specialist_robot: decision.specialist_robot,
      specialist_source: decision.source || option.specialist_source,
      specialist_decision: decision.decision,
      specialist_eligible: decision.eligible,
      specialist_quality_score: decision.quality_score,
    } : option);
  }

  return rows;
}

function routeMatch(item, feeds = {}) {
  const baseCandidates = collectCandidates(item);
  const supplementalHtft = supplementalHtftCandidates(item, feeds.htftHighOdds);
  const supplementalMarkets = new Set(supplementalHtft.map((row) => marketKey(row)));
  const candidates = [
    ...supplementalHtft,
    ...baseCandidates.filter((row) => !supplementalMarkets.has(marketKey(row))),
  ];

  const detailedOutputs = {
    btts: runBttsSpecialist(item, candidates),
    goals: runGoalsSpecialist(item, candidates),
    htft: runHtftSpecialist(item, candidates),
    match_result: runMatchResultSpecialist(item, candidates),
  };

  const specialistMarketDecisions = [];
  const decisionMap = new Map();
  for (const [specialistId, result] of Object.entries(detailedOutputs)) {
    for (const candidate of Array.isArray(result?.candidates) ? result.candidates : []) {
      const decision = compactDecision(candidate, specialistId);
      const key = marketKey(decision.market);
      if (!key) continue;
      decisionMap.set(key, decision);
      specialistMarketDecisions.push(decision);
    }
  }

  const supplementalEvaluated = new Map(
    (Array.isArray(detailedOutputs.htft?.candidates) ? detailedOutputs.htft.candidates : [])
      .filter((row) => row?.specialist_source === "verified_high_odds_htft")
      .map((row) => [marketKey(row), row])
  );

  return {
    ...item,
    analysis_options: annotateOptions(item?.analysis_options, decisionMap, supplementalEvaluated),
    goal_market_candidates: annotateOptions(item?.goal_market_candidates, decisionMap),
    specialist_outputs: Object.fromEntries(
      Object.entries(detailedOutputs).map(([id, result]) => [id, compactOutput(result)])
    ),
    specialist_market_decisions: specialistMarketDecisions,
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
      supplementalCandidates += Number(result?.supplemental_candidate_count || 0);
      if (result?.status === "ready") readyMatches += 1;
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
      persistence_mode: "compact_decisions_v1",
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
  annotateOptions,
  compactDecision,
  identityKeys,
  main,
  marketKey,
  routeMatch,
  runOrchestrator,
  summarize,
  supplementalHtftCandidates,
};

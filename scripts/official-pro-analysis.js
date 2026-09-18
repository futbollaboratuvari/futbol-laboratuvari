"use strict";

const { fetchIddaaBulletin } = require("./iddaa-data-source");
const { MODEL_VERSION, buildBttsAnalysis, scoreFixture } = require("./robot-exact-scoring");
const { applyLearningWeightsToScoredItem } = require("./apply-learning-weights");
const { compactMatch } = require("./build-pro-analysis-index");
const { applyMatchupContext } = require("./matchup-intelligence");

const CACHE_MS = 90 * 1000;
let cache = null;

const todayTR = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

function currentScheduled(matches, today = todayTR()) {
  return (Array.isArray(matches) ? matches : []).filter((match) => {
    const date = String(match?.date || "").slice(0, 10);
    const status = String(match?.status || "scheduled").toLocaleLowerCase("tr-TR");
    return date >= today && /^(scheduled|not_started|fixture|tbd)$/.test(status);
  });
}

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function teamPair(item) {
  const home = String(item?.home || item?.home_team_name || "").trim();
  const away = String(item?.away || item?.away_team_name || "").trim();
  return { home, away };
}

function joinKeys(item) {
  const code = String(item?.match_code || item?.matchCode || item?.iddaa_event_id || "").trim();
  const date = String(item?.date || "").slice(0, 10);
  const { home, away } = teamPair(item);
  const keys = [];
  if (code) keys.push(`code:${code}`);
  if (date && home && away) keys.push(`pair:${date}|${clean(home)}|${clean(away)}`);
  return keys;
}

function baseMatchMap(base) {
  const map = new Map();
  for (const row of Array.isArray(base?.matches) ? base.matches : []) {
    for (const key of joinKeys(row)) map.set(key, row);
  }
  return map;
}

function findBaseMatch(item, map) {
  for (const key of joinKeys(item)) {
    if (map.has(key)) return map.get(key);
  }
  return null;
}

function riskRank(value) {
  const text = clean(value);
  if (text.includes("yuksek")) return 3;
  if (text.includes("orta") || text.includes("belirsiz") || text.includes("veri yok")) return 2;
  if (text.includes("dusuk")) return 1;
  return 0;
}

function worseRisk(...values) {
  const rank = Math.max(...values.map(riskRank), 0);
  return rank >= 3 ? "Yüksek" : rank >= 2 ? "Orta" : rank === 1 ? "Düşük" : "Yüksek";
}

function applyStoredAnalysisOptions(scored, stored) {
  if (!stored || typeof stored !== "object") return scored;
  const rows = [
    ...(Array.isArray(scored?.analysis_options) ? scored.analysis_options : []),
    ...(Array.isArray(stored?.analysis_options) ? stored.analysis_options : []),
  ];
  const seen = new Set();
  const analysisOptions = rows.filter((row) => {
    const market = clean(row?.market || row?.label || row?.recommended_market);
    if (!market || seen.has(market)) return false;
    seen.add(market);
    return true;
  });
  return {
    ...scored,
    analysis_options: analysisOptions,
    goal_market_candidates: Array.isArray(stored.goal_market_candidates)
      ? stored.goal_market_candidates
      : scored.goal_market_candidates,
    goal_market_pick: stored.goal_market_pick || scored.goal_market_pick,
  };
}

function applyStoredTeamIntelligence(scored, stored) {
  const intel = stored?.team_intelligence;
  if (!intel || typeof intel !== "object") return scored;
  const squadRisk = String(stored.squad_risk_level || intel.squad_risk_level || "Belirsiz");
  const lineupRisk = String(stored.lineup_risk_level || intel.lineup_risk_level || "Belirsiz");
  const storedPenalty = Number(intel.adjustment?.penalty);
  const penalty = Number.isFinite(storedPenalty)
    ? Math.max(0, storedPenalty)
    : riskRank(squadRisk) >= 3 || riskRank(lineupRisk) >= 3 ? 12
      : /belirsiz|veri yok/i.test(`${squadRisk} ${lineupRisk}`) ? 4
        : riskRank(squadRisk) >= 2 || riskRank(lineupRisk) >= 2 ? 6 : 0;
  const originalScore = Number(scored.model_score ?? scored.analysis_score ?? scored.score ?? 0);
  const adjustedScore = Math.max(0, Math.round(originalScore - penalty));
  const note = penalty
    ? `Resmî bülten skoru doğrulanmış kadro/ilk 11 riski nedeniyle ${penalty} puan aşağı ayarlandı.`
    : "Resmî bülten skoru doğrulanmış kadro/ilk 11 katmanıyla kontrol edildi.";
  const enriched = {
    ...scored,
    score: adjustedScore,
    model_score: adjustedScore,
    analysis_score: adjustedScore,
    confidence: `${adjustedScore}%`,
    trust_score: `${adjustedScore}/100`,
    risk: worseRisk(scored.risk || scored.risk_level, squadRisk, lineupRisk),
    risk_level: worseRisk(scored.risk || scored.risk_level, squadRisk, lineupRisk),
    squad_risk_level: squadRisk,
    lineup_risk_level: lineupRisk,
    team_status_verified_count: Number(stored.team_status_verified_count || intel.squad_verified_team_count || 0),
    named_player_count: Number(stored.named_player_count || intel.named_player_count || 0),
    team_intelligence: {
      ...intel,
      official_adjustment: {
        original_model_score: originalScore,
        penalty,
        adjusted_model_score: adjustedScore,
        reason: note,
      },
    },
    signals: [note, ...(Array.isArray(scored.signals) ? scored.signals : [])].slice(0, 8),
    pro_signals: [note, ...(Array.isArray(scored.pro_signals) ? scored.pro_signals : [])].slice(0, 8),
  };
  return applyMatchupContext(enriched, intel.matchup_analysis);
}

function projectOfficialProIndex(bulletin, base = {}, options = {}) {
  const storedMatches = baseMatchMap(base);
  const matches = currentScheduled(bulletin?.matches, options.today || todayTR()).map((match) => {
    let scored = applyLearningWeightsToScoredItem(scoreFixture(match));
    scored.btts_analysis = buildBttsAnalysis(match);
    const stored = findBaseMatch(match, storedMatches);
    scored = applyStoredTeamIntelligence(scored, stored);
    scored = applyStoredAnalysisOptions(scored, stored);
    return compactMatch(scored, { model_version: MODEL_VERSION, date: scored.date });
  });
  const bttsRows = matches.filter((match) => match.btts_analysis?.pair_complete);
  const bttsOpinions = bttsRows.filter((match) => match.btts_analysis.recommended_key);
  const kgVar = bttsOpinions.filter((match) => match.btts_analysis.recommended_key === "bttsYes").length;
  const kgYok = bttsOpinions.filter((match) => match.btts_analysis.recommended_key === "bttsNo").length;
  const proReady = matches.filter((match) => match.model_score >= 60
    && match.data_completeness >= 35
    && !/değerli market yok|degerli market yok|oynama/i.test(match.recommended_market));

  return {
    ...base,
    schema_version: 2,
    generated_at: bulletin?.generated_at || new Date().toISOString(),
    date: options.today || todayTR(),
    timezone: "Europe/Istanbul",
    engine: "Futbol Laboratuvarı PRO 13 · Resmi İddaa KG",
    model_version: MODEL_VERSION,
    score_semantics: "model_score is signal strength from 0 to 100; it is not an outcome probability",
    source: bulletin?.source || "iddaa.com resmi futbol bülteni",
    source_url: bulletin?.source_url || "https://www.iddaa.com/program/futbol",
    official_feed: true,
    summary: {
      match_count: matches.length,
      source_match_count: Number(bulletin?.match_count ?? bulletin?.matches?.length ?? 0),
      pro_ready_count: proReady.length,
      coupon_candidate_count: matches.filter((match) => match.include_in_coupon).length,
      matchup_verified_count: matches.filter((match) => Number(match.team_intelligence?.matchup_analysis?.coverage_score || 0) >= 65).length,
      average_data_completeness: matches.length
        ? Math.round(matches.reduce((sum, match) => sum + Number(match.data_completeness || 0), 0) / matches.length) : 0,
      btts_pair_count: bttsRows.length,
      btts_opinion_count: bttsOpinions.length,
      kg_var_opinion_count: kgVar,
      kg_yok_opinion_count: kgYok,
    },
    matches,
  };
}

async function buildOfficialProIndex(base = {}, options = {}) {
  const now = Date.now();
  if (!options.force && cache && now < cache.expiresAt) return cache.value;
  const bulletin = await (options.fetchBulletin || fetchIddaaBulletin)({ includeMarkets: false });
  const value = projectOfficialProIndex(bulletin, base, options);
  cache = { expiresAt: now + CACHE_MS, value };
  return value;
}

function resetOfficialProCache() {
  cache = null;
}

module.exports = {
  applyStoredAnalysisOptions,
  applyStoredTeamIntelligence,
  baseMatchMap,
  buildOfficialProIndex,
  currentScheduled,
  projectOfficialProIndex,
  resetOfficialProCache,
};
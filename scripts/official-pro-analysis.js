"use strict";

const { fetchIddaaBulletin } = require("./iddaa-data-source");
const { MODEL_VERSION, buildBttsAnalysis, buildSpecialMarketAnalysis, scoreFixture } = require("./robot-exact-scoring");
const { applyLearningWeightsToScoredItem } = require("./apply-learning-weights");
const { applyTeamIntelligence } = require("./export-high-value-json");
const { compactMatch, teamsOf } = require("./build-pro-analysis-index");
const couponRules = require("../pro-coupon-eligibility");

const CACHE_MS = 90 * 1000;
const MAX_STORED_EVIDENCE_AGE_MS = 18 * 60 * 60 * 1000;
let cache = null;

const todayTR = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const clean = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const matchKeys = (match) => {
  const teams = teamsOf(match || {});
  const code = String(match?.iddaa_event_id || match?.match_code || match?.matchCode || match?.event_id || "").trim();
  const date = String(match?.date || match?.tarih || "").slice(0, 10);
  const pair = `${clean(teams.home)}|${clean(teams.away)}`;
  return [
    code ? `code:${code}` : "",
    date && pair !== "|" ? `date:${date}|${pair}` : "",
  ].filter(Boolean);
};

function storedEvidenceStatus(base, now = Date.now()) {
  const generated = Date.parse(String(base?.generated_at || ""));
  if (!Number.isFinite(generated)) return "missing_timestamp";
  const age = now - generated;
  return age >= -5 * 60 * 1000 && age <= MAX_STORED_EVIDENCE_AGE_MS ? "fresh" : "stale";
}

function buildStoredMatchLookup(base, now = Date.now()) {
  if (storedEvidenceStatus(base, now) !== "fresh") return new Map();
  const lookup = new Map();
  for (const match of Array.isArray(base?.matches) ? base.matches : []) {
    for (const key of matchKeys(match)) if (!lookup.has(key)) lookup.set(key, match);
  }
  return lookup;
}

function storedMatchFor(match, lookup) {
  for (const key of matchKeys(match)) {
    const found = lookup.get(key);
    if (found) return found;
  }
  return null;
}

function mergeStoredEvidence(match, stored) {
  if (!stored) return match;
  const metrics = stored.metrics && typeof stored.metrics === "object" ? stored.metrics : {};
  return {
    ...metrics,
    ...match,
    metric_quality: match.metric_quality || metrics.metric_quality || "",
    squad_risk_level: stored.squad_risk_level || "Belirsiz",
    lineup_risk_level: stored.lineup_risk_level || "Belirsiz",
    team_status_verified_count: Number(stored.team_status_verified_count || stored.team_intelligence?.verified_team_count || 0),
    named_player_count: Number(stored.named_player_count || stored.team_intelligence?.named_player_count || 0),
    team_intelligence: stored.team_intelligence || null,
  };
}

function bandRecordForStored(stored) {
  const intel = stored?.team_intelligence || {};
  const squadRisk = String(stored?.squad_risk_level || intel.squad_risk_level || "Belirsiz");
  const lineupRisk = String(stored?.lineup_risk_level || intel.lineup_risk_level || "Belirsiz");
  const level = /yüksek|yuksek|high/i.test(`${squadRisk} ${lineupRisk}`) ? "Yüksek"
    : /orta|belirsiz|veri yok/i.test(`${squadRisk} ${lineupRisk}`) ? "Orta" : "Düşük";
  return {
    band_check: { level, notes: [] },
    extra_used: {
      ...intel,
      squad_risk_level: squadRisk,
      lineup_risk_level: lineupRisk,
      squad_verified_team_count: Number(stored?.team_status_verified_count || intel.verified_team_count || 0),
      named_player_count: Number(stored?.named_player_count || intel.named_player_count || 0),
    },
  };
}

function adjustBttsForTeamRisk(analysis, scored) {
  if (!analysis?.available) return analysis;
  const adjustment = scored?.team_intelligence?.adjustment || {};
  const penalty = Math.max(0, Number(adjustment.penalty || 0));
  const highRisk = /yüksek|yuksek|high/i.test(`${scored?.squad_risk_level || ""} ${scored?.lineup_risk_level || ""}`);
  const reason = String(adjustment.reason || "Kadro/ilk 11 doğrulaması sonuç riskine uygulandı.");
  const outcomes = {};
  for (const key of ["bttsYes", "bttsNo"]) {
    const outcome = analysis.outcomes?.[key];
    if (!outcome) {
      outcomes[key] = null;
      continue;
    }
    outcomes[key] = {
      ...outcome,
      model_score: Math.max(0, Math.round(Number(outcome.model_score || 0) - penalty)),
      data_completeness: Math.max(0, Math.round(Number(outcome.data_completeness || 0))),
      risk_level: highRisk ? "Yüksek" : outcome.risk_level === "Düşük" && penalty > 0 ? "Orta" : outcome.risk_level,
      signals: penalty > 0 ? [reason, ...(outcome.signals || [])].slice(0, 7) : outcome.signals,
    };
  }
  const ranked = Object.values(outcomes).filter(Boolean).sort((a, b) =>
    Number(b.estimated_probability || 0) - Number(a.estimated_probability || 0)
      || Number(b.model_score || 0) - Number(a.model_score || 0));
  const strongest = ranked[0] || null;
  const recommendation = analysis.pair_complete && analysis.trusted_odds
    && Number(strongest?.estimated_probability || 0) >= 54
    && Number(strongest?.data_completeness || 0) >= 35 ? strongest : null;
  return {
    ...analysis,
    recommended_key: recommendation?.key || "",
    recommended_market: recommendation?.label || "Görüş oluşmadı",
    recommendation_status: recommendation
      ? (recommendation.independent_evidence ? "model_analysis" : "market_baseline") : "insufficient_data",
    team_risk_adjusted: penalty > 0,
    outcomes,
  };
}

function adjustSpecialForTeamRisk(analysis, scored) {
  if (!analysis?.available) return analysis;
  const adjustment = scored?.team_intelligence?.adjustment || {};
  const penalty = Math.max(0, Number(adjustment.penalty || 0));
  const highRisk = /yüksek|yuksek|high/i.test(`${scored?.squad_risk_level || ""} ${scored?.lineup_risk_level || ""}`);
  const reason = String(adjustment.reason || "Kadro/ilk 11 doğrulaması özel market riskine uygulandı.");
  const outcomes = {};
  for (const [key, outcome] of Object.entries(analysis.outcomes || {})) {
    const modelScore = Math.max(0, Math.round(Number(outcome.model_score || 0) - penalty));
    outcomes[key] = {
      ...outcome,
      model_score: modelScore,
      recommendation_status: outcome.recommendation_status === "model_analysis" && modelScore < 50 ? "watch" : outcome.recommendation_status,
      risk_level: highRisk ? "Yüksek" : outcome.risk_level === "Düşük" && penalty > 0 ? "Orta" : outcome.risk_level,
      signals: penalty > 0 ? [reason, ...(outcome.signals || [])].slice(0, 7) : outcome.signals,
    };
  }
  return {
    ...analysis,
    opinion_count: Object.keys(outcomes).length,
    model_analysis_count: Object.values(outcomes).filter((outcome) => outcome.recommendation_status === "model_analysis").length,
    team_risk_adjusted: penalty > 0,
    outcomes,
  };
}

function currentScheduled(matches, today = todayTR()) {
  return (Array.isArray(matches) ? matches : []).filter((match) => {
    const date = String(match?.date || "").slice(0, 10);
    const status = String(match?.status || "scheduled").toLocaleLowerCase("tr-TR");
    return date >= today && /^(scheduled|not_started|fixture|tbd)$/.test(status);
  });
}

function projectOfficialProIndex(bulletin, base = {}, options = {}) {
  const now = options.now instanceof Date ? options.now.getTime() : Number(options.now || Date.now());
  const evidenceStatus = storedEvidenceStatus(base, now);
  const storedLookup = buildStoredMatchLookup(base, now);
  const matches = currentScheduled(bulletin?.matches, options.today || todayTR()).map((match) => {
    const stored = storedMatchFor(match, storedLookup);
    const enriched = mergeStoredEvidence(match, stored);
    let scored = applyLearningWeightsToScoredItem(scoreFixture(enriched));
    scored = applyTeamIntelligence(scored, bandRecordForStored(stored));
    scored.include_in_coupon = Boolean(scored.hasOdds && couponRules.meetsCouponCriteria({
      ...scored,
      recommended_market: scored.selection || scored.market || "-",
      risk_level: scored.risk || "Yüksek",
    }));
    scored.btts_analysis = adjustBttsForTeamRisk(buildBttsAnalysis(enriched), scored);
    scored.special_market_analysis = adjustSpecialForTeamRisk(buildSpecialMarketAnalysis(enriched), scored);
    return compactMatch(scored, { model_version: MODEL_VERSION, date: scored.date });
  });
  const bttsRows = matches.filter((match) => match.btts_analysis?.pair_complete);
  const bttsOpinions = bttsRows.filter((match) => match.btts_analysis.recommended_key);
  const kgVar = bttsOpinions.filter((match) => match.btts_analysis.recommended_key === "bttsYes").length;
  const kgYok = bttsOpinions.filter((match) => match.btts_analysis.recommended_key === "bttsNo").length;
  const specialRows = matches.filter((match) => match.special_market_analysis?.available);
  const specialOutcomes = specialRows.flatMap((match) => Object.entries(match.special_market_analysis.outcomes || {}));
  const proReady = matches.filter((match) => match.model_score >= 60
    && match.data_completeness >= 35
    && !/değerli market yok|degerli market yok|oynama/i.test(match.recommended_market));

  return {
    ...base,
    schema_version: 4,
    generated_at: bulletin?.generated_at || new Date().toISOString(),
    date: options.today || todayTR(),
    timezone: "Europe/Istanbul",
    engine: "Futbol Laboratuvarı PRO 13.5 · Resmi İddaa + Yarı Poisson + Kadro",
    model_version: MODEL_VERSION,
    score_semantics: "model_score is signal strength from 0 to 100; it is not an outcome probability",
    source: bulletin?.source || "iddaa.com resmi futbol bülteni",
    source_url: bulletin?.source_url || "https://www.iddaa.com/program/futbol",
    official_feed: true,
    stored_evidence_status: evidenceStatus,
    summary: {
      match_count: matches.length,
      source_match_count: Number(bulletin?.match_count ?? bulletin?.matches?.length ?? 0),
      pro_ready_count: proReady.length,
      coupon_candidate_count: matches.filter((match) => match.include_in_coupon).length,
      average_data_completeness: matches.length
        ? Math.round(matches.reduce((sum, match) => sum + Number(match.data_completeness || 0), 0) / matches.length) : 0,
      btts_pair_count: bttsRows.length,
      btts_opinion_count: bttsOpinions.length,
      kg_var_opinion_count: kgVar,
      kg_yok_opinion_count: kgYok,
      special_market_match_count: specialRows.length,
      special_market_opinion_count: specialOutcomes.length,
      half_btts_opinion_count: specialOutcomes.filter(([key]) => /HalfBtts/.test(key)).length,
      htft_opinion_count: specialOutcomes.filter(([key]) => /^htft/.test(key)).length,
      team_intelligence_match_count: matches.filter((match) => match.team_intelligence).length,
      verified_squad_match_count: matches.filter((match) => Number(match.team_status_verified_count || 0) > 0).length,
      named_player_match_count: matches.filter((match) => Number(match.named_player_count || 0) > 0).length,
    },
    matches,
  };
}

async function buildOfficialProIndex(base = {}, options = {}) {
  const now = Date.now();
  if (!options.force && cache && now < cache.expiresAt) return cache.value;
  const bulletin = await (options.fetchBulletin || fetchIddaaBulletin)({ includeMarkets: false });
  if (!Array.isArray(bulletin?.matches) || bulletin.matches.length === 0) {
    const error = new Error("official_bulletin_empty");
    error.code = "official_bulletin_empty";
    throw error;
  }
  const value = projectOfficialProIndex(bulletin, base, options);
  cache = { expiresAt: now + CACHE_MS, value };
  return value;
}

function resetOfficialProCache() {
  cache = null;
}

module.exports = {
  adjustBttsForTeamRisk,
  adjustSpecialForTeamRisk,
  bandRecordForStored,
  buildStoredMatchLookup,
  buildOfficialProIndex,
  currentScheduled,
  matchKeys,
  mergeStoredEvidence,
  projectOfficialProIndex,
  resetOfficialProCache,
  storedEvidenceStatus,
  storedMatchFor,
};

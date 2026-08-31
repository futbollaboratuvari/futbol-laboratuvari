"use strict";

const { fetchIddaaBulletin } = require("./iddaa-data-source");
const { MODEL_VERSION, buildBttsAnalysis, scoreFixture } = require("./robot-exact-scoring");
const { compactMatch } = require("./build-pro-analysis-index");

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

function projectOfficialProIndex(bulletin, base = {}, options = {}) {
  const matches = currentScheduled(bulletin?.matches, options.today || todayTR()).map((match) => {
    const scored = scoreFixture(match);
    scored.btts_analysis = buildBttsAnalysis(match);
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
  buildOfficialProIndex,
  currentScheduled,
  projectOfficialProIndex,
  resetOfficialProCache,
};

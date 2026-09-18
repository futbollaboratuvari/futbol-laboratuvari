"use strict";

const { canonicalMarket } = require("../market-specialist-gates");

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+/.]+/g, " ")
    .trim();
}

function finite(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function familyForMarket(value) {
  const market = canonicalMarket(value);
  const key = clean(market);
  if (/kg|btts|karsilikli gol/.test(key)) return "btts";
  if (/2[,.]?5|3[,.]?5|6\s*\+|gol/.test(key) && !/^ms /.test(key)) return "goals";
  if (/^(1|x|2)\/(1|x|2)$/.test(key)) return "htft";
  if (/^ms\s+(1|x|2)$/.test(key)) return "match_result";
  return "other";
}

function normalizeCandidate(candidate, source = "analysis_options") {
  if (!candidate || typeof candidate !== "object") return null;
  if (String(candidate.odd_source_type || "") === "raw_market_guess_odds") return null;
  const market = canonicalMarket(candidate.label || candidate.market || candidate.recommended_market || candidate.selection);
  if (!market) return null;
  return {
    ...candidate,
    market,
    recommended_market: market,
    odds: candidate.odds ?? candidate.odd ?? candidate.estimated_odds ?? candidate.bookmaker_odds ?? candidate.recommended_odd ?? null,
    estimated_odds: candidate.estimated_odds ?? candidate.odds ?? candidate.odd ?? candidate.bookmaker_odds ?? candidate.recommended_odd ?? null,
    model_score: finite(candidate.model_score ?? candidate.analysis_score ?? candidate.confidence_score ?? candidate.model_confidence),
    analysis_score: finite(candidate.analysis_score ?? candidate.model_score ?? candidate.confidence_score ?? candidate.model_confidence),
    estimated_probability: finite(candidate.estimated_probability ?? candidate.scenario_probability),
    market_probability: finite(candidate.market_probability ?? candidate.implied_probability),
    data_completeness: finite(candidate.data_completeness),
    specialist_source: source,
  };
}

function collectCandidates(item) {
  const rows = [];
  for (const option of Array.isArray(item?.analysis_options) ? item.analysis_options : []) {
    const normalized = normalizeCandidate(option, "analysis_options");
    if (normalized) rows.push(normalized);
  }
  for (const option of Array.isArray(item?.goal_market_candidates) ? item.goal_market_candidates : []) {
    const normalized = normalizeCandidate(option, "goal_market_candidates");
    if (normalized) rows.push(normalized);
  }
  const primary = normalizeCandidate({
    market: item?.recommended_market || item?.market || item?.selection,
    odds: item?.recommended_odd ?? item?.estimated_odds ?? item?.odds,
    model_score: item?.model_score ?? item?.analysis_score ?? item?.confidence_score,
    analysis_score: item?.analysis_score ?? item?.model_score ?? item?.confidence_score,
    estimated_probability: item?.estimated_probability,
    market_probability: item?.market_probability,
    edge_percent: item?.edge_percent,
    data_completeness: item?.data_completeness,
    risk_level: item?.risk_level || item?.risk,
    independent_evidence: item?.independent_evidence,
    include_in_coupon: item?.include_in_coupon,
    signals: item?.signals || item?.pro_signals,
  }, "primary");
  if (primary) rows.push(primary);

  const seen = new Set();
  return rows.filter((row) => {
    const key = clean(row.market);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function decisionRank(value) {
  const key = clean(value);
  if (key === "block") return 2;
  if (key === "downgrade") return 1;
  return 0;
}

function sortCandidates(rows) {
  return [...rows].sort((a, b) =>
    decisionRank(a.specialist_decision || a.market_specialist?.decision)
      - decisionRank(b.specialist_decision || b.market_specialist?.decision)
    || Number(b.specialist_quality_score ?? b.market_specialist?.quality_score ?? 0)
      - Number(a.specialist_quality_score ?? a.market_specialist?.quality_score ?? 0)
    || Number(b.model_score || 0) - Number(a.model_score || 0)
    || Number(b.estimated_probability || 0) - Number(a.estimated_probability || 0));
}

function resultEnvelope(id, label, rows) {
  const candidates = sortCandidates(rows);
  const eligible = candidates.filter((row) =>
    row.specialist_eligible !== false
    && clean(row.specialist_decision || row.market_specialist?.decision || "keep") !== "block");
  return {
    id,
    label,
    status: candidates.length ? (eligible.length ? "ready" : "blocked") : "no_candidate",
    candidate_count: candidates.length,
    eligible_count: eligible.length,
    best: eligible[0] || null,
    candidates,
  };
}

module.exports = {
  clean,
  finite,
  familyForMarket,
  normalizeCandidate,
  collectCandidates,
  resultEnvelope,
  sortCandidates,
};

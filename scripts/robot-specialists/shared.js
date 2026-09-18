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
    market,
    recommended_market: market,
    odds: candidate.odds ?? candidate.odd ?? candidate.estimated_odds ?? candidate.bookmaker_odds ?? candidate.recommended_odd ?? null,
    estimated_odds: candidate.estimated_odds ?? candidate.odds ?? candidate.odd ?? candidate.bookmaker_odds ?? candidate.recommended_odd ?? null,
    model_score: finite(candidate.model_score ?? candidate.analysis_score ?? candidate.confidence_score ?? candidate.model_confidence),
    analysis_score: finite(candidate.analysis_score ?? candidate.model_score ?? candidate.confidence_score ?? candidate.model_confidence),
    estimated_probability: finite(candidate.estimated_probability ?? candidate.scenario_probability),
    market_probability: finite(candidate.market_probability ?? candidate.implied_probability),
    edge_percent: finite(candidate.edge_percent),
    data_completeness: finite(candidate.data_completeness),
    independent_evidence: candidate.independent_evidence !== false,
    include_in_coupon: Boolean(candidate.include_in_coupon),
    risk_level: String(candidate.risk_level || candidate.risk || "Belirsiz"),
    signals: Array.isArray(candidate.signals) ? candidate.signals.map(String).filter(Boolean).slice(0, 5) : [],
    specialist_source: source,
    first_half_signal_source: candidate.first_half_signal_source,
    first_half_signal_verified: candidate.first_half_signal_verified === true,
    openness_score: finite(candidate.openness_score),
    scenario_probability: finite(candidate.scenario_probability),
    bookmaker_odds: finite(candidate.bookmaker_odds),
    first_half_direction_probability: finite(candidate.first_half_direction_probability),
    full_time_direction_probability: finite(candidate.full_time_direction_probability),
    identity_match_score: finite(candidate.identity_match_score),
    identity_match_source: candidate.identity_match_source,
    odds_verified: candidate.odds_verified === true,
    market_specialist: candidate.market_specialist || null,
    specialist_decision: candidate.specialist_decision,
    specialist_eligible: candidate.specialist_eligible,
    specialist_quality_score: finite(candidate.specialist_quality_score),
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

function compactSpecialistCandidate(candidate, evaluated, specialistRobot) {
  const specialist = evaluated?.market_specialist || candidate.market_specialist || null;
  const decision = String(
    evaluated?.specialist_decision
      || candidate.specialist_decision
      || specialist?.decision
      || "keep"
  );
  const eligible = evaluated?.specialist_eligible !== undefined
    ? evaluated.specialist_eligible !== false
    : candidate.specialist_eligible !== false && clean(decision) !== "block";
  return {
    market: canonicalMarket(evaluated?.market || evaluated?.recommended_market || candidate.market),
    odds: finite(evaluated?.odds ?? evaluated?.estimated_odds ?? candidate.odds ?? candidate.estimated_odds),
    model_score: finite(evaluated?.model_score ?? evaluated?.analysis_score ?? candidate.model_score),
    analysis_score: finite(evaluated?.analysis_score ?? evaluated?.model_score ?? candidate.analysis_score),
    estimated_probability: finite(evaluated?.estimated_probability ?? candidate.estimated_probability),
    market_probability: finite(evaluated?.market_probability ?? candidate.market_probability),
    edge_percent: finite(evaluated?.edge_percent ?? candidate.edge_percent),
    data_completeness: finite(evaluated?.data_completeness ?? candidate.data_completeness),
    independent_evidence: evaluated?.independent_evidence !== false && candidate.independent_evidence !== false,
    include_in_coupon: Boolean(evaluated?.include_in_coupon ?? candidate.include_in_coupon),
    risk_level: String(evaluated?.risk_level || evaluated?.risk || candidate.risk_level || "Belirsiz"),
    signals: (Array.isArray(evaluated?.signals) && evaluated.signals.length
      ? evaluated.signals
      : Array.isArray(candidate.signals) ? candidate.signals : []).map(String).filter(Boolean).slice(0, 5),
    specialist_source: candidate.specialist_source,
    specialist_robot: specialistRobot,
    specialist_decision: decision,
    specialist_eligible: eligible,
    specialist_quality_score: finite(
      evaluated?.specialist_quality_score
      ?? candidate.specialist_quality_score
      ?? specialist?.quality_score
    ),
    market_specialist: specialist,
  };
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
  compactSpecialistCandidate,
  finite,
  familyForMarket,
  normalizeCandidate,
  collectCandidates,
  resultEnvelope,
  sortCandidates,
};

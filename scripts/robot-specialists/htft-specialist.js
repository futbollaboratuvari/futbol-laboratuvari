"use strict";

const { canonicalMarket, htftAdjustment } = require("../market-specialist-gates");
const { familyForMarket, finite, resultEnvelope } = require("./shared");

function runHtftSpecialist(item, candidates) {
  const rows = candidates
    .filter((candidate) => familyForMarket(candidate.market) === "htft")
    .map((candidate) => {
      const market = canonicalMarket(candidate.market);
      if (!["1/2", "2/1"].includes(market)) {
        return {
          ...candidate,
          specialist_robot: "htft",
          specialist_decision: "keep",
          specialist_eligible: true,
          specialist_quality_score: null,
          market_specialist: {
            version: "market-specialist-gates-v4",
            market,
            decision: "keep",
            eligible: true,
            mode: "htft_standard_route",
            reasons: ["İY/MS seçimi ayrı uzman robota yönlendirildi; mevcut ana model olasılığı değiştirilmedi."],
          },
        };
      }

      const adjustment = htftAdjustment({
        market,
        firstHalfSource: candidate.first_half_signal_source,
        firstHalfVerified: candidate.first_half_signal_verified === true,
        openness: finite(candidate.openness_score),
        dataCompleteness: candidate.data_completeness,
        scenarioProbability: candidate.scenario_probability ?? candidate.estimated_probability,
        bookmakerOdds: candidate.bookmaker_odds ?? candidate.odds,
        firstHalfDirectionProbability: candidate.first_half_direction_probability,
        fullTimeDirectionProbability: candidate.full_time_direction_probability,
        identityScore: candidate.identity_match_score,
        identitySource: candidate.identity_match_source,
        oddsVerified: candidate.odds_verified === true,
        preMatchDecision: item?.pre_match_final_check?.effective_decision || item?.pre_match_final_check?.decision,
        sourceConflict: item?.source_consensus?.conflict_level || item?.source_conflict_level,
        lineupRisk: item?.lineup_risk_level || item?.team_intelligence?.lineup_risk_level,
        squadRisk: item?.squad_risk_level || item?.team_intelligence?.squad_risk_level,
      });
      return {
        ...candidate,
        specialist_robot: "htft",
        specialist_decision: adjustment.decision,
        specialist_eligible: adjustment.eligible,
        specialist_quality_score: adjustment.quality_score,
        market_specialist: adjustment,
      };
    });
  return resultEnvelope("htft", "İY/MS Uzmanı", rows);
}

module.exports = { runHtftSpecialist };

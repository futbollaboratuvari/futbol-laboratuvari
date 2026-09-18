"use strict";

const { applyGenericMarketGate, canonicalMarket } = require("../market-specialist-gates");
const { specializeCompactGoalCandidate } = require("../pro-market-specialist-postprocess");
const { familyForMarket, resultEnvelope } = require("./shared");

function runGoalsSpecialist(item, candidates) {
  const rows = candidates
    .filter((candidate) => familyForMarket(candidate.market) === "goals")
    .map((candidate) => {
      const market = canonicalMarket(candidate.market);
      if (market === "3.5 Üst" || market === "6+ Gol") {
        const evaluated = specializeCompactGoalCandidate(candidate, item);
        return {
          ...candidate,
          ...evaluated,
          specialist_robot: "goals",
          specialist_decision: evaluated?.specialist_decision || evaluated?.market_specialist?.decision || "keep",
          specialist_eligible: evaluated?.specialist_eligible !== false,
          specialist_quality_score: evaluated?.specialist_quality_score ?? evaluated?.market_specialist?.quality_score ?? null,
        };
      }
      const evaluated = applyGenericMarketGate({
        ...item,
        ...candidate,
        selection: market,
        market,
        recommended_market: market,
      });
      return {
        ...candidate,
        ...evaluated,
        specialist_robot: "goals",
        specialist_decision: evaluated.market_specialist?.decision || "keep",
        specialist_eligible: evaluated.market_specialist?.decision !== "block",
        specialist_quality_score: evaluated.market_specialist?.quality_score ?? null,
      };
    });
  return resultEnvelope("goals", "Gol Uzmanı", rows);
}

module.exports = { runGoalsSpecialist };

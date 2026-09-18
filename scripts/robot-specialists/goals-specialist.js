"use strict";

const { applyGenericMarketGate, canonicalMarket } = require("../market-specialist-gates");
const { specializeCompactGoalCandidate } = require("../pro-market-specialist-postprocess");
const { compactSpecialistCandidate, familyForMarket, resultEnvelope } = require("./shared");

function runGoalsSpecialist(item, candidates) {
  const rows = candidates
    .filter((candidate) => familyForMarket(candidate.market) === "goals")
    .map((candidate) => {
      const market = canonicalMarket(candidate.market);
      if (market === "3.5 Üst" || market === "6+ Gol") {
        const evaluated = specializeCompactGoalCandidate(candidate, item);
        return compactSpecialistCandidate(candidate, evaluated, "goals");
      }
      const evaluated = applyGenericMarketGate({
        ...item,
        ...candidate,
        selection: market,
        market,
        recommended_market: market,
      });
      return compactSpecialistCandidate(candidate, evaluated, "goals");
    });
  return resultEnvelope("goals", "Gol Uzmanı", rows);
}

module.exports = { runGoalsSpecialist };

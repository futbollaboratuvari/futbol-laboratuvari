"use strict";

const { applyGenericMarketGate } = require("../market-specialist-gates");
const { familyForMarket, resultEnvelope } = require("./shared");

function runMatchResultSpecialist(item, candidates) {
  const rows = candidates
    .filter((candidate) => familyForMarket(candidate.market) === "match_result")
    .map((candidate) => {
      const evaluated = applyGenericMarketGate({
        ...item,
        ...candidate,
        selection: candidate.market,
        market: candidate.market,
        recommended_market: candidate.market,
      });
      return {
        ...candidate,
        ...evaluated,
        specialist_robot: "match_result",
        specialist_decision: evaluated.market_specialist?.decision || "keep",
        specialist_eligible: evaluated.market_specialist?.decision !== "block",
        specialist_quality_score: evaluated.market_specialist?.quality_score ?? null,
      };
    });
  return resultEnvelope("match_result", "Taraf Uzmanı", rows);
}

module.exports = { runMatchResultSpecialist };

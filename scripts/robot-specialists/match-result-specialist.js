"use strict";

const { applyGenericMarketGate } = require("../market-specialist-gates");
const { compactSpecialistCandidate, familyForMarket, resultEnvelope } = require("./shared");

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
      return compactSpecialistCandidate(candidate, evaluated, "match_result");
    });
  return resultEnvelope("match_result", "Taraf Uzmanı", rows);
}

module.exports = { runMatchResultSpecialist };

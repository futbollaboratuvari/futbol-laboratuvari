"use strict";

const { applyGenericMarketGate } = require("../market-specialist-gates");
const { compactSpecialistCandidate, familyForMarket, resultEnvelope } = require("./shared");

function runBttsSpecialist(item, candidates) {
  const rows = candidates
    .filter((candidate) => familyForMarket(candidate.market) === "btts")
    .map((candidate) => {
      const evaluated = applyGenericMarketGate({
        ...item,
        ...candidate,
        selection: candidate.market,
        market: candidate.market,
        recommended_market: candidate.market,
      });
      return compactSpecialistCandidate(candidate, evaluated, "btts");
    });
  return resultEnvelope("btts", "KG Uzmanı", rows);
}

module.exports = { runBttsSpecialist };

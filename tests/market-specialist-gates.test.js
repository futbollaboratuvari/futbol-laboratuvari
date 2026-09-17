"use strict";

const assert = require("node:assert/strict");
const {
  applyGenericMarketGate,
  applyGoalMarketGate,
  genericAdjustment,
  goalMarketAdjustment,
  htftAdjustment,
} = require("../scripts/market-specialist-gates");

function memory(home, away) {
  return {
    home: { count: 8, ...home },
    away: { count: 8, ...away },
  };
}

(function bttsContradictionOnlyReducesSignalStrength() {
  const item = {
    market: "KG Var",
    selection: "KG Var",
    model_score: 72,
    analysis_score: 72,
    score: 72,
    estimated_probability: 58,
    analysis_metrics: {
      memory: memory({ bttsRate: 25 }, { bttsRate: 35 }),
    },
    pro_signals: [],
  };
  const adjustment = genericAdjustment(item);
  assert.equal(adjustment.delta, -3);
  const result = applyGenericMarketGate(item);
  assert.equal(result.model_score, 69);
  assert.equal(result.estimated_probability, 58);
  assert.equal(result.market_specialist.applied, true);
})();

(function compatibleBttsContextDoesNotDoubleRewardExistingModel() {
  const item = {
    market: "KG Var",
    model_score: 72,
    estimated_probability: 62,
    analysis_metrics: { memory: memory({ bttsRate: 70 }, { bttsRate: 65 }) },
  };
  const adjustment = genericAdjustment(item);
  assert.equal(adjustment.delta, 0);
  assert.equal(adjustment.applied, false);
})();

(function matchResultContradictionIsMarketSpecific() {
  const ms1 = genericAdjustment({
    market: "MS 1",
    analysis_metrics: { memory: memory({ pointsPerGame: 0.9 }, { pointsPerGame: 1.8 }) },
  });
  assert.equal(ms1.delta, -3);
  const ms2 = genericAdjustment({
    market: "MS 2",
    analysis_metrics: { memory: memory({ pointsPerGame: 1.8 }, { pointsPerGame: 0.9 }) },
  });
  assert.equal(ms2.delta, -3);
})();

(function extremeGoalMarketsHaveSeparateThresholds() {
  const over35 = goalMarketAdjustment({ market: "3.5 Üst", totalLambda: 2.4, over35Rate: 25, dataCompleteness: 80, completeRange: true });
  assert.equal(over35.delta, -4);
  const sixPlus = goalMarketAdjustment({ market: "6+ Gol", totalLambda: 3.0, over35Rate: 55, dataCompleteness: 65, completeRange: false });
  assert.equal(sixPlus.delta, -4);
  const strongSixPlus = goalMarketAdjustment({ market: "6+ Gol", totalLambda: 4.4, dataCompleteness: 90, completeRange: true });
  assert.equal(strongSixPlus.delta, 0);
})();

(function goalGateKeepsProbabilityUntouched() {
  const candidate = {
    market: "6+ Gol",
    recommended_market: "6+ Gol",
    model_score: 71,
    analysis_score: 71,
    confidence_score: "71%",
    estimated_probability: 18.4,
    signals: [],
  };
  const result = applyGoalMarketGate(candidate, { totalLambda: 3.0, dataCompleteness: 65, completeRange: false });
  assert.equal(result.model_score, 67);
  assert.equal(result.estimated_probability, 18.4);
})();

(function htftDerivedHalfSignalIsPenalizedButRealHalfSignalIsNot() {
  const derived = htftAdjustment({
    market: "1/2",
    firstHalfSource: "derived_from_full_time_direction",
    openness: 0.48,
    dataCompleteness: 50,
  });
  assert.equal(derived.delta, -4);
  const verified = htftAdjustment({
    market: "2/1",
    firstHalfSource: "detail_market_candidates",
    openness: 0.6,
    dataCompleteness: 72,
  });
  assert.equal(verified.delta, 0);
})();

process.stdout.write("market-specialist-gates tests passed\n");

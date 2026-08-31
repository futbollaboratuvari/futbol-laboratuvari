"use strict";

const assert = require("node:assert/strict");
const {
  boundedLearningScore,
  evaluateLearningBucket,
  hydrateLearningProfitability,
  wilsonInterval,
} = require("../scripts/learning-confidence");
const { finalizeBucket } = require("../scripts/robot-learning-memory");

const tinyPerfect = evaluateLearningBucket({
  won: 5,
  lost: 0,
  profit_sample_count: 5,
  profit_sum: 5,
  profit_square_sum: 5,
  distinct_date_count: 5,
}, "market");
assert.equal(tinyPerfect.sample_ready, false);
assert.equal(tinyPerfect.learning_active, false);
assert.equal(tinyPerfect.weight, 1);
assert.equal(tinyPerfect.confidence_adjustment, 0);

const stableMarket = evaluateLearningBucket({
  won: 59,
  lost: 30,
  profit_sample_count: 89,
  profit_sum: 17.2,
  profit_square_sum: 67.76,
  distinct_date_count: 8,
}, "market");
assert.equal(stableMarket.sample_ready, true);
assert.equal(stableMarket.learning_state, "boost");
assert.equal(stableMarket.weight, 1.06);
assert.equal(stableMarket.confidence_adjustment, 2);
assert.ok(stableMarket.adjusted_roi < stableMarket.flat_roi);

const downsideBrake = evaluateLearningBucket({
  won: 96,
  lost: 101,
  profit_sample_count: 197,
  profit_sum: -37.97,
  profit_square_sum: 148.0627,
  distinct_date_count: 4,
}, "market");
assert.equal(downsideBrake.temporal_ready, false);
assert.equal(downsideBrake.learning_state, "penalty");
assert.equal(downsideBrake.weight, 0.94);

const uncertainLeague = evaluateLearningBucket({
  won: 7,
  lost: 5,
  profit_sample_count: 12,
  profit_sum: 0,
  profit_square_sum: 12,
  distinct_date_count: 12,
}, "league");
assert.equal(uncertainLeague.sample_ready, false);
assert.equal(uncertainLeague.learning_state, "neutral");

const interval = wilsonInterval(10, 20);
assert.ok(interval.low < 0.5 && interval.high > 0.5);

const independent = boundedLearningScore(60, 1.2, 8, true);
assert.equal(independent.raw_score, 80);
assert.equal(independent.score, 66);
assert.equal(independent.max_score_shift, 6);

const marketOnly = boundedLearningScore(60, 1.2, 8, false);
assert.equal(marketOnly.score, 63);
assert.equal(marketOnly.max_score_shift, 3);

const finalized = finalizeBucket({
  total: 89,
  pending: 0,
  won: 59,
  lost: 30,
  void: 0,
  profit_sample_count: 89,
  odds_sum: 160.2,
  profit_sum: 17.2,
  profit_square_sum: 67.76,
  distinct_date_count: 8,
}, "market");
assert.equal(finalized.learning_active, true);
assert.equal(finalized.weight, 1.06);
assert.equal(finalized.policy_min_settled, 30);

const hydrated = hydrateLearningProfitability({
  market_memory: { "2.5 Üst": { won: 1, lost: 1 } },
  league_memory: { "Test Ligi": { won: 1, lost: 1 } },
  league_market_memory: { "Test Ligi :: 2.5 Üst": { won: 1, lost: 1 } },
  predictions: [
    { date: "2026-08-30", market: "2.5 Üst", league: "Test Ligi", status: "won", odds: "1.80" },
    { date: "2026-08-31", market: "2.5 Üst", league: "Test Ligi", status: "lost", odds: "1.70" },
  ],
});
assert.equal(hydrated.market_memory["2.5 Üst"].profit_sample_count, 2);
assert.equal(hydrated.market_memory["2.5 Üst"].profit_sum, -0.2);
assert.equal(hydrated.market_memory["2.5 Üst"].distinct_date_count, 2);
assert.equal(hydrated.league_market_memory["Test Ligi :: 2.5 Üst"].average_odds, 1.75);

console.log("learning-confidence.test.js OK");

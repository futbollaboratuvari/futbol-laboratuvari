"use strict";

const assert = require("node:assert/strict");
const {
  MAX_PENDING_PREDICTIONS,
  MAX_TRAINING_PREDICTIONS,
  MAX_VOID_PREDICTIONS,
  MARKET_RETENTION_FLOOR,
  mergePrediction,
  retainLearningPredictions,
  retainTrainingPredictions,
  summarizePremiumPerformance,
} = require("../scripts/robot-learning-memory");

function row(id, status, market, timestamp) {
  return {
    id,
    status,
    market,
    created_at: timestamp,
    updated_at: timestamp,
    date: timestamp.slice(0, 10),
    league: "Test Ligi",
    odds: "1.80",
  };
}

function iso(index, dayOffset = 0) {
  const base = Date.UTC(2026, 0, 1 + dayOffset, 0, 0, 0);
  return new Date(base + index * 1000).toISOString();
}

(function preservesSpecialistMarketHistoryUnderCrowding() {
  const popular = Array.from({ length: 3300 }, (_, index) =>
    row(`popular-${index}`, index % 2 ? "won" : "lost", "2.5 Alt", iso(index, 100))
  );
  const rare = Array.from({ length: MARKET_RETENTION_FLOOR }, (_, index) =>
    row(`rare-${index}`, index % 2 ? "won" : "lost", "İY/MS 1/2", iso(index, 1))
  );

  const retained = retainTrainingPredictions([...popular, ...rare]);
  assert.equal(retained.length, MAX_TRAINING_PREDICTIONS);
  assert.equal(
    retained.filter((item) => item.market === "İY/MS 1/2").length,
    MARKET_RETENTION_FLOOR,
    "rare specialist history must survive high-volume market crowding"
  );
})();

(function capsOperationalRowsWithoutEvictingTrainingCapacity() {
  const training = Array.from({ length: MAX_TRAINING_PREDICTIONS + 200 }, (_, index) =>
    row(`train-${index}`, index % 2 ? "won" : "lost", index % 3 ? "KG Var" : "6+ Gol", iso(index, 20))
  );
  const pending = Array.from({ length: MAX_PENDING_PREDICTIONS + 100 }, (_, index) =>
    row(`pending-${index}`, "pending", "2.5 Üst", iso(index, 40))
  );
  const voided = Array.from({ length: MAX_VOID_PREDICTIONS + 50 }, (_, index) =>
    row(`void-${index}`, "void", "MS 1", iso(index, 60))
  );

  const retained = retainLearningPredictions([...training, ...pending, ...voided]);
  assert.equal(
    retained.filter((item) => ["won", "lost"].includes(item.status)).length,
    MAX_TRAINING_PREDICTIONS
  );
  assert.equal(
    retained.filter((item) => item.status === "pending").length,
    MAX_PENDING_PREDICTIONS
  );
  assert.equal(
    retained.filter((item) => item.status === "void").length,
    MAX_VOID_PREDICTIONS
  );
})();

(function keepsNewestPendingRows() {
  const pending = Array.from({ length: MAX_PENDING_PREDICTIONS + 3 }, (_, index) =>
    row(`pending-newest-${index}`, "pending", "KG Var", iso(index, 80))
  );
  const retained = retainLearningPredictions(pending);
  const ids = new Set(retained.map((item) => item.id));
  assert.equal(retained.length, MAX_PENDING_PREDICTIONS);
  assert.equal(ids.has("pending-newest-0"), false);
  assert.equal(ids.has("pending-newest-1"), false);
  assert.equal(ids.has("pending-newest-2"), false);
  assert.equal(ids.has(`pending-newest-${MAX_PENDING_PREDICTIONS + 2}`), true);
})();

(function noTruncationBelowCapacity() {
  const rows = [
    row("a", "won", "KG Var", iso(1, 1)),
    row("b", "pending", "İlk Yarı KG Var", iso(2, 1)),
    row("c", "void", "MS X", iso(3, 1)),
  ];
  const retained = retainLearningPredictions(rows);
  assert.deepEqual(new Set(retained.map((item) => item.id)), new Set(["a", "b", "c"]));
})();


(function locksPredictionTimePremiumFields() {
  const old = {
    id: "locked",
    status: "pending",
    created_at: iso(1, 1),
    premium_eligible_at_prediction: false,
    premium_policy_version: "accuracy-first-v1",
    include_in_coupon_at_prediction: false,
    independent_evidence_at_prediction: true,
    model_score_at_prediction: 71,
    estimated_probability_at_prediction: 54,
    market_probability_at_prediction: 50,
    edge_percent_at_prediction: 4,
    data_completeness_at_prediction: 63,
    odds_at_prediction: "1.80",
  };
  const refreshed = {
    ...old,
    premium_eligible_at_prediction: true,
    include_in_coupon_at_prediction: true,
    model_score_at_prediction: 90,
    estimated_probability_at_prediction: 80,
    market_probability_at_prediction: 45,
    edge_percent_at_prediction: 35,
    data_completeness_at_prediction: 100,
    odds_at_prediction: "2.20",
  };
  const merged = mergePrediction(old, refreshed, iso(2, 1));
  assert.equal(merged.premium_eligible_at_prediction, false);
  assert.equal(merged.include_in_coupon_at_prediction, false);
  assert.equal(merged.model_score_at_prediction, 71);
  assert.equal(merged.estimated_probability_at_prediction, 54);
  assert.equal(merged.odds_at_prediction, "1.80");
})();

(function summarizesOnlyForwardLockedPremiumSelections() {
  const rows = [
    { ...row("p1", "won", "KG Var", iso(1, 1)), premium_eligible_at_prediction: true, odds_at_prediction: "1.80" },
    { ...row("p2", "lost", "KG Var", iso(2, 1)), premium_eligible_at_prediction: true, odds_at_prediction: "2.00" },
    { ...row("p3", "pending", "2.5 Üst", iso(3, 1)), premium_eligible_at_prediction: true, odds_at_prediction: "1.90" },
    { ...row("raw", "won", "MS 1", iso(4, 1)), premium_eligible_at_prediction: false, odds_at_prediction: "1.70" },
  ];
  const summary = summarizePremiumPerformance(rows);
  assert.equal(summary.selection_count, 3);
  assert.equal(summary.pending_count, 1);
  assert.equal(summary.settled_count, 2);
  assert.equal(summary.won_count, 1);
  assert.equal(summary.lost_count, 1);
  assert.equal(summary.hit_rate, 0.5);
  assert.equal(summary.priced_settled_count, 2);
  assert.equal(summary.profit_units, -0.2);
  assert.equal(summary.flat_roi, -0.1);
  assert.equal(summary.measurement_mode, "forward_only_prediction_time_locked");
})();

console.log("learning-memory-retention.test.js OK");

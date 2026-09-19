"use strict";

const assert = require("node:assert/strict");
const {
  MAX_PENDING_PREDICTIONS,
  MAX_TRAINING_PREDICTIONS,
  MAX_VOID_PREDICTIONS,
  MARKET_RETENTION_FLOOR,
  retainLearningPredictions,
  retainTrainingPredictions,
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

console.log("learning-memory-retention.test.js OK");

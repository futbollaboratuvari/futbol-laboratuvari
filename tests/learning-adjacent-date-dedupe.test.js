"use strict";

const assert = require("node:assert/strict");
const {
  collapseAdjacentDateDuplicates,
  predictionDateFor,
  predictionIdentityWithoutDate,
  shouldMergeAdjacentDateDuplicate,
} = require("../scripts/robot-learning-memory");

function row(overrides = {}) {
  return {
    id: "2026-09-19|abd mls|houston cincinnati|kg yok|03 30",
    date: "2026-09-19",
    created_at: "2026-09-19T14:00:00.000Z",
    updated_at: "2026-09-19T14:00:00.000Z",
    match_name: "Houston - Cincinnati",
    league: "ABD MLS",
    start_time: "03:30",
    market: "KG Yok",
    odds: "1.70",
    analysis_score: 70,
    status: "pending",
    result_score: "",
    ...overrides,
  };
}

(function testPredictionDatePrefersMatchDate() {
  assert.equal(
    predictionDateFor({ date: "2026-09-20", utc_date: "2026-09-19T22:30:00Z" }, "2026-09-19"),
    "2026-09-20"
  );
  assert.equal(
    predictionDateFor({ match_date: "2026-09-18" }, "2026-09-19"),
    "2026-09-18"
  );
  assert.equal(
    predictionDateFor({}, "2026-09-20"),
    "2026-09-20"
  );
})();

(function testIdentityIgnoresOnlyDate() {
  const a = row();
  const b = row({
    id: "2026-09-20|abd mls|houston cincinnati|kg yok|03 30",
    date: "2026-09-20",
  });
  assert.equal(predictionIdentityWithoutDate(a), predictionIdentityWithoutDate(b));
  assert.equal(shouldMergeAdjacentDateDuplicate(a, b), true);
})();

(function testPendingAdjacentDuplicateKeepsNewestIdentity() {
  const oldRow = row();
  const newRow = row({
    id: "2026-09-20|abd mls|houston cincinnati|kg yok|03 30",
    date: "2026-09-20",
    created_at: "2026-09-19T22:00:00.000Z",
    updated_at: "2026-09-19T22:00:00.000Z",
    analysis_score: 76,
    odds: "1.72",
  });
  const result = collapseAdjacentDateDuplicates([oldRow, newRow], "2026-09-20T01:00:00.000Z");
  assert.equal(result.collapsed_groups, 1);
  assert.equal(result.removed_rows, 1);
  assert.equal(result.predictions.length, 1);
  assert.equal(result.predictions[0].id, newRow.id);
  assert.equal(result.predictions[0].date, "2026-09-20");
  assert.equal(result.predictions[0].analysis_score, 76);
  assert.equal(result.predictions[0].odds, "1.72");
  assert.equal(result.predictions[0].status, "pending");
})();

(function testSettledResultSurvivesIntoNewestIdentity() {
  const settled = row({
    status: "won",
    result_score: "2-0",
    finalized_at: "2026-09-19T23:00:00.000Z",
    result_source: "ESPN Scoreboard",
    result_source_match_id: "123",
  });
  const newestPending = row({
    id: "2026-09-20|abd mls|houston cincinnati|kg yok|03 30",
    date: "2026-09-20",
    created_at: "2026-09-19T22:00:00.000Z",
    updated_at: "2026-09-19T22:00:00.000Z",
    status: "pending",
    result_score: "",
    analysis_score: 75,
  });
  const result = collapseAdjacentDateDuplicates([settled, newestPending]);
  assert.equal(result.predictions.length, 1);
  const merged = result.predictions[0];
  assert.equal(merged.id, newestPending.id);
  assert.equal(merged.date, "2026-09-20");
  assert.equal(merged.status, "won");
  assert.equal(merged.result_score, "2-0");
  assert.equal(merged.result_source, "ESPN Scoreboard");
  assert.equal(merged.result_source_match_id, "123");
  assert.equal(merged.analysis_score, 75);
})();

(function testDifferentKickoffDoesNotCollapseLegitimateRematch() {
  const a = row();
  const b = row({
    id: "2026-09-20|abd mls|houston cincinnati|kg yok|20 00",
    date: "2026-09-20",
    start_time: "20:00",
    created_at: "2026-09-20T10:00:00.000Z",
  });
  const result = collapseAdjacentDateDuplicates([a, b]);
  assert.equal(result.predictions.length, 2);
  assert.equal(result.removed_rows, 0);
})();

(function testDifferentMarketDoesNotCollapse() {
  const a = row();
  const b = row({
    id: "2026-09-20|abd mls|houston cincinnati|ms 1|03 30",
    date: "2026-09-20",
    market: "MS 1",
    created_at: "2026-09-19T22:00:00.000Z",
  });
  const result = collapseAdjacentDateDuplicates([a, b]);
  assert.equal(result.predictions.length, 2);
})();

(function testTwoSettledRowsNeverCollapse() {
  const a = row({ status: "won", result_score: "2-0" });
  const b = row({
    id: "2026-09-20|abd mls|houston cincinnati|kg yok|03 30",
    date: "2026-09-20",
    created_at: "2026-09-19T22:00:00.000Z",
    status: "lost",
    result_score: "1-1",
  });
  assert.equal(shouldMergeAdjacentDateDuplicate(a, b), false);
  const result = collapseAdjacentDateDuplicates([a, b]);
  assert.equal(result.predictions.length, 2);
})();

(function testMoreThan36HoursDoesNotCollapse() {
  const a = row({ created_at: "2026-09-18T00:00:00.000Z" });
  const b = row({
    id: "2026-09-20|abd mls|houston cincinnati|kg yok|03 30",
    date: "2026-09-20",
    created_at: "2026-09-19T22:00:00.000Z",
  });
  assert.equal(shouldMergeAdjacentDateDuplicate(a, b), false);
})();

console.log("learning-adjacent-date-dedupe.test.js OK");

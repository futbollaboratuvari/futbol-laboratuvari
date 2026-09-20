"use strict";

const assert = require("node:assert/strict");
const { istanbulDate, stalePendingStats } = require("../scripts/learning-health-utils");

(function testIstanbulDate() {
  assert.equal(istanbulDate(new Date("2026-09-19T21:30:00Z")), "2026-09-20");
})();

(function testStalePendingBacklog() {
  const rows = [
    { id: "a", status: "pending", date: "2026-09-18", market: "2.5 Alt", match_name: "A - B" },
    { id: "b", status: "pending", date: "2026-09-19", market: "MS 1", match_name: "C - D" },
    { id: "c", status: "pending", date: "2026-09-20", market: "KG Var", match_name: "E - F" },
    { id: "d", status: "won", date: "2026-09-18", market: "2.5 Alt", match_name: "G - H" },
    { id: "e", status: "pending", date: "2026-09-18", market: "2.5 Alt", match_name: "I - J" },
  ];
  const stats = stalePendingStats(rows, new Date("2026-09-20T02:00:00+03:00"));
  assert.equal(stats.today, "2026-09-20");
  assert.equal(stats.stale_count, 3);
  assert.equal(stats.oldest_date, "2026-09-18");
  assert.equal(stats.newest_stale_date, "2026-09-19");
  assert.deepEqual(stats.by_date, { "2026-09-18": 2, "2026-09-19": 1 });
  assert.deepEqual(stats.top_markets[0], { market: "2.5 Alt", count: 2 });
  assert.equal(stats.examples.length, 3);
})();

(function testNoFalseStaleForTodayOrMeasuredRows() {
  const stats = stalePendingStats([
    { status: "pending", date: "2026-09-20", market: "MS 1" },
    { status: "won", date: "2026-09-18", market: "MS 1" },
    { status: "lost", date: "2026-09-18", market: "MS 2" },
  ], new Date("2026-09-20T10:00:00+03:00"));
  assert.equal(stats.stale_count, 0);
  assert.equal(stats.oldest_date, null);
})();

console.log("learning-health-stale.test.js OK");

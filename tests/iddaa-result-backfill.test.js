"use strict";

const assert = require("node:assert/strict");
const {
  buildArchiveIdentityIndex,
  buildIddaaBackfillTargets,
  fetchIddaaBackfillResults,
  iddaaDetailResult,
} = require("../scripts/update-final-scores");

const now = new Date("2026-09-20T08:00:00+03:00");

(function testArchiveIdentityIndexFailsClosedOnConflictingIds() {
  const index = buildArchiveIdentityIndex([
    { date: "2026-09-19", home: "Alpha FC", away: "Beta", iddaa_event_id: "1001" },
    { date: "2026-09-19", home: "Alpha", away: "Beta", iddaa_event_id: "1001" },
    { date: "2026-09-19", home: "Gamma", away: "Delta", iddaa_event_id: "2001" },
    { date: "2026-09-19", home: "Gamma", away: "Delta", iddaa_event_id: "2002" },
  ]);
  assert.equal(index.size, 1);
  assert.equal(index.get("2026-09-19|alpha|beta").event_id, "1001");
  assert.equal(index.has("2026-09-19|gamma|delta"), false);
})();

(function testTargetSelectionUsesExactArchiveIdentityAndCooldown() {
  const memory = {
    predictions: [
      { status: "pending", date: "2026-09-19", start_time: "21:00", match_name: "Alpha - Beta", result_score: "" },
      { status: "pending", date: "2026-09-19", start_time: "21:10", match_name: "Alpha - Beta", result_score: "" },
      { status: "pending", date: "2026-09-19", start_time: "20:00", match_name: "Gamma - Delta", result_score: "" },
      { status: "won", date: "2026-09-19", start_time: "19:00", match_name: "Won - Match", result_score: "1-0" },
      { status: "pending", date: "2026-09-20", start_time: "01:00", match_name: "Today - Match", result_score: "" },
    ],
  };
  const archive = [
    { date: "2026-09-19", home: "Alpha", away: "Beta", iddaa_event_id: "1001" },
    { date: "2026-09-19", home: "Gamma", away: "Delta", iddaa_event_id: "2001" },
  ];
  const targets = buildIddaaBackfillTargets(memory, archive, {}, now, 10);
  assert.deepEqual(targets.map((row) => row.event_id).sort(), ["1001", "2001"]);

  const cooldown = {
    iddaa_detail_checks: {
      "1001": { last_attempt_at: "2026-09-20T04:30:00.000Z" },
    },
  };
  const cooled = buildIddaaBackfillTargets(memory, archive, cooldown, now, 10);
  assert.deepEqual(cooled.map((row) => row.event_id), ["2001"]);
})();

(function testIddaaDetailResultRequiresIdentityDateTeamsAndScore() {
  const target = {
    event_id: "1001",
    prediction: {
      date: "2026-09-19",
      start_time: "21:00",
      match_name: "Alpha FC - Beta Club",
    },
  };
  const good = {
    iddaa_event_id: "1001",
    date: "2026-09-19",
    home: "Alpha",
    away: "Beta",
    homeScore: 2,
    awayScore: 1,
    score: "2-1",
  };
  const result = iddaaDetailResult(good, target);
  assert.ok(result);
  assert.equal(result.score, "2-1");
  assert.equal(result.source_match_id, "1001");

  assert.equal(iddaaDetailResult({ ...good, iddaa_event_id: "9999" }, target), null);
  assert.equal(iddaaDetailResult({ ...good, date: "2026-09-18" }, target), null);
  assert.equal(iddaaDetailResult({ ...good, home: "Completely Other" }, target), null);
  assert.equal(iddaaDetailResult({ ...good, homeScore: null, awayScore: null, score: "" }, target), null);
})();

(function testEarlyMorningPredictionMayAcceptNextDayProviderDate() {
  const target = {
    event_id: "3001",
    prediction: {
      date: "2026-09-18",
      start_time: "03:30",
      match_name: "Night Home - Night Away",
    },
  };
  const detail = {
    iddaa_event_id: "3001",
    date: "2026-09-19",
    home: "Night Home",
    away: "Night Away",
    homeScore: 0,
    awayScore: 2,
  };
  assert.equal(iddaaDetailResult(detail, target)?.score, "0-2");
})();

(async function testFetchBatchIsBoundedAndReturnsVerifiedRows() {
  const memory = {
    predictions: [
      { status: "pending", date: "2026-09-19", start_time: "20:00", match_name: "Alpha - Beta", result_score: "" },
      { status: "pending", date: "2026-09-19", start_time: "20:30", match_name: "Gamma - Delta", result_score: "" },
    ],
  };
  const archive = [
    { date: "2026-09-19", home: "Alpha", away: "Beta", iddaa_event_id: "1001" },
    { date: "2026-09-19", home: "Gamma", away: "Delta", iddaa_event_id: "2001" },
  ];
  let calls = 0;
  const fetchDetail = async (id) => {
    calls += 1;
    if (id === "1001") {
      return { match: { iddaa_event_id: id, date: "2026-09-19", home: "Alpha", away: "Beta", homeScore: 3, awayScore: 1 } };
    }
    return { match: { iddaa_event_id: id, date: "2026-09-19", home: "Gamma", away: "Delta", homeScore: null, awayScore: null } };
  };

  const batch = await fetchIddaaBackfillResults(memory, archive, {}, now, {
    fetchDetail,
    limit: 2,
    concurrency: 2,
  });
  assert.equal(calls, 2);
  assert.equal(batch.requested, 2);
  assert.equal(batch.score_found, 1);
  assert.equal(batch.rejected, 1);
  assert.equal(batch.results.length, 1);
  assert.equal(batch.results[0].score, "3-1");
  assert.equal(batch.checks["1001"].score_found, true);
  assert.equal(batch.checks["2001"].score_found, false);

  console.log("iddaa-result-backfill.test.js OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

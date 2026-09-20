"use strict";

const assert = require("node:assert/strict");
const { canonicalMarket: memoryCanonicalMarket } = require("../scripts/robot-learning-memory");
const { canonicalMarket: weightCanonicalMarket } = require("../scripts/apply-learning-weights");
const { settle } = require("../scripts/learning-finalizer");
const {
  apiFootballResults,
  applyPredictionResults,
  applyResults,
  eligiblePrediction,
  footballDataResults,
  espnResults,
  firstPeriodScore,
  requiresHalfTimeScore,
  scoreText,
} = require("../scripts/update-final-scores");
const {
  buildScoreIndexFromRows,
  findHalfTimeScore,
  needsHalfTimeScore,
} = require("../scripts/learning-score-linker");

(function testTargetMarketCanonicalization() {
  const cases = [
    ["İlk Yarı KG Var", "İlk Yarı KG Var"],
    ["İlk Yarı KG Yok", "İlk Yarı KG Yok"],
    ["İkinci Yarı KG Var", "İkinci Yarı KG Var"],
    ["İkinci Yarı KG Yok", "İkinci Yarı KG Yok"],
    ["6+ Gol", "6+ Gol"],
    ["1/1", "İY/MS 1/1"],
    ["1/2", "İY/MS 1/2"],
    ["2/1", "İY/MS 2/1"],
    ["İY/MS 1/1", "İY/MS 1/1"],
    ["İY/MS 1/2", "İY/MS 1/2"],
    ["İY/MS 2/1", "İY/MS 2/1"],
    ["HT/FT 1/2", "İY/MS 1/2"],
  ];
  for (const [input, expected] of cases) {
    assert.equal(memoryCanonicalMarket(input), expected, `memory canonical: ${input}`);
    assert.equal(weightCanonicalMarket(input), expected, `weight canonical: ${input}`);
  }
})();

(function testTargetMarketSettlement() {
  assert.equal(settle("6+ Gol", "4-2"), "won");
  assert.equal(settle("6+ Gol", "3-2"), "lost");

  assert.equal(settle("İlk Yarı KG Var", "3-2", "1-1"), "won");
  assert.equal(settle("İlk Yarı KG Var", "3-2", "1-0"), "lost");
  assert.equal(settle("İlk Yarı KG Yok", "3-2", "1-0"), "won");
  assert.equal(settle("İlk Yarı KG Var", "3-2", ""), "pending");

  assert.equal(settle("İkinci Yarı KG Var", "2-1", "1-0"), "won");
  assert.equal(settle("İkinci Yarı KG Yok", "2-1", "1-0"), "lost");
  assert.equal(settle("İkinci Yarı KG Yok", "2-0", "1-0"), "won");

  assert.equal(settle("İY/MS 1/1", "2-1", "1-0"), "won");
  assert.equal(settle("İY/MS 1/2", "1-2", "1-0"), "won");
  assert.equal(settle("İY/MS 2/1", "2-1", "0-1"), "won");
  assert.equal(settle("İY/MS 1/2", "1-1", "1-0"), "lost");
  assert.equal(settle("İY/MS 1/2", "1-2", ""), "pending");
})();

(function testHalfTimeSourceParsing() {
  const apiRows = apiFootballResults({
    response: [{
      fixture: { date: "2026-09-19T18:00:00Z", id: 11, status: { short: "FT" } },
      teams: { home: { name: "Home" }, away: { name: "Away" } },
      goals: { home: 2, away: 1 },
      score: { halftime: { home: 1, away: 0 }, fulltime: { home: 2, away: 1 } },
    }],
  });
  assert.equal(apiRows.length, 1);
  assert.equal(apiRows[0].score, "2-1");
  assert.equal(apiRows[0].half_time_score, "1-0");

  const footballDataRows = footballDataResults({
    matches: [{
      id: 22,
      status: "FINISHED",
      utcDate: "2026-09-19T18:00:00Z",
      homeTeam: { name: "Home" },
      awayTeam: { name: "Away" },
      score: {
        halfTime: { home: 1, away: 1 },
        fullTime: { home: 3, away: 2 },
      },
    }],
  });
  assert.equal(footballDataRows.length, 1);
  assert.equal(footballDataRows[0].score, "3-2");
  assert.equal(footballDataRows[0].half_time_score, "1-1");
})();

(function testEspnHalfTimeLineScoreParsing() {
  const rows = espnResults({
    events: [{
      id: "espn-1",
      date: "2026-09-19T18:00:00Z",
      status: { type: { completed: true, name: "STATUS_FULL_TIME" } },
      competitions: [{
        competitors: [
          {
            homeAway: "home",
            score: "3",
            team: { displayName: "Home" },
            linescores: [{ value: 1 }, { value: 2 }],
          },
          {
            homeAway: "away",
            score: "2",
            team: { displayName: "Away" },
            linescores: [{ value: 1 }, { value: 1 }],
          },
        ],
      }],
    }],
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].score, "3-2");
  assert.equal(rows[0].half_time_score, "1-1");
  assert.equal(firstPeriodScore({ linescores: [{ displayValue: "2" }] }), 2);
  assert.equal(firstPeriodScore({ linescores: [] }), null);
})();

(function testEspnMissingLineScoresRemainFailClosed() {
  const rows = espnResults({
    events: [{
      id: "espn-2",
      date: "2026-09-19T18:00:00Z",
      status: { type: { completed: true, name: "STATUS_FULL_TIME" } },
      competitions: [{
        competitors: [
          { homeAway: "home", score: "1", team: { displayName: "Home" } },
          { homeAway: "away", score: "0", team: { displayName: "Away" } },
        ],
      }],
    }],
  });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].half_time_score, "");
})();

(function testBlankScoreIsNotInventedAsZeroZero() {
  assert.equal(scoreText("", ""), "");
  assert.equal(scoreText(null, null), "");
  assert.equal(scoreText("2", "1"), "2-1");

  const row = {
    date: "2026-09-19",
    match_name: "Blank Home - Blank Away",
    home: "Blank Home",
    away: "Blank Away",
    homeScore: "",
    awayScore: "",
  };
  const result = {
    date: "2026-09-19",
    home: "Blank Home",
    away: "Blank Away",
    homeScore: 3,
    awayScore: 1,
    score: "3-1",
    half_time_score: "1-0",
    status: "finished",
    source: "test",
    source_match_id: 99,
  };
  const applied = applyResults([row], [result], "2026-09-20T00:00:00.000Z");
  assert.equal(applied.updated, 1);
  assert.equal(applied.matches[0].result_score, "3-1");
})();

(function testVerifiedResultLinksDirectlyIntoLearningMemory() {
  const prediction = {
    id: "direct-learning-test",
    status: "pending",
    date: "2026-09-19",
    match_name: "Houston - Cincinnati",
    home: "Houston",
    away: "Cincinnati",
    market: "KG Yok",
  };
  const result = {
    date: "2026-09-19",
    home: "Houston",
    away: "Cincinnati",
    score: "2-1",
    half_time_score: "1-0",
    source: "test-provider",
    source_match_id: 77,
  };
  const linked = applyPredictionResults([prediction], [result], "2026-09-20T00:00:00.000Z");
  assert.equal(linked.checked, 1);
  assert.equal(linked.linked, 1);
  assert.equal(linked.predictions[0].status, "pending", "finalizer must remain responsible for won/lost");
  assert.equal(linked.predictions[0].result_score, "2-1");
  assert.equal(linked.predictions[0].result_source, "test-provider");
  assert.equal(linked.predictions[0].result_source_match_id, 77);
})();

(function testDirectLearningBridgeEnrichesHalfTimeWithoutChangingStatus() {
  const prediction = {
    id: "direct-half-time-test",
    status: "pending",
    date: "2026-09-19",
    match_name: "Alpha - Beta",
    home: "Alpha",
    away: "Beta",
    market: "İlk Yarı KG Var",
    result_score: "3-2",
  };
  const result = {
    date: "2026-09-19",
    home: "Alpha",
    away: "Beta",
    score: "3-2",
    half_time_score: "1-1",
    source: "test-provider",
    source_match_id: 78,
  };
  const linked = applyPredictionResults([prediction], [result], "2026-09-20T00:00:00.000Z");
  assert.equal(linked.linked, 1);
  assert.equal(linked.halfTimeLinked, 1);
  assert.equal(linked.predictions[0].result_score, "3-2");
  assert.equal(linked.predictions[0].half_time_score, "1-1");
  assert.equal(linked.predictions[0].status, "pending");
})();

(function testExistingFullTimeCanBeEnrichedWithHalfTime() {
  const row = {
    date: "2026-09-19",
    match_name: "Home - Away",
    home: "Home",
    away: "Away",
    status: "finished",
    score: "2-1",
    result_score: "2-1",
  };
  const result = {
    date: "2026-09-19",
    home: "Home",
    away: "Away",
    homeScore: 2,
    awayScore: 1,
    score: "2-1",
    half_time_score: "1-0",
    status: "finished",
    source: "test",
    source_match_id: 1,
  };
  const applied = applyResults([row], [result], "2026-09-20T00:00:00.000Z");
  assert.equal(applied.updated, 1);
  assert.equal(applied.matches[0].result_score, "2-1");
  assert.equal(applied.matches[0].half_time_score, "1-0");
})();

(function testPendingHalfTimePredictionStaysEligibleForEnrichment() {
  const now = new Date("2026-09-20T12:00:00+03:00");
  const halftimePrediction = {
    status: "pending",
    date: "2026-09-19",
    start_time: "20:00",
    market: "İlk Yarı KG Var",
    result_score: "2-1",
  };
  assert.equal(requiresHalfTimeScore(halftimePrediction), true);
  assert.equal(eligiblePrediction(halftimePrediction, now), true);

  const normalPrediction = {
    ...halftimePrediction,
    market: "2.5 Üst",
  };
  assert.equal(eligiblePrediction(normalPrediction, now), false);
})();

(function testLearningScoreIndexCarriesHalfTimeScore() {
  const row = {
    date: "2026-09-19",
    match_name: "Home - Away",
    home: "Home",
    away: "Away",
    score: "2-1",
    half_time_score: "1-0",
  };
  const index = buildScoreIndexFromRows([row]);
  assert.equal(index.halfTimeScoreCount, 1);
  assert.equal(findHalfTimeScore(row, index), "1-0");
  assert.equal(needsHalfTimeScore({ market: "İY/MS 1/2" }), true);
})();

console.log("learning-market-settlement.test.js OK");

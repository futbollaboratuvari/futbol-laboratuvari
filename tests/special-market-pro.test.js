"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "fl-half-scenarios-"));
const archivePath = path.join(tempDir, "archive.json");
const recent = (scores) => scores.map((score) => ({ score }));
fs.writeFileSync(archivePath, JSON.stringify({
  matches: [],
  team_index: {
    home: { team: "Yarı Ev", recent: recent(["2-1", "3-1", "2-0", "1-1", "3-2", "2-1", "1-0", "2-2"]) },
    away: { team: "Yarı Dep", recent: recent(["1-2", "2-2", "1-1", "2-1", "0-1", "1-2", "2-3", "1-1"]) },
  },
}), "utf8");
process.env.ROBOT_ARCHIVE_PATH = archivePath;

const { buildSpecialMarketAnalysis, _internals } = require("../scripts/robot-exact-scoring");

const fixture = {
  date: "2026-09-02", home: "Yarı Ev", away: "Yarı Dep", status: "scheduled",
  metric_quality: "verified", firstHalfGoalTrend: 44, secondHalfGoalTrend: 56,
  available_odds: {
    firstHalfBttsYes: 4.2, firstHalfBttsNo: 1.18,
    secondHalfBttsYes: 2.55, secondHalfBttsNo: 1.44,
    htFt11: 4.2, htFt1X: 13, htFt12: 31,
    htFtX1: 5.1, htFtXX: 6.8, htFtX2: 8.2,
    htFt21: 34, htFt2X: 15, htFt22: 6.4,
  },
};

const analysis = buildSpecialMarketAnalysis(fixture);
assert.equal(analysis.available, true);
assert.equal(analysis.trusted_odds, true);
assert.deepEqual(Object.keys(analysis.outcomes), ["firstHalfBttsYes", "secondHalfBttsYes", "htft11", "htft12", "htftx1", "htft21", "htft22"]);
for (const outcome of Object.values(analysis.outcomes)) {
  assert.equal(outcome.official_market_complete, true);
  assert.equal(outcome.trusted_odds, true);
  assert.equal(outcome.independent_evidence, true);
  assert.deepEqual(outcome.probability_source, ["yarı Poisson modeli"]);
  assert.ok(["model_analysis", "watch"].includes(outcome.recommendation_status));
}

const half = _internals.halfScenarioProbabilities({
  homeLambda: 1.8, awayLambda: 1.3, samples: 16,
}, { firstHalfGoalTrend: 44, secondHalfGoalTrend: 56 });
const htftTotal = _internals.HTFT_MARKET_KEYS.reduce((sum, key) => sum + half.probabilities[key], 0);
assert.ok(Math.abs(htftTotal - 100) < 0.05);
assert.ok(half.probabilities.secondHalfBttsYes > half.probabilities.firstHalfBttsYes);

const guessed = buildSpecialMarketAnalysis({
  ...fixture,
  available_odds: undefined,
  raw_market_guess_odds: fixture.available_odds,
});
assert.equal(guessed, null, "ham tahmin oranı gerçek özel market görüşü üretmemeli");

fs.rmSync(tempDir, { recursive: true, force: true });
console.log("special-market-pro.test.js OK");

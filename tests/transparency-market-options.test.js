"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { transparencyOptionsFor, _internals } = require("../scripts/robot-exact-scoring");

const fixture = {
  home: "Alpha",
  away: "Beta",
  metric_quality: "verified",
  firstHalfGoalTrend: 52,
  secondHalfGoalTrend: 66,
  bttsPercent: 61,
  over25Percent: 64,
  over35Percent: 48,
  available_odds: {
    firstHalfBttsYes: 2.45,
    firstHalfBttsNo: 1.42,
    secondHalfBttsYes: 2.05,
    secondHalfBttsNo: 1.55,
    halfBttsYesYes: 9.50,
    halfBttsYesNo: 4.20,
    halfBttsNoYes: 3.60,
    halfBttsNoNo: 1.55,
    over25: 1.88,
    under25: 1.84,
    over35: 2.35,
    under35: 1.52,
    bttsYes: 1.82,
    bttsNo: 1.92,
    ms1: 2.10,
    msx: 3.10,
    ms2: 3.20,
  },
};

const options = transparencyOptionsFor(fixture);
const markets = options.map((option) => option.label);

assert.ok(markets.includes("İlk Yarı KG Var"), "İlk Yarı KG Var Şeffaflık seçeneklerine girmeli");
assert.ok(markets.includes("İkinci Yarı KG Var"), "İkinci Yarı KG Var Şeffaflık seçeneklerine girmeli");
assert.ok(markets.includes("İY KG / 2Y KG Evet / Evet"), "İY/2Y KG kombinasyonu analiz edilmeli");
assert.ok(markets.includes("İY KG / 2Y KG Hayır / Evet"), "İY/2Y KG alternatif kombinasyonu analiz edilmeli");
assert.ok(markets.includes("2.5 Üst"), "2.5 Üst Şeffaflık seçeneklerine girmeli");
assert.ok(markets.includes("3.5 Üst"), "3.5 Üst Şeffaflık seçeneklerine girmeli");
assert.ok(options.every((option) => option.odd_source_type !== "raw_market_guess_odds"), "Tahmini ham market Şeffaflık seçeneği olamaz");
assert.ok(options.every((option) => Number.isFinite(Number(option.estimated_probability))), "Her Şeffaflık seçeneği model olasılığı taşımalı");

const poissonMemory = {
  home: { count: 6, goalsForAvg: 1.8, goalsAgainstAvg: 1.2, winRate: 50, drawRate: 25, lossRate: 25 },
  away: { count: 6, goalsForAvg: 1.5, goalsAgainstAvg: 1.4, winRate: 42, drawRate: 25, lossRate: 33 },
  league: { count: 12, goalAverage: 2.8 },
};
const missingHalfTrendMetrics = {
  firstHalfGoalTrend: null,
  secondHalfGoalTrend: null,
  leagueGoalAverage: 2.8,
};
const halfPoisson = _internals.poissonHalfBttsProbability({ homeLambda: 1.95, awayLambda: 1.44 });
assert.ok(Number.isFinite(halfPoisson) && halfPoisson > 20 && halfPoisson < 45, "Poisson yarı KG olasılığı makul aralıkta olmalı");

const firstHalfFallback = _internals.independentProbabilityFor({}, "firstHalfBttsYes", missingHalfTrendMetrics, poissonMemory);
assert.ok(Number.isFinite(firstHalfFallback.probability), "İlk Yarı KG trendi yoksa Poisson bağımsız kanıt üretmeli");
assert.ok(firstHalfFallback.sources.includes("Poisson yarı KG modeli"), "İlk Yarı KG fallback kaynağı Poisson olmalı");

const secondHalfFallback = _internals.independentProbabilityFor({}, "secondHalfBttsYes", missingHalfTrendMetrics, poissonMemory);
assert.ok(Number.isFinite(secondHalfFallback.probability), "İkinci Yarı KG trendi yoksa Poisson bağımsız kanıt üretmeli");
assert.ok(secondHalfFallback.sources.includes("Poisson yarı KG modeli"), "İkinci Yarı KG fallback kaynağı Poisson olmalı");

const comboFallback = _internals.independentProbabilityFor({}, "halfBttsNoNo", missingHalfTrendMetrics, poissonMemory);
assert.ok(Number.isFinite(comboFallback.probability), "İY/2Y KG kombinasyonu trend yokken Poisson bağımsız kanıt üretmeli");
assert.ok(comboFallback.sources.includes("Poisson İY/2Y KG modeli"), "İY/2Y KG fallback kaynağı Poisson olmalı");

const noEvidence = _internals.independentProbabilityFor(
  {},
  "firstHalfBttsYes",
  missingHalfTrendMetrics,
  {
    home: { count: 0, goalsForAvg: 0, goalsAgainstAvg: 0 },
    away: { count: 0, goalsForAvg: 0, goalsAgainstAvg: 0 },
    league: { count: 0, goalAverage: 0 },
  },
);
assert.equal(noEvidence.probability, null, "Takım geçmişi ve yarı trendi yoksa yarı KG kanıtı uydurulmamalı");

const insightsSource = fs.readFileSync(path.join(__dirname, "..", "analysis-insights-v1.js"), "utf8");
assert.match(insightsSource, /return "htft"/, "İY\/MS marketleri AI Şeffaflıkta ayrı htft ailesine ayrılmalı");
assert.match(insightsSource, /htft:\s*1075/, "İY\/MS ailesi güçlü görünürlük önceliği taşımalı");
assert.match(insightsSource, /htft:\s*2/, "İY\/MS aile kotası tanımlı olmalı");
assert.match(insightsSource, /const preferredOrder = \[\s*"half_btts_combo",\s*"htft"/s, "İY\/MS uygun aday varsa ilk çeşitlilik geçişinde seçilmeli");

console.log("transparency-market-options.test.js: OK");

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { transparencyOptionsFor } = require("../scripts/robot-exact-scoring");

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

const insightsSource = fs.readFileSync(path.join(__dirname, "..", "analysis-insights-v1.js"), "utf8");
assert.match(insightsSource, /return "htft"/, "İY\/MS marketleri AI Şeffaflıkta ayrı htft ailesine ayrılmalı");
assert.match(insightsSource, /htft:\s*1075/, "İY\/MS ailesi güçlü görünürlük önceliği taşımalı");
assert.match(insightsSource, /htft:\s*2/, "İY\/MS aile kotası tanımlı olmalı");
assert.match(insightsSource, /const preferredOrder = \[\s*"half_btts_combo",\s*"htft"/s, "İY\/MS uygun aday varsa ilk çeşitlilik geçişinde seçilmeli");

console.log("transparency-market-options.test.js: OK");

"use strict";

const assert = require("node:assert/strict");
const { live_match_output } = require("../scripts/export-high-value-json");

const scored = {
  match: "Alpha VS Beta",
  home: "Alpha",
  away: "Beta",
  date: "2026-09-18",
  time: "20:00",
  league: "Test Lig",
  selection: "MS 1",
  market: "MS 1",
  odds: "2.10",
  confidence: "66%",
  model_score: 66,
  analysis_score: 66,
  estimated_probability: 49,
  data_completeness: 70,
  independent_evidence: true,
  hasOdds: false,
  analysis_options: [
    { label: "İlk Yarı KG Var", odd: 2.45, model_score: 61, estimated_probability: 40, independent_evidence: true },
    { label: "İkinci Yarı KG Var", odd: 2.05, model_score: 63, estimated_probability: 48, independent_evidence: true },
    { label: "3.5 Üst", odd: 2.35, model_score: 62, estimated_probability: 42, independent_evidence: true },
    { label: "Ham Tahmin", odd: 4.2, model_score: 90, estimated_probability: 50, odd_source_type: "raw_market_guess_odds" },
    { label: "Bloklu", odd: 3.1, model_score: 80, estimated_probability: 45, specialist_decision: "block" },
  ],
  goal_market_candidates: [
    { market: "6+ Gol", odd: 7.5, model_score: 70, estimated_probability: 16, specialist_eligible: true },
  ],
};

const out = live_match_output(scored);
const markets = out.analysis_options.map((item) => item.label || item.market);

assert.deepEqual(markets, ["İlk Yarı KG Var", "İkinci Yarı KG Var", "3.5 Üst"]);
assert.equal(out.goal_market_candidates.length, 1);
assert.equal(out.goal_market_candidates[0].market, "6+ Gol");
assert.ok(!JSON.stringify(out.analysis_options).includes("Ham Tahmin"));
assert.ok(!JSON.stringify(out.analysis_options).includes("Bloklu"));

console.log("transparency-export.test.js: OK");

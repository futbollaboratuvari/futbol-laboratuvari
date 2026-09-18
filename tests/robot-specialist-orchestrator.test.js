"use strict";

const assert = require("node:assert/strict");
const { familyForMarket } = require("../scripts/robot-specialists/shared");
const { runOrchestrator, VERSION } = require("../scripts/robot-specialist-orchestrator");

assert.equal(VERSION, "robot-specialist-orchestrator-v1");
assert.equal(familyForMarket("KG Var"), "btts");
assert.equal(familyForMarket("İlk Yarı KG Var"), "btts");
assert.equal(familyForMarket("3.5 Üst"), "goals");
assert.equal(familyForMarket("6+ Gol"), "goals");
assert.equal(familyForMarket("1/2"), "htft");
assert.equal(familyForMarket("MS 1"), "match_result");

const payload = {
  generated_at: "2026-09-18T00:00:00Z",
  matches: [{
    match_name: "A VS B",
    home: "A",
    away: "B",
    date: "2026-09-18",
    recommended_market: "MS 1",
    model_score: 72,
    analysis_score: 72,
    estimated_probability: 58,
    market_probability: 50,
    data_completeness: 82,
    independent_evidence: true,
    analysis_metrics: {
      memory: {
        home: { count: 8, bttsRate: 66, over25Rate: 70, over35Rate: 52, pointsPerGame: 1.9 },
        away: { count: 8, bttsRate: 62, over25Rate: 65, over35Rate: 48, pointsPerGame: 1.2 },
      },
      poisson: { homeLambda: 1.9, awayLambda: 1.5, totalLambda: 3.4 },
    },
    available_odds: { over25: 1.8, under25: 2.0, bttsYes: 1.75, bttsNo: 2.05 },
    analysis_options: [
      { market: "KG Var", odds: 1.78, model_score: 73, estimated_probability: 60, market_probability: 56, data_completeness: 80, independent_evidence: true },
      { market: "2.5 Üst", odds: 1.82, model_score: 74, estimated_probability: 61, market_probability: 55, data_completeness: 84, independent_evidence: true },
      { market: "3.5 Üst", odds: 2.45, model_score: 69, estimated_probability: 44, market_probability: 41, data_completeness: 84, independent_evidence: true },
      { market: "1/1", odds: 2.1, model_score: 66, estimated_probability: 48, market_probability: 47, data_completeness: 78, independent_evidence: true },
      { market: "1/2", odds: 16, model_score: 70, estimated_probability: 6, market_probability: 6.25, data_completeness: 78, independent_evidence: true, odds_verified: false },
      { market: "MS 1", odds: 1.9, model_score: 72, estimated_probability: 58, market_probability: 53, data_completeness: 82, independent_evidence: true },
      { market: "KG Yok", odds: 1.95, model_score: 50, estimated_probability: 40, market_probability: 51, data_completeness: 70, independent_evidence: true, odd_source_type: "raw_market_guess_odds" },
    ],
  }],
};

const output = runOrchestrator(payload);
assert.equal(output.matches.length, 1);
const match = output.matches[0];

assert.equal(match.recommended_market, "MS 1", "orkestratör ana tahmini sessizce değiştirmemeli");
assert.equal(match.specialist_router_version, VERSION);
assert.equal(match.specialist_outputs.btts.candidate_count, 1, "raw tahmini KG marketi uzman havuzuna girmemeli");
assert.ok(match.specialist_outputs.goals.candidate_count >= 2);
assert.equal(match.specialist_outputs.htft.candidate_count, 2);
assert.equal(match.specialist_outputs.match_result.candidate_count, 1);

const reversal = match.specialist_outputs.htft.candidates.find((row) => row.market === "1/2");
assert.equal(reversal.specialist_eligible, false, "doğrulanmamış ters İY/MS oranı fail-closed bloklanmalı");

assert.ok(output.specialist_orchestrator.candidate_count >= 6);
assert.ok(output.specialist_orchestrator.specialists.btts.ready_match_count >= 1);

console.log("robot-specialist-orchestrator.test.js OK");

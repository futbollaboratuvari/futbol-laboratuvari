"use strict";

const assert = require("node:assert/strict");
const { familyForMarket } = require("../scripts/robot-specialists/shared");
const { runOrchestrator, VERSION } = require("../scripts/robot-specialist-orchestrator");

assert.equal(VERSION, "robot-specialist-orchestrator-v3");
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

const htftFeed = {
  date: "2026-09-18",
  status: "ready",
  picks: [{
    date: "2026-09-18",
    home: "A",
    away: "B",
    match_name: "A VS B",
    market: "2/1",
    bookmaker_odds: 22,
    real_odds: 22,
    model_confidence: 74,
    scenario_probability: 8.2,
    data_completeness: 80,
    first_half_signal_source: "official_iddaa_first_half",
    first_half_signal_verified: true,
    openness_score: 0.62,
    first_half_direction_probability: 32,
    full_time_direction_probability: 38,
    identity_match_source: "date_teams",
    identity_match_score: 100,
    odds_verified: true,
    specialist_decision: "downgrade",
    specialist_eligible: true,
    specialist_quality_score: 65,
    reason: "Doğrulanmış resmî İddaa İY/MS feed adayı.",
  }],
};

const output = runOrchestrator(payload, { htftHighOdds: htftFeed });
assert.equal(output.matches.length, 1);
const match = output.matches[0];

assert.equal(match.recommended_market, "MS 1", "orkestratör ana tahmini sessizce değiştirmemeli");
assert.equal(match.specialist_router_version, VERSION);
assert.equal(match.specialist_outputs.btts.candidate_count, 1, "raw tahmini KG marketi uzman havuzuna girmemeli");
assert.ok(match.specialist_outputs.goals.candidate_count >= 2);
assert.equal(match.specialist_outputs.htft.candidate_count, 3);
assert.equal(match.specialist_outputs.htft.supplemental_candidate_count, 1);
assert.equal(output.specialist_orchestrator.specialists.htft.supplemental_candidate_count, 1);
assert.equal(output.specialist_orchestrator.feeds.htft_high_odds.verified_pick_count, 1);
assert.equal(match.specialist_outputs.match_result.candidate_count, 1);
assert.equal("candidates" in match.specialist_outputs.htft, false, "detay aday listesi robot-analysis içine ikinci kez kopyalanmamalı");

const supplementalDecision = match.specialist_market_decisions.find((row) => row.market === "2/1");
assert.equal(supplementalDecision?.source, "verified_high_odds_htft");
assert.equal(supplementalDecision?.eligible, true);
const supplementalOption = match.analysis_options.find((row) => (row.market || row.label) === "2/1");
assert.equal(supplementalOption?.specialist_source, "verified_high_odds_htft");
assert.equal(supplementalOption?.specialist_eligible, true);

const reversal = match.specialist_market_decisions.find((row) => row.market === "1/2");
assert.equal(reversal?.eligible, false, "doğrulanmamış ters İY/MS oranı fail-closed bloklanmalı");
assert.equal(match.analysis_options.find((row) => (row.market || row.label) === "1/2")?.specialist_eligible, false);

const staleOutput = runOrchestrator(payload, {
  htftHighOdds: { ...htftFeed, date: "2026-09-17", picks: htftFeed.picks.map((pick) => ({ ...pick, date: "2026-09-17" })) },
});
assert.equal(staleOutput.matches[0].specialist_outputs.htft.candidate_count, 2, "eski tarihli HTFT feed bugünkü maça taşınmamalı");
assert.equal(staleOutput.matches[0].analysis_options.some((row) => row.specialist_source === "verified_high_odds_htft"), false);

assert.equal(output.specialist_orchestrator.persistence_mode, "compact_decisions_v1");
assert.ok(output.specialist_orchestrator.candidate_count >= 6);
assert.doesNotMatch(JSON.stringify(match.specialist_outputs), /support_checks|market_specialist|candidates/);
assert.ok(output.specialist_orchestrator.specialists.btts.ready_match_count >= 1);

console.log("robot-specialist-orchestrator.test.js OK");

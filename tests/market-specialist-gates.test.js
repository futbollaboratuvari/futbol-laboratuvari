"use strict";

const assert = require("node:assert/strict");
const {
  VERSION,
  applyGenericMarketGate,
  applyGoalMarketGate,
  genericAdjustment,
  goalMarketAdjustment,
  htftAdjustment,
} = require("../scripts/market-specialist-gates");
const { selectHtftPicks } = require("../scripts/pro-market-specialist-postprocess");

assert.equal(VERSION, "market-specialist-gates-v3");

function memory(home, away) {
  return {
    home: { count: 8, ...home },
    away: { count: 8, ...away },
  };
}

(function bttsContradictionOnlyReducesSignalStrength() {
  const item = {
    market: "KG Var",
    selection: "KG Var",
    model_score: 72,
    analysis_score: 72,
    score: 72,
    estimated_probability: 58,
    analysis_metrics: {
      memory: memory({ bttsRate: 25 }, { bttsRate: 35 }),
    },
    pro_signals: [],
  };
  const adjustment = genericAdjustment(item);
  assert.equal(adjustment.delta, -3);
  const result = applyGenericMarketGate(item);
  assert.equal(result.model_score, 69);
  assert.equal(result.estimated_probability, 58);
  assert.equal(result.market_specialist.applied, true);
})();

(function compatibleBttsContextDoesNotDoubleRewardExistingModel() {
  const item = {
    market: "KG Var",
    model_score: 72,
    estimated_probability: 62,
    analysis_metrics: { memory: memory({ bttsRate: 70 }, { bttsRate: 65 }) },
  };
  const adjustment = genericAdjustment(item);
  assert.equal(adjustment.delta, 0);
  assert.equal(adjustment.applied, false);
})();

(function matchResultContradictionIsMarketSpecific() {
  const ms1 = genericAdjustment({
    market: "MS 1",
    analysis_metrics: { memory: memory({ pointsPerGame: 0.9 }, { pointsPerGame: 1.8 }) },
  });
  assert.equal(ms1.delta, -3);
  const ms2 = genericAdjustment({
    market: "MS 2",
    analysis_metrics: { memory: memory({ pointsPerGame: 1.8 }, { pointsPerGame: 0.9 }) },
  });
  assert.equal(ms2.delta, -3);
})();

(function sixPlusRequiresMultipleIndependentSupports() {
  const weak = goalMarketAdjustment({
    market: "6+ Gol",
    totalLambda: 3.0,
    over35Rate: 55,
    dataCompleteness: 65,
    completeRange: false,
  });
  assert.equal(weak.decision, "block");
  assert.equal(weak.eligible, false);
  assert.equal(weak.delta, -8);
  assert.ok(weak.support_count < 2);

  const borderline = goalMarketAdjustment({
    market: "6+ Gol",
    totalLambda: 3.5,
    over35Rate: 48,
    dataCompleteness: 78,
    completeRange: true,
  });
  assert.equal(borderline.decision, "downgrade");
  assert.equal(borderline.eligible, true);
  assert.equal(borderline.delta, -4);
  assert.ok(borderline.support_count >= 3);

  const strong = goalMarketAdjustment({
    market: "6+ Gol",
    totalLambda: 4.4,
    over35Rate: 58,
    dataCompleteness: 90,
    completeRange: true,
    preMatchDecision: "keep",
    sourceConflict: "none",
    lineupRisk: "Düşük",
    squadRisk: "Düşük",
  });
  assert.equal(strong.decision, "keep");
  assert.equal(strong.delta, 0);
  assert.equal(strong.eligible, true);
  assert.equal(strong.support_count, 4);
  assert.equal(strong.quality_score, 100);
})();

(function over35UsesSeparateLessExtremeGate() {
  const over35 = goalMarketAdjustment({
    market: "3.5 Üst",
    totalLambda: 2.4,
    over35Rate: 25,
    dataCompleteness: 80,
    completeRange: true,
  });
  assert.equal(over35.decision, "downgrade");
  assert.equal(over35.delta, -4);
  assert.equal(over35.eligible, true);

  const critical = goalMarketAdjustment({
    market: "3.5 Üst",
    totalLambda: 2.2,
    over35Rate: 25,
    dataCompleteness: 80,
    completeRange: true,
  });
  assert.equal(critical.decision, "block");
  assert.equal(critical.eligible, false);
})();

(function finalCheckAndSourceConflictCanBlockExtremeGoalPick() {
  const preMatchBlocked = goalMarketAdjustment({
    market: "6+ Gol",
    totalLambda: 4.4,
    over35Rate: 60,
    dataCompleteness: 90,
    completeRange: true,
    preMatchDecision: "block",
  });
  assert.equal(preMatchBlocked.decision, "block");

  const sourceBlocked = goalMarketAdjustment({
    market: "6+ Gol",
    totalLambda: 4.4,
    over35Rate: 60,
    dataCompleteness: 90,
    completeRange: true,
    sourceConflict: "high",
  });
  assert.equal(sourceBlocked.decision, "block");
})();

(function goalGateKeepsProbabilityUntouchedEvenWhenBlocked() {
  const candidate = {
    market: "6+ Gol",
    recommended_market: "6+ Gol",
    model_score: 71,
    analysis_score: 71,
    confidence_score: "71%",
    estimated_probability: 18.4,
    signals: [],
  };
  const result = applyGoalMarketGate(candidate, {
    totalLambda: 3.0,
    dataCompleteness: 65,
    completeRange: false,
  });
  assert.equal(result.model_score, 63);
  assert.equal(result.estimated_probability, 18.4);
  assert.equal(result.specialist_decision, "block");
  assert.equal(result.specialist_eligible, false);
})();

(function htftDerivedHalfSignalIsBlocked() {
  const derived = htftAdjustment({
    market: "1/2",
    firstHalfSource: "derived_from_full_time_direction",
    firstHalfVerified: false,
    openness: 0.60,
    dataCompleteness: 72,
    scenarioProbability: 4.2,
    oddsVerified: true,
    identityScore: 100,
    identitySource: "date_teams",
  });
  assert.equal(derived.decision, "block");
  assert.equal(derived.eligible, false);
  assert.equal(derived.delta, -8);
})();

(function htftVerifiedSignalCanPassAndBorderlineSignalDowngrades() {
  const verified = htftAdjustment({
    market: "2/1",
    firstHalfSource: "detail_market_candidates",
    firstHalfVerified: true,
    openness: 0.60,
    dataCompleteness: 72,
    scenarioProbability: 4.2,
    oddsVerified: true,
    identityScore: 100,
    identitySource: "date_teams",
    sourceConflict: "none",
    lineupRisk: "Düşük",
    squadRisk: "Düşük",
  });
  assert.equal(verified.decision, "keep");
  assert.equal(verified.delta, 0);
  assert.equal(verified.eligible, true);
  assert.equal(verified.quality_score, 100);

  const borderline = htftAdjustment({
    market: "1/2",
    firstHalfSource: "detail_market_candidates",
    firstHalfVerified: true,
    openness: 0.49,
    dataCompleteness: 60,
    scenarioProbability: 3.1,
    oddsVerified: true,
    identityScore: 82,
    identitySource: "date_time_team_similarity",
  });
  assert.equal(borderline.decision, "downgrade");
  assert.equal(borderline.eligible, true);
  assert.equal(borderline.delta, -4);
})();

(function htftOfficialOddAndIdentityRemainMandatory() {
  const noOfficialOdd = htftAdjustment({
    market: "1/2",
    firstHalfSource: "detail_market_candidates",
    firstHalfVerified: true,
    openness: 0.65,
    dataCompleteness: 80,
    scenarioProbability: 5,
    oddsVerified: false,
  });
  assert.equal(noOfficialOdd.decision, "block");

  const highConflict = htftAdjustment({
    market: "2/1",
    firstHalfSource: "detail_market_candidates",
    firstHalfVerified: true,
    openness: 0.65,
    dataCompleteness: 80,
    scenarioProbability: 5,
    oddsVerified: true,
    sourceConflict: "high",
  });
  assert.equal(highConflict.decision, "block");
})();

(function fullHtftPoolIsRankedAfterSpecialistBlocking() {
  const base = {
    date: "2099-01-01",
    market: "1/2",
    bookmaker_odds: 18.5,
    odds_verified: true,
    first_half_signal_source: "detail_market_candidates",
    first_half_signal_verified: true,
    openness_score: 0.64,
    data_completeness: 80,
    scenario_probability: 5.2,
    identity_match_score: 100,
    identity_match_source: "date_teams",
    risk_level: "Yüksek",
    reason: "test",
  };
  const pool = [
    {
      ...base,
      match_name: "Blocked Leader VS Test",
      model_confidence: 92,
      first_half_signal_source: "derived_from_full_time_direction",
      first_half_signal_verified: false,
    },
    { ...base, match_name: "Eligible One VS Test", model_confidence: 86 },
    { ...base, match_name: "Eligible Two VS Test", model_confidence: 82, market: "2/1" },
    { ...base, match_name: "Eligible Three VS Test", model_confidence: 78 },
  ];
  const result = selectHtftPicks(pool, new Map(), 3);
  assert.equal(result.evaluated.length, 4);
  assert.equal(result.rejected.length, 1);
  assert.equal(result.selected.length, 3);
  assert.ok(result.selected.every((pick) => pick.first_half_signal_verified === true));
  assert.ok(!result.selected.some((pick) => pick.match_name.includes("Blocked Leader")));
  assert.ok(result.selected.some((pick) => pick.match_name.includes("Eligible Three")));
})();

process.stdout.write("market-specialist-gates tests passed\n");

(function v3GoalConsensusBlocksMarketContradiction() {
  const blocked = goalMarketAdjustment({
    market: "6+ Gol",
    totalLambda: 4.2,
    over35Rate: 58,
    dataCompleteness: 88,
    completeRange: true,
    goalConsensus: 0.40,
  });
  assert.equal(blocked.decision, "block");
  assert.equal(blocked.eligible, false);

  const strong = goalMarketAdjustment({
    market: "6+ Gol",
    totalLambda: 4.2,
    over35Rate: 58,
    dataCompleteness: 88,
    completeRange: true,
    goalConsensus: 0.62,
  });
  assert.equal(strong.decision, "keep");
  assert.equal(strong.eligible, true);
})();

(function v3HtftRequiresDirectionalAndValueCoherence() {
  const poorValue = htftAdjustment({
    market: "1/2",
    firstHalfSource: "official_iddaa_first_half",
    firstHalfVerified: true,
    openness: 0.62,
    dataCompleteness: 80,
    scenarioProbability: 3.0,
    bookmakerOdds: 12.0,
    firstHalfDirectionProbability: 34,
    fullTimeDirectionProbability: 34,
    oddsVerified: true,
    identityScore: 100,
    identitySource: "date_teams",
  });
  assert.equal(poorValue.decision, "block");

  const weakDirection = htftAdjustment({
    market: "2/1",
    firstHalfSource: "official_iddaa_first_half",
    firstHalfVerified: true,
    openness: 0.62,
    dataCompleteness: 80,
    scenarioProbability: 4.8,
    bookmakerOdds: 14.0,
    firstHalfDirectionProbability: 20,
    fullTimeDirectionProbability: 36,
    oddsVerified: true,
    identityScore: 100,
    identitySource: "date_teams",
  });
  assert.equal(weakDirection.decision, "block");

  const coherent = htftAdjustment({
    market: "2/1",
    firstHalfSource: "official_iddaa_first_half",
    firstHalfVerified: true,
    openness: 0.62,
    dataCompleteness: 80,
    scenarioProbability: 5.5,
    bookmakerOdds: 14.0,
    firstHalfDirectionProbability: 32,
    fullTimeDirectionProbability: 35,
    oddsVerified: true,
    identityScore: 100,
    identitySource: "date_teams",
  });
  assert.equal(coherent.decision, "keep");
  assert.ok(coherent.value_ratio >= 0.7);
})();

"use strict";

const assert = require("node:assert/strict");
const rules = require("../pro-coupon-eligibility");
const {
  applyPreMatchFinalCheck,
  buildFinalCheckForMatch,
  canonicalMarketKey,
  checkpointFor,
  evaluateGeneral,
  evaluateMarket,
  minutesToKickoff,
  verifiedMarketOdd,
} = require("../scripts/pre-match-final-check");

const kickoff = { date: "2026-09-18", time: "22:00", home: "Alpha", away: "Beta", match_name: "Alpha VS Beta" };
assert.equal(checkpointFor(62), "T60");
assert.equal(checkpointFor(31), "T30");
assert.equal(checkpointFor(9), "T10");
assert.equal(checkpointFor(90), null);
assert.equal(minutesToKickoff(kickoff, Date.parse("2026-09-18T21:30:00+03:00")), 30);

assert.equal(canonicalMarketKey("KG Var"), "bttsYes");
assert.equal(canonicalMarketKey("3.5 Üst"), "over35");
assert.equal(canonicalMarketKey("1/2"), "htft12");

const namedOdds = {
  available_odds: { bttsYes: 1.92 },
  raw_market_guess_odds: { bttsYes: 9.99 },
};
assert.deepEqual(verifiedMarketOdd(namedOdds, "bttsYes"), { odd: 1.92, source: "verified_named_field:bttsYes" });
assert.equal(verifiedMarketOdd({ raw_market_guess_odds: { bttsYes: 1.80 } }, "bttsYes"), null);

const previous = { tracked_market_key: "bttsYes", odd: 1.80 };
const warningMove = evaluateMarket({ checkpoint: "T30", marketKey: "bttsYes", currentOdd: { odd: 1.96 }, previousSnapshot: previous });
assert.equal(warningMove.decision, "downgrade");
assert.equal(warningMove.severe_adverse, false);
assert.ok(warningMove.relative_odd_change_percent >= 8);

const severeMove = evaluateMarket({ checkpoint: "T10", marketKey: "bttsYes", currentOdd: { odd: 2.03 }, previousSnapshot: previous });
assert.equal(severeMove.decision, "downgrade");
assert.equal(severeMove.severe_adverse, true);
assert.ok(severeMove.relative_odd_change_percent >= 12);

const t10NoLineup = evaluateGeneral({
  checkpoint: "T10",
  lineup: { lineup_risk_level: "Düşük", home_lineup: { lineup_confirmed: false }, away_lineup: { lineup_confirmed: false } },
  consensus: { conflict_level: "none", confidence_score: 75 },
  lineupAgeMinutes: 8,
  newsAgeMinutes: 30,
  previousSnapshot: null,
});
assert.equal(t10NoLineup.decision, "downgrade");

const highConflict = evaluateGeneral({
  checkpoint: "T30",
  lineup: { lineup_risk_level: "Düşük", home_lineup: { lineup_confirmed: true }, away_lineup: { lineup_confirmed: true } },
  consensus: { conflict_level: "high", confidence_score: 70 },
  lineupAgeMinutes: 10,
  newsAgeMinutes: 20,
  previousSnapshot: null,
});
assert.equal(highConflict.decision, "block");

const baseItem = {
  recommended_market: "KG Var",
  market: "KG Var",
  selection: "KG Var",
  model_score: 72,
  analysis_score: 72,
  estimated_probability: 62,
  market_probability: 56,
  edge_percent: 6,
  estimated_odds: 1.80,
  odds: 1.80,
  data_completeness: 58,
  independent_evidence: true,
  risk_level: "Orta",
  data_gap_risk: "Düşük",
  squad_risk_level: "Düşük",
  lineup_risk_level: "Düşük",
  include_in_coupon: true,
};
assert.equal(rules.isCouponEligible(baseItem), true);

const downgradedItem = {
  ...baseItem,
  team_intelligence: { pre_match_final_check: { active: true, decision: "downgrade", checkpoint: "T10" } },
};
assert.equal(rules.effectiveModelScore(downgradedItem), 68);
assert.equal(rules.effectiveCompleteness(downgradedItem), 55);
assert.equal(rules.isCouponEligible(downgradedItem), true);

const marginalDowngraded = { ...downgradedItem, model_score: 68, analysis_score: 68 };
assert.equal(rules.effectiveModelScore(marginalDowngraded), 64);
assert.equal(rules.isCouponEligible(marginalDowngraded), false);

const blockedItem = {
  ...baseItem,
  team_intelligence: { pre_match_final_check: { active: true, decision: "block", checkpoint: "T10" } },
};
assert.equal(rules.hasBlockingRisk(blockedItem), true);
assert.equal(rules.isCouponEligible(blockedItem), false);

const probabilityBefore = baseItem.estimated_probability;
const applied = applyPreMatchFinalCheck(baseItem, {
  active: true,
  checkpoint: "T10",
  tracked_market_key: "bttsYes",
  general_decision: "downgrade",
  general_score_penalty: 4,
  market_decision: "keep",
  market_score_penalty: 0,
  market_severe_adverse: false,
  reasons: ["T10 test"],
});
assert.equal(applied.model_score, 68);
assert.equal(applied.estimated_probability, probabilityBefore);

const lineupDb = {
  generated_at: "2026-09-18T18:50:00.000Z",
  matches: [{
    match_name: "Alpha VS Beta", date: "2026-09-18", lineup_risk_level: "Orta",
    home_lineup: { lineup_confirmed: false }, away_lineup: { lineup_confirmed: false },
  }],
};
const consensusDb = {
  generated_at: "2026-09-18T18:50:00.000Z",
  matches: [{ match_name: "Alpha VS Beta", date: "2026-09-18", conflict_level: "medium", confidence_score: 55 }],
};
const analysisDb = { matches: [{ match_name: "Alpha VS Beta", date: "2026-09-18", recommended_market: "KG Var" }] };
const previousDb = { matches: [{ match_name: "Alpha VS Beta", date: "2026-09-18", snapshots: { T60: { tracked_market_key: "bttsYes", odd: 1.80, lineup_risk_level: "Düşük" } } }] };
const fixture = { ...kickoff, available_odds: { bttsYes: 2.03 } };
const context = {
  now: Date.parse("2026-09-18T21:30:00+03:00"),
  lineupMap: new Map([["2026-09-18|alpha vs beta", lineupDb.matches[0]], ["alpha vs beta", lineupDb.matches[0]]]),
  consensusMap: new Map([["2026-09-18|alpha vs beta", consensusDb.matches[0]], ["alpha vs beta", consensusDb.matches[0]]]),
  analysisMap: new Map([["2026-09-18|alpha vs beta", analysisDb.matches[0]], ["alpha vs beta", analysisDb.matches[0]]]),
  previousMap: new Map([["2026-09-18|alpha vs beta", previousDb.matches[0]], ["alpha vs beta", previousDb.matches[0]]]),
  teamNews: { teams: {} },
  lineupGeneratedAt: lineupDb.generated_at,
  consensusGeneratedAt: consensusDb.generated_at,
};
const combined = buildFinalCheckForMatch(fixture, context);
assert.equal(combined.checkpoint, "T30");
assert.equal(combined.market_severe_adverse, true);
assert.equal(combined.general_decision, "downgrade");
assert.equal(combined.decision, "block");

process.stdout.write("pre-match-final-check.test.js OK\n");

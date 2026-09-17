"use strict";

const assert = require("node:assert/strict");
const couponRules = require("../pro-coupon-eligibility");
const {
  analyzeOver35,
  analyzeSixPlus,
  findMarketOdd,
  poissonAtLeast,
  sanitizeCoupon,
} = require("../scripts/pro-goal-market-bridge");

const highGoalFixture = {
  id: "goal-test-1",
  date: "2099-01-01",
  time: "20:00",
  league: "Test Gol Ligi",
  home: "Gol City",
  away: "Attack United",
  squad_risk_level: "Düşük",
  lineup_risk_level: "Orta",
  available_odds: {
    over35: 2.05,
    under35: 1.72,
    goals6plus: 4.50,
    goals01: 8.00,
    goals23: 2.40,
    goals45: 2.60,
  },
  metrics: {
    over35Percent: 60,
    poisson: {
      homeLambda: 2.50,
      awayLambda: 2.00,
    },
  },
};

assert.equal(findMarketOdd([highGoalFixture], "over35"), 2.05);
assert.equal(findMarketOdd([highGoalFixture], "goals6plus"), 4.5);
assert.ok(poissonAtLeast(4.5, 6) > 25);

const over35 = analyzeOver35([highGoalFixture]);
assert.ok(over35);
assert.equal(over35.recommended_market, "3.5 Üst");
assert.equal(over35.estimated_odds, "2.05");
assert.equal(over35.independent_evidence, true);
assert.equal(over35.include_in_coupon, true);
assert.ok(over35.model_score >= 65);
assert.ok(Math.abs(over35.edge_percent - (over35.estimated_probability - over35.market_probability)) <= 0.2);

const sixPlus = analyzeSixPlus([highGoalFixture]);
assert.ok(sixPlus);
assert.equal(sixPlus.recommended_market, "6+ Gol");
assert.equal(sixPlus.estimated_odds, "4.50");
assert.equal(sixPlus.independent_evidence, true);
assert.equal(sixPlus.include_in_coupon, true);
assert.ok(sixPlus.estimated_probability >= 15);
assert.ok(sixPlus.edge_percent >= 2);
assert.ok(sixPlus.model_score >= 68);
assert.ok(Math.abs(sixPlus.edge_percent - (sixPlus.estimated_probability - sixPlus.market_probability)) <= 0.2);

assert.equal(couponRules.isCouponEligible({
  ...sixPlus,
  include_in_coupon: true,
}), true);

const weakCanonicalEdge = {
  ...sixPlus,
  estimated_probability: Number((sixPlus.market_probability + 1.9).toFixed(1)),
  edge_percent: 1.9,
  include_in_coupon: true,
};
assert.equal(couponRules.isCouponEligible(weakCanonicalEdge), false);

assert.equal(couponRules.isCouponEligible({
  recommended_market: "MS 1",
  estimated_odds: "1.30",
  model_score: 80,
  estimated_probability: 70,
  market_probability: 65,
  edge_percent: 5,
  data_completeness: 80,
  independent_evidence: true,
  risk_level: "Orta",
  data_gap_risk: "Düşük",
  include_in_coupon: true,
}), false);

const lowOddCoupon = {
  coupon_name: "Dengeli Kupon",
  coupon_type: "balanced",
  selected_matches: [{
    match_name: "Low Odd FC VS Filter SK",
    recommended_market: "MS 1",
    estimated_odds: "1.30",
    model_score: 80,
    analysis_score: 80,
    estimated_probability: 70,
    market_probability: 65,
    edge_percent: 5,
    data_completeness: 80,
    independent_evidence: true,
    include_in_coupon: true,
    risk_level: "Orta",
    data_gap_risk: "Düşük",
  }],
  total_odds: "1.30",
  is_available: true,
};

const sanitized = sanitizeCoupon(lowOddCoupon);
assert.equal(sanitized.is_available, false);
assert.equal(sanitized.selected_matches.length, 0);

const labelFixture = {
  detail_market_candidates: [
    { market: "Toplam Gol", option: "6+ Gol", odd: "5,20", market_identity_verified: true },
    { market: "Toplam Gol 3.5", option: "3.5 Üst", odd: "2,15", market_identity_verified: true },
  ],
};
assert.equal(findMarketOdd([labelFixture], "goals6plus"), 5.2);
assert.equal(findMarketOdd([labelFixture], "over35"), 2.15);

const rawOnlyFixture = {
  raw_market_guess_odds: { over35: 2.05, goals6plus: 5.20 },
  raw_market_blocks: [
    { market: "Toplam Gol", option: "6+ Gol", odd: "5,20" },
    { market: "Toplam Gol 3.5", option: "3.5 Üst", odd: "2,15" },
  ],
};
assert.equal(findMarketOdd([rawOnlyFixture], "goals6plus"), null, "raw guessed 6+ price must never feed specialist");
assert.equal(findMarketOdd([rawOnlyFixture], "over35"), null, "raw guessed 3.5 price must never feed specialist");

const explicitlyUnverifiedLabel = {
  detail_market_candidates: [
    { market: "Toplam Gol 3.5", option: "3.5 Üst", odd: "2,15", market_identity_verified: false },
  ],
};
assert.equal(findMarketOdd([explicitlyUnverifiedLabel], "over35"), null);

const percentMasqueradingAsOdd = {
  raw_market_guess_odds: { over25: 1.78 },
  raw_market_blocks: [
    { market: "Toplam Gol 3.5", option: "3.5 Üst", value: "17.50" },
  ],
  metrics: {
    over35: 17.5,
    over35Percent: 67,
  },
};
assert.equal(findMarketOdd([percentMasqueradingAsOdd], "over35"), null);

const staleBridgeFixture = {
  goal_market_bridge_version: "pro-goal-market-bridge-v1",
  available_odds: { over25: 1.78, over35: 17.50 },
  odds: { over25: 1.78, over35: 17.50 },
  raw_market_guess_odds: { over25: 1.78 },
};
assert.equal(findMarketOdd([staleBridgeFixture], "over35"), null);

process.stdout.write("pro-goal-market-bridge.test.js OK\n");
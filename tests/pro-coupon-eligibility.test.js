"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const rules = require("../pro-coupon-eligibility");

const verified = {
  id: "coupon",
  recommended_market: "2.5 Üst",
  model_score: 76,
  estimated_probability: 64,
  market_probability: 56,
  edge_percent: 8,
  estimated_odds: 1.80,
  data_completeness: 72,
  independent_evidence: true,
  risk_level: "Orta",
  squad_risk_level: "Düşük",
  lineup_risk_level: "Orta",
  include_in_coupon: true,
};

assert.equal(rules.isCouponEligible(verified), true);
assert.equal(rules.isCouponEligible({ ...verified, independent_evidence: false }), false);
assert.equal(rules.isCouponEligible({ ...verified, lineup_risk_level: "Yüksek" }), false);
assert.equal(rules.isCouponEligible({ ...verified, recommended_market: "Seçim yok" }), false);
assert.equal(rules.isCouponEligible({ ...verified, estimated_probability: 41.9, market_probability: 38, edge_percent: 3.9 }), false);
assert.equal(rules.isCouponEligible({ ...verified, estimated_odds: null, odds: null, odd: null }), false);

assert.deepEqual(rules.valueThresholdForOdd(1.50), { min_edge: 8, min_ev: 1.06, min_model_score: 76, min_completeness: 68, band: "1.45-1.59" });
assert.deepEqual(rules.valueThresholdForOdd(1.70), { min_edge: 6, min_ev: 1.05, min_model_score: 73, min_completeness: 65, band: "1.60-1.89" });
assert.deepEqual(rules.valueThresholdForOdd(2.10), { min_edge: 5, min_ev: 1.05, min_model_score: 71, min_completeness: 62, band: "1.90-2.49" });
assert.deepEqual(rules.valueThresholdForOdd(3.00), { min_edge: 6, min_ev: 1.07, min_model_score: 73, min_completeness: 65, band: "2.50-3.49" });
assert.deepEqual(rules.valueThresholdForOdd(4.00), { min_edge: 8, min_ev: 1.10, min_model_score: 76, min_completeness: 70, band: "3.50+" });

const lowOddWeakValue = {
  ...verified,
  model_score: 78,
  estimated_odds: 1.50,
  estimated_probability: 72,
  market_probability: 66,
  edge_percent: 6,
  data_completeness: 72,
};
assert.equal(rules.valueQuality(lowOddWeakValue).pass, false);

const lowOddStrongValue = {
  ...lowOddWeakValue,
  estimated_probability: 76,
  market_probability: 67,
  edge_percent: 9,
};
assert.equal(rules.valueQuality(lowOddStrongValue).pass, true);

const mediumWeakEdge = {
  ...verified,
  estimated_odds: 1.80,
  estimated_probability: 60,
  market_probability: 57,
  edge_percent: 3,
};
assert.equal(rules.valueQuality(mediumWeakEdge).pass, false);

const normalValue = {
  ...verified,
  estimated_odds: 2.10,
  model_score: 74,
  estimated_probability: 57,
  market_probability: 51,
  edge_percent: 6,
  data_completeness: 70,
};
assert.equal(rules.valueQuality(normalValue).pass, true);

const highOddTrap = {
  ...verified,
  estimated_odds: 4.00,
  model_score: 78,
  estimated_probability: 30,
  market_probability: 25,
  edge_percent: 5,
  data_completeness: 75,
};
assert.equal(rules.valueQuality(highOddTrap).pass, false);

const highOddRealValue = {
  ...highOddTrap,
  estimated_probability: 34,
  market_probability: 25,
  edge_percent: 9,
};
assert.equal(rules.valueQuality(highOddRealValue).pass, true);

const inconsistentEdge = {
  ...verified,
  estimated_odds: 2.00,
  estimated_probability: 58,
  market_probability: 52,
  edge_percent: 10,
};
const inconsistentResult = rules.valueQuality(inconsistentEdge);
assert.equal(inconsistentResult.pass, false);
assert.match(inconsistentResult.reason, /Edge tutarsız/);

const goalBridgeEdge = {
  ...verified,
  recommended_market: "3.5 Üst",
  model_version: "pro-goal-market-bridge-v2",
  goal_market_bridge: true,
  model_score: 74,
  estimated_odds: 2.05,
  estimated_probability: 58.7,
  market_probability: 45.6,
  edge_percent: 18.1,
  data_completeness: 80,
};
const goalBridgeResult = rules.valueQuality(goalBridgeEdge);
assert.equal(goalBridgeResult.pass, true);
assert.equal(goalBridgeResult.edge_normalized, true);
assert.equal(goalBridgeEdge.edge_percent, 13.1);
assert.equal(rules.meetsCouponCriteria(goalBridgeEdge), true);

const zeroEdge = {
  ...verified,
  estimated_odds: 2.00,
  estimated_probability: 52,
  market_probability: 52,
  edge_percent: 0,
};
assert.equal(rules.valueQuality(zeroEdge).pass, false);
assert.equal(rules.meetsCouponCriteria(zeroEdge), false);

const proReady = {
  ...verified,
  id: "pro",
  include_in_coupon: false,
  model_score: 74,
  estimated_probability: 62,
  market_probability: 55,
  edge_percent: 7,
  estimated_odds: 1.80,
  data_completeness: 68,
};
const watch = {
  ...verified,
  id: "watch",
  include_in_coupon: false,
  independent_evidence: false,
  model_score: 80,
};
const blocked = {
  ...proReady,
  id: "blocked",
  lineup_risk_level: "Yüksek",
};

const selected = rules.selectStrongestMatches([watch, blocked, proReady, verified], 6);
assert.deepEqual(selected.map((item) => item.id), ["coupon", "pro", "watch", "blocked"]);
assert.deepEqual(selected.map((item) => item.insight_tier), ["coupon", "pro_ready", "watch", "watch"]);
assert.equal(selected.find((item) => item.id === "blocked").insight_tier, "watch");

const root = path.join(__dirname, "..");
const ui = fs.readFileSync(path.join(root, "analysis-insights-v1.js"), "utf8");
assert.match(ui, /FLCouponEligibility/);
assert.match(ui, /pro-coupon-eligibility\.js/);
assert.match(ui, /İzleme görüşü · Kupona uygun değil/);
assert.match(ui, /Bileşik değerlendirme puanı sonuç olasılığı değildir/);

process.stdout.write("pro-coupon-eligibility.test.js OK\n");

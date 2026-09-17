"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const rules = require("../pro-coupon-eligibility");

const verified = {
  id: "coupon",
  recommended_market: "2.5 Üst",
  model_score: 68,
  estimated_probability: 62,
  market_probability: 56,
  edge_percent: 6,
  estimated_odds: 1.80,
  data_completeness: 55,
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

assert.deepEqual(rules.valueThresholdForOdd(1.50), { min_edge: 6, min_ev: 1.04, min_model_score: 70, band: "1.45-1.59" });
assert.deepEqual(rules.valueThresholdForOdd(1.70), { min_edge: 4, min_ev: 1.03, min_model_score: 67, band: "1.60-1.89" });
assert.deepEqual(rules.valueThresholdForOdd(2.10), { min_edge: 3, min_ev: 1.03, min_model_score: 65, band: "1.90-2.49" });
assert.deepEqual(rules.valueThresholdForOdd(3.00), { min_edge: 4, min_ev: 1.04, min_model_score: 65, band: "2.50-3.49" });
assert.deepEqual(rules.valueThresholdForOdd(4.00), { min_edge: 5, min_ev: 1.06, min_model_score: 68, band: "3.50+" });

const lowOddWeakValue = {
  ...verified,
  model_score: 72,
  estimated_odds: 1.50,
  estimated_probability: 70,
  market_probability: 66,
  edge_percent: 4,
};
assert.equal(rules.valueQuality(lowOddWeakValue).pass, false);

const lowOddStrongValue = {
  ...lowOddWeakValue,
  estimated_probability: 74,
  market_probability: 67,
  edge_percent: 7,
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
  model_score: 67,
  estimated_probability: 55,
  market_probability: 51,
  edge_percent: 4,
};
assert.equal(rules.valueQuality(normalValue).pass, true);

const highOddTrap = {
  ...verified,
  estimated_odds: 4.00,
  model_score: 70,
  estimated_probability: 29,
  market_probability: 25,
  edge_percent: 4,
};
assert.equal(rules.valueQuality(highOddTrap).pass, false);

const highOddRealValue = {
  ...highOddTrap,
  estimated_probability: 31,
  market_probability: 25,
  edge_percent: 6,
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
  model_score: 62,
  estimated_probability: 58,
  market_probability: 53,
  edge_percent: 5,
  estimated_odds: 1.80,
  data_completeness: 38,
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

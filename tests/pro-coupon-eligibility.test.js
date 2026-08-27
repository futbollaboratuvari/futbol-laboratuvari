"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const rules = require("../pro-coupon-eligibility");

const verified = {
  id: "coupon",
  recommended_market: "2.5 Üst",
  model_score: 68,
  estimated_probability: 55,
  data_completeness: 48,
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
assert.equal(rules.isCouponEligible({ ...verified, estimated_probability: 41.9 }), false);

const proReady = {
  ...verified,
  id: "pro",
  include_in_coupon: false,
  model_score: 62,
  estimated_probability: null,
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
assert.match(ui, /Bileşik güven skoru sonuç olasılığı değildir/);

process.stdout.write("pro-coupon-eligibility.test.js OK\n");


"use strict";

const assert = require("node:assert/strict");
const { MODEL_VERSION, buildBttsAnalysis, scoreFixture, buildCouponAnalysis, _internals } = require("../scripts/robot-exact-scoring.js");

const test = (name, fn) => {
  try {
    fn();
    process.stdout.write(`✓ ${name}\n`);
  } catch (error) {
    process.stderr.write(`✗ ${name}\n`);
    throw error;
  }
};

const today = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const base = (extra = {}) => ({
  date: today(),
  time: "23:30",
  status: "scheduled",
  league: "Test Ligi",
  home: "Test Ev",
  away: "Test Dep",
  ...extra,
});

test("gol sinyalleri 1X2 dış saha uzun oranını yapay biçimde yükseltmez", () => {
  const result = scoreFixture(base({
    ms1: 1.3,
    msx: 5,
    ms2: 6.5,
    over25Percent: 90,
    bttsPercent: 88,
    leagueGoalAverage: 3.8,
    metric_quality: "verified",
  }));
  assert.equal(result.market, "MS 1");
  assert.notEqual(result.market, "MS 2");
});

test("doğrulanmış gol metriği markete özel olasılık ve pozitif fark üretir", () => {
  const result = scoreFixture(base({
    over25: 2,
    under25: 2,
    over25Percent: 74,
    bttsPercent: 61,
    leagueGoalAverage: 3.05,
    metric_quality: "verified",
  }));
  assert.equal(result.market, "2.5 Üst");
  assert.ok(result.estimated_probability > result.market_probability);
  assert.ok(result.edge_percent > 0);
  assert.equal(result.model_version, MODEL_VERSION);
});

test("resmi KG Var/Yok çifti tek pazar olarak marjdan arındırılır", () => {
  const fixture = base({
    available_odds: { bttsYes: 1.82, bttsNo: 1.96 },
    oddsSource: "iddaa.com resmi futbol bülteni",
    bttsPercent: 63,
    metric_quality: "verified",
  });
  const fair = _internals.fairProbabilityFor(fixture, "kgVar", {
    odd: 1.82,
    source: "standard",
    key: "bttsYes",
  });
  const analysis = buildBttsAnalysis(fixture);
  assert.equal(fair.complete, true);
  assert.ok(Math.abs((analysis.outcomes.bttsYes.market_probability + analysis.outcomes.bttsNo.market_probability) - 100) < 0.2);
  assert.equal(analysis.pair_complete, true);
  assert.equal(analysis.trusted_odds, true);
  assert.equal(analysis.outcomes.bttsYes.odd_source_type, "standard");
  assert.match(analysis.outcomes.bttsYes.signals.join(" "), /Marjı temizlenmiş piyasa olasılığı/);
});

test("KG modeli iki tarafı da ayrı olasılık, risk ve gerekçeyle analiz eder", () => {
  const analysis = buildBttsAnalysis(base({
    available_odds: { bttsYes: 1.72, bttsNo: 2.08 },
    bttsPercent: 68,
    leagueGoalAverage: 3.1,
    metric_quality: "verified",
  }));
  assert.equal(analysis.available, true);
  assert.ok(analysis.outcomes.bttsYes.model_score > 0);
  assert.ok(analysis.outcomes.bttsNo.model_score > 0);
  assert.ok(["Düşük", "Orta", "Yüksek"].includes(analysis.outcomes.bttsYes.risk_level));
  assert.ok(analysis.outcomes.bttsYes.signals.length >= 3);
  assert.equal(analysis.model_version, MODEL_VERSION);
});

test("proxy metrik doğrulanmış metriğe göre veri kapsamını ve model gücünü düşürür", () => {
  const input = {
    over25: 2,
    under25: 2,
    over25Percent: 74,
    bttsPercent: 61,
    leagueGoalAverage: 3.05,
  };
  const verified = scoreFixture(base({ ...input, metric_quality: "verified" }));
  const proxy = scoreFixture(base({ ...input, metric_quality: "proxy_odds" }));
  assert.ok(verified.data_completeness > proxy.data_completeness);
  assert.ok(verified.model_score >= proxy.model_score);
});

test("yüksek oran tek başına değer etiketi veya dış saha seçimi oluşturmaz", () => {
  const result = scoreFixture(base({ ms1: 1.3, msx: 5, ms2: 6.5 }));
  assert.equal(result.market, "MS 1");
  assert.notEqual(result.value_label, "Yüksek Değer");
  assert.ok(result.estimated_probability > 50);
  assert.equal(result.independent_evidence, false);
  assert.equal(result.risk, "Yüksek");
});

test("model gücü ile sonuç olasılığı ayrı semantik alanlarda tutulur", () => {
  const result = scoreFixture(base({ ms1: 1.55, msx: 4, ms2: 5.8 }));
  assert.equal(result.score_type, "signal_strength");
  assert.equal(result.model_score, result.analysis_score);
  assert.equal(typeof result.estimated_probability, "number");
  assert.notEqual(result.trust_score, result.lab_probability);
});

test("kupon olasılığı ayak olasılıklarının çarpımıyla küçülür", () => {
  const fixtures = [
    base({ home: "A", away: "B", over25: 1.8, under25: 2.1, over25Percent: 70, metric_quality: "verified" }),
    base({ home: "C", away: "D", over25: 1.85, under25: 2.05, over25Percent: 69, metric_quality: "verified" }),
    base({ home: "E", away: "F", over25: 1.9, under25: 2, over25Percent: 68, metric_quality: "verified" }),
  ];
  const coupon = buildCouponAnalysis(fixtures);
  const multi = coupon.doubles[0] || coupon.triples[0];
  if (multi) {
    assert.ok(multi.estimated_probability < Math.min(...multi.legs.map((leg) => leg.estimated_probability)));
  } else {
    assert.ok(coupon.scored.every((item) => item.estimated_probability > 0));
  }
});

process.stdout.write("PRO 13 market-koşullu model testleri tamamlandı.\n");

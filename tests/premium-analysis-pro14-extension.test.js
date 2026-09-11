"use strict";

const assert = require("node:assert/strict");
const extension = require("../premium-analysis-pro14-extension.js");

const test = (name, fn) => {
  try {
    fn();
    process.stdout.write(`✓ ${name}\n`);
  } catch (error) {
    process.stderr.write(`✗ ${name}\n`);
    throw error;
  }
};

const normalized = (extra = {}) => ({
  date: "2026-09-12",
  time: "20:00",
  home: "A",
  away: "B",
  timestamp: Date.now() + 3600000,
  status: "scheduled",
  odds: {
    ms1: 2.4,
    msx: 3.1,
    ms2: 2.7,
    firstHalfHome: 3.1,
    firstHalfDraw: 2.05,
    firstHalfAway: 3.8,
  },
  metrics: {
    poissonHome: 1.8,
    poissonAway: 1.35,
    over35: 49,
  },
  pro: {
    independentEvidence: true,
    squadRiskLevel: "Orta",
    lineupRiskLevel: "Belirsiz",
    calibration: null,
  },
  source: {},
  ...extra,
});

test("1/2 ve 2/1 marketleri kanonik olarak tanınır", () => {
  assert.equal(extension.canonicalMarket("İY/MS 1/2"), "htft12");
  assert.equal(extension.canonicalMarket("İY/MS 2/1"), "htft21");
});

test("tam dokuzlu İY/MS marketi doğrudan oranı korur ama otomatik kupona açılmaz", () => {
  const source = {
    htft11: 4.5, htft1x: 14, htft12: 24,
    htftx1: 6.5, htftxx: 5.2, htftx2: 7.2,
    htft21: 19, htft2x: 15, htft22: 5.4,
  };
  const result = extension.analyzeHtft(normalized({ source }), "htft12");
  assert.equal(result.market, "İY/MS 1/2");
  assert.equal(result.odd, 24);
  assert.equal(result.dataCompleteness, 100);
  assert.equal(result.risk, "Yüksek");
  assert.equal(result.couponEligible, false);
  assert.ok(Number.isFinite(result.estimatedProbability));
  assert.ok(Number.isFinite(result.marketProbability));
});

test("İY/MS doğrudan oranı yoksa fiyat uydurulmaz", () => {
  const result = extension.analyzeHtft(normalized(), "htft21");
  assert.equal(result.market, "İY/MS 2/1");
  assert.equal(result.odd, null);
  assert.equal(result.noPick, true);
  assert.equal(result.recommendationStatus, "watch");
  assert.match(result.reasons.join(" "), /fiyat uydurulmadı/i);
});

test("Poisson tabanlı 3.5 Üst genişletilmiş analizi üretilir", () => {
  const result = extension.analyzeSimple(normalized({
    source: { over35: 2.15, under35: 1.72 },
  }), "over35");
  assert.equal(result.market, "3.5 Üst");
  assert.equal(result.odd, 2.15);
  assert.ok(result.estimatedProbability > 0);
  assert.ok(result.marketProbability > 0);
  assert.equal(result.couponEligible, false);
});

test("kurulum mevcut robot ve KG tiplerini değiştirmeden yalnız yeni advanced marketi yakalar", () => {
  const calls = [];
  const core = {
    normalizeMatch: (value) => value,
    analyze: (input, type, market) => {
      calls.push([type, market]);
      return { delegated: true, input, type, market };
    },
    analyzeCoupon: () => ({ delegatedCoupon: true }),
  };
  assert.equal(extension.install(core, null), true);
  const robot = core.analyze(normalized(), "robot");
  assert.equal(robot.delegated, true);
  const expanded = core.analyze(normalized({ source: { over35: 2.15, under35: 1.72 } }), "advanced", "3.5 Üst");
  assert.equal(expanded.market, "3.5 Üst");
  assert.deepEqual(calls, [["robot", ""]]);
});

test("genişletilmiş kupon güvenlik nedeniyle otomatik picked ayak üretmez", () => {
  const core = {
    normalizeMatch: (value) => value,
    analyze: () => ({ delegated: true }),
    analyzeCoupon: () => ({ delegatedCoupon: true }),
  };
  extension.install(core, null);
  const coupon = core.analyzeCoupon([
    normalized({ source: { over35: 2.15, under35: 1.72 } }),
    normalized({ home: "C", away: "D", source: { over35: 2.25, under35: 1.68 } }),
  ], "advanced", "3.5 Üst");
  assert.equal(coupon.pickedCount, 0);
  assert.equal(coupon.totalOdd, null);
  assert.equal(coupon.risk, "Yüksek");
  assert.ok(coupon.legs.every((leg) => leg.noPick));
});

process.stdout.write("PRO14 market genişletme testleri tamamlandı.\n");

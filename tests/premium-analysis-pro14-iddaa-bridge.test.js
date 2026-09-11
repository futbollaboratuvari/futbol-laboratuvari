"use strict";

const assert = require("node:assert/strict");
const bridge = require("../premium-analysis-pro14-iddaa-bridge.js");

const test = (name, fn) => { try { fn(); process.stdout.write(`✓ ${name}\n`); } catch (error) { process.stderr.write(`✗ ${name}\n`); throw error; } };

const rows = [{
  title: "İlk Yarı / Maç Sonucu",
  markets: [
    { label: "1/1", odd: 4.5 }, { label: "1/0", odd: 13 }, { label: "1/2", odd: 22 },
    { label: "0/1", odd: 6.2 }, { label: "0/0", odd: 5.1 }, { label: "0/2", odd: 7.1 },
    { label: "2/1", odd: 18 }, { label: "2/0", odd: 14 }, { label: "2/2", odd: 5.3 },
  ],
}, {
  title: "İlk Yarı Sonucu",
  markets: [{ label: "1", odd: 3.0 }, { label: "0", odd: 2.0 }, { label: "2", odd: 3.8 }],
}, {
  title: "Maç Sonucu",
  markets: [{ label: "1", odd: 2.3 }, { label: "0", odd: 3.2 }, { label: "2", odd: 2.8 }],
}];

test("structured İY/MS 1/2 ve ilk/maç sonucu oranlarını düz aliaslara taşır", () => {
  const value = bridge.enrich({ source: { raw_market_blocks: rows } }, "İY/MS 1/2");
  assert.equal(value.htft12, 22);
  assert.equal(value.htft21, 18);
  assert.equal(value.firstHalf1, 3.0);
  assert.equal(value.ms2, 2.8);
});

test("mevcut düz oranı structured veri ezmez", () => {
  const value = bridge.enrich({ htft12: 21.5, source: { raw_market_blocks: rows } }, "İY/MS 1/2");
  assert.equal(value.htft12, 21.5);
});

test("kurulum robot tipini aynen önceki analyze fonksiyonuna devreder", () => {
  const calls = [];
  const core = {
    pro14MarketExpansionVersion: "pro14-market-expansion-v1",
    analyze: (input, type, market) => { calls.push([input, type, market]); return { type, market }; },
    analyzeCoupon: () => ({ delegated: true }),
  };
  bridge.install(core);
  const result = core.analyze({ source: { raw_market_blocks: rows } }, "robot", "");
  assert.equal(result.type, "robot");
  assert.equal(calls.length, 1);
});

test("advanced İY/MS structured oranla önceki PRO14 analizine gider", () => {
  let seen = null;
  const core = {
    pro14MarketExpansionVersion: "pro14-market-expansion-v1",
    analyze: (input, type, market) => { seen = input; return { type, market, odd: input.htft12 }; },
    analyzeCoupon: () => ({ delegated: true }),
  };
  bridge.install(core);
  const result = core.analyze({ source: { raw_market_blocks: rows } }, "advanced", "İY/MS 1/2");
  assert.equal(result.odd, 22);
  assert.equal(seen.htft12, 22);
});

test("bridge kuponu yeni marketlerde otomatik picked üretmeden kapalı tutar", () => {
  const core = {
    pro14MarketExpansionVersion: "pro14-market-expansion-v1",
    analyze: (input, type, market) => ({ type, market, hasOpinion: true, noPick: false, couponEligible: false, modelScore: 60 }),
    analyzeCoupon: () => ({ delegated: true }),
  };
  bridge.install(core);
  const coupon = core.analyzeCoupon([{ source: { raw_market_blocks: rows } }], "advanced", "İY/MS 1/2");
  assert.equal(coupon.pickedCount, 0);
  assert.equal(coupon.totalOdd, null);
  assert.equal(coupon.legs[0].noPick, true);
});

process.stdout.write("PRO14 İddaa structured market bridge testleri tamamlandı.\n");

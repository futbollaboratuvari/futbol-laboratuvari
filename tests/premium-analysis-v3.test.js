"use strict";

const assert = require("node:assert/strict");
const core = require("../premium-analysis-v3-core.js");

const test = (name, fn) => {
  try {
    fn();
    process.stdout.write(`✓ ${name}\n`);
  } catch (error) {
    process.stderr.write(`✗ ${name}\n`);
    throw error;
  }
};

test("yaklaşan maç filtresi başlamış ve geçmiş maçları dışarıda bırakır", () => {
  const now = new Date("2026-08-23T12:00:00Z");
  const matches = [
    { date: "2026-08-23", time: "18:00", home: "A", away: "B", status: "scheduled" },
    { date: "2026-08-23", time: "18:30", home: "C", away: "D", status: "live" },
    { date: "2026-08-23", time: "10:00", home: "E", away: "F", status: "scheduled" },
    { date: "2026-08-24", time: "20:00", home: "G", away: "H", status: "finished" },
    { date: "2026-08-24", time: "20:00", home: "I", away: "J", status: "scheduled" },
  ];
  const upcoming = core.filterUpcoming(matches, now);
  assert.deepEqual(upcoming.map((match) => match.home), ["A", "I"]);
});

test("farklı bülten alanları tek maç ve oran şemasında birleşir", () => {
  const match = core.normalizeMatch({
    tarih: "2026-08-24",
    saat: "21:45",
    competition_name: "Test Ligi",
    home_team_name: "Ev Takımı",
    away_team_name: "Deplasman Takımı",
    oneOdd: "1,74",
    available_odds: { msx: 3.2, bttsYes_guess: 1.88 },
    odds: { ms2: 4.6, over25: 2.05 },
  });
  assert.equal(match.league, "Test Ligi");
  assert.equal(match.odds.ms1, 1.74);
  assert.equal(match.odds.msx, 3.2);
  assert.equal(match.odds.ms2, 4.6);
  assert.equal(match.odds.over25, 2.05);
  assert.equal(match.odds.bttsYes, 1.88);
});

test("güçlü gol eğilimi 2.5 üst sonucunu ve gerekçeleri üretir", () => {
  const result = core.analyze({
    date: "2026-08-24",
    time: "20:00",
    home: "Golcü A",
    away: "Golcü B",
    status: "scheduled",
    over25Percent: 72,
    bttsPercent: 55,
    secondHalfGoalTrend: 65,
    leagueGoalAverage: 3.1,
    over25: 1.83,
    under25: 1.92,
  }, "goals");
  assert.equal(result.market, "2.5 Üst");
  assert.equal(result.noPick, false);
  assert.equal(result.reasons.length, 3);
  assert.ok(result.confidence >= 60);
});

test("oynama kararı ve düşük skor zorunlu seçim üretmez", () => {
  const result = core.analyze({
    date: "2026-08-24",
    time: "20:00",
    home: "Dengeli A",
    away: "Dengeli B",
    status: "scheduled",
    decision: "Oynama",
    analysis_score: 42,
    recommended_market: "Değerli market yok",
    ms1: 2.4,
    msx: 3.1,
    ms2: 2.7,
  }, "robot");
  assert.equal(result.noPick, true);
  assert.equal(result.market, "Seçim yok");
  assert.equal(result.risk, "Yüksek");
});

test("kupon özeti ortalama güveni ve eksiksiz toplam oranı hesaplar", () => {
  const coupon = core.analyzeCoupon([
    { date: "2026-08-24", time: "18:00", home: "A", away: "B", status: "scheduled", ms1: 1.5, msx: 4, ms2: 6 },
    { date: "2026-08-24", time: "21:00", home: "C", away: "D", status: "scheduled", ms1: 1.8, msx: 3.8, ms2: 4.5 },
  ], "match");
  assert.equal(coupon.legs.length, 2);
  assert.equal(coupon.pickedCount, 2);
  assert.equal(coupon.totalOdd, 2.7);
  assert.ok(coupon.averageConfidence > 0);
  assert.ok(["Düşük", "Orta", "Yüksek"].includes(coupon.risk));
});

test("Türkçe karakterlerden bağımsız takım ve lig araması çalışır", () => {
  const matches = core.normalizeMatches([
    { date: "2026-08-24", time: "19:00", league: "Türkiye Süper Lig", home: "Fenerbahçe", away: "Göztepe" },
    { date: "2026-08-24", time: "22:00", league: "İspanya La Liga", home: "Sevilla", away: "Villarreal" },
  ]);
  assert.equal(core.filterMatches(matches, { query: "fenerbahce" }).length, 1);
  assert.equal(core.filterMatches(matches, { query: "ispanya" })[0].home, "Sevilla");
  assert.equal(core.filterMatches(matches, { query: "goztepe" })[0].home, "Fenerbahçe");
});

process.stdout.write("Özel Analiz V3 çekirdek testleri tamamlandı.\n");

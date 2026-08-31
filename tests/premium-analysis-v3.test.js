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

test("korumalı resmi KG analizi KG Var seçimini model alanlarıyla gösterir", () => {
  const result = core.analyze({
    date: "2026-08-24",
    time: "20:00",
    home: "Golcü A",
    away: "Golcü B",
    status: "scheduled",
    available_odds: { bttsYes: 1.78, bttsNo: 2.02 },
    proAnalysis: {
      available: true,
      fresh: true,
      btts_analysis: {
        available: true,
        pair_complete: true,
        trusted_odds: true,
        recommended_key: "bttsYes",
        recommended_market: "KG Var",
        model_version: "pro13-btts-conditioned-v2",
        outcomes: {
          bttsYes: { key: "bttsYes", label: "KG Var", odd: 1.78, model_score: 69, estimated_probability: 62, market_probability: 53.2, edge_percent: 8.8, data_completeness: 66, independent_evidence: true, probability_source: ["Poisson gol modeli", "sonuç hafızası"], risk_level: "Orta", signals: ["Bağımsız gol modeli %62."] },
          bttsNo: { key: "bttsNo", label: "KG Yok", odd: 2.02, model_score: 51, estimated_probability: 38, market_probability: 46.8, edge_percent: -8.8, data_completeness: 66, independent_evidence: true, risk_level: "Yüksek", signals: ["Birleşik tahmini olasılık %38."] },
        },
      },
    },
  }, "advanced", "KG Var");
  assert.equal(result.market, "KG Var");
  assert.equal(result.noPick, false);
  assert.equal(result.modelScore, 69);
  assert.equal(result.estimatedProbability, 62);
  assert.equal(result.edgePercent, 8.8);
  assert.equal(result.sourceMode, "pro_btts");
  assert.match(result.headline, /karşılıklı gol analizinde öne çıkıyor/);
});

test("doğrudan KG Var/Yok analiz türü güçlü tarafı otomatik seçer", () => {
  const result = core.analyze({
    date: "2026-08-24",
    time: "20:00",
    home: "KG A",
    away: "KG B",
    status: "scheduled",
    available_odds: { bttsYes: 1.75, bttsNo: 2.1 },
    proAnalysis: {
      available: true,
      fresh: true,
      btts_analysis: {
        available: true,
        pair_complete: true,
        trusted_odds: true,
        recommended_key: "bttsYes",
        model_version: "pro13-btts-conditioned-v2",
        outcomes: {
          bttsYes: { key: "bttsYes", label: "KG Var", odd: 1.75, model_score: 67, estimated_probability: 61, market_probability: 54.5, data_completeness: 62, independent_evidence: true, risk_level: "Orta", signals: ["Poisson ve sonuç hafızası KG Var tarafını destekliyor."] },
          bttsNo: { key: "bttsNo", label: "KG Yok", odd: 2.1, model_score: 50, estimated_probability: 39, market_probability: 45.5, data_completeness: 62, independent_evidence: true, risk_level: "Yüksek", signals: ["KG Yok olasılığı %39."] },
        },
      },
    },
  }, "btts");
  assert.equal(result.type, "btts");
  assert.equal(result.market, "KG Var");
  assert.equal(result.noPick, false);
  assert.equal(result.estimatedProbability, 61);
});

test("KG kupon analizi hiçbir ayakta taraf marketine dönmez", () => {
  const kgMatch = (home, away, recommendedKey, yesProbability, noProbability) => ({
    date: "2026-08-24",
    time: "20:00",
    home,
    away,
    status: "scheduled",
    available_odds: { ms1: 1.45, msx: 4.1, ms2: 5.8, bttsYes: 1.78, bttsNo: 2.02 },
    proAnalysis: {
      available: true,
      fresh: true,
      recommended_market: "MS 1",
      btts_analysis: {
        available: true,
        pair_complete: true,
        trusted_odds: true,
        recommended_key: recommendedKey,
        model_version: "pro13-btts-conditioned-v2",
        outcomes: {
          bttsYes: { key: "bttsYes", label: "KG Var", odd: 1.78, model_score: yesProbability, estimated_probability: yesProbability, market_probability: 53.2, data_completeness: 66, independent_evidence: true, risk_level: "Orta", signals: ["KG Var ölçüldü."] },
          bttsNo: { key: "bttsNo", label: "KG Yok", odd: 2.02, model_score: noProbability, estimated_probability: noProbability, market_probability: 46.8, data_completeness: 66, independent_evidence: true, risk_level: "Orta", signals: ["KG Yok ölçüldü."] },
        },
      },
    },
  });
  const coupon = core.analyzeCoupon([
    kgMatch("KG Var A", "KG Var B", "bttsYes", 62, 38),
    kgMatch("KG Yok A", "KG Yok B", "bttsNo", 41, 59),
  ], "btts");
  assert.deepEqual(coupon.legs.map((leg) => leg.market), ["KG Var", "KG Yok"]);
  assert.ok(coupon.legs.every((leg) => leg.type === "btts"));
  assert.ok(coupon.legs.every((leg) => !/^MS\s/i.test(leg.market)));
});

test("desteklenmeyen KG tarafı sahte öneriye çevrilmeden ölçülü görüş olarak kalır", () => {
  const result = core.analyze({
    date: "2026-08-24",
    time: "20:00",
    home: "A",
    away: "B",
    status: "scheduled",
    available_odds: { bttsYes: 2.15, bttsNo: 1.65 },
    proAnalysis: {
      available: true,
      fresh: true,
      btts_analysis: {
        available: true,
        pair_complete: true,
        trusted_odds: true,
        outcomes: {
          bttsYes: { key: "bttsYes", label: "KG Var", odd: 2.15, model_score: 51, estimated_probability: 41, market_probability: 43.4, data_completeness: 43, independent_evidence: false, risk_level: "Yüksek", signals: ["Birleşik tahmini olasılık %41."] },
          bttsNo: { key: "bttsNo", label: "KG Yok", odd: 1.65, model_score: 59, estimated_probability: 59, market_probability: 56.6, data_completeness: 43, independent_evidence: false, risk_level: "Yüksek", signals: ["Birleşik tahmini olasılık %59."] },
        },
      },
    },
  }, "advanced", "KG Var");
  assert.equal(result.market, "KG Var");
  assert.equal(result.noPick, true);
  assert.equal(result.hasOpinion, true);
  assert.equal(result.recommendationStatus, "watch");
  assert.equal(result.estimatedProbability, 41);
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
  assert.equal(result.market, "Görüş oluşmadı");
  assert.equal(result.risk, "Yüksek");
});

test("PRO robot yalnız güncel ve yeterli veriyle açık market üretir", () => {
  const result = core.analyze({
    date: "2026-08-24",
    time: "20:00",
    home: "A",
    away: "B",
    status: "scheduled",
    over25: 1.85,
    under25: 1.95,
    proAnalysis: {
      available: true,
      fresh: true,
      recommended_market: "2.5 Üst",
      recommended_odd: 1.85,
      model_score: 72,
      estimated_probability: 59,
      market_probability: 51,
      edge_percent: 8,
      data_completeness: 68,
      data_quality: "Orta",
      signals: ["Doğrulanmış gol verisi marketi destekliyor."],
    },
  }, "robot");
  assert.equal(result.noPick, false);
  assert.equal(result.market, "2.5 Üst");
  assert.equal(result.modelScore, 72);
  assert.equal(result.estimatedProbability, 59);
});

test("PRO kaydı yoksa robot oran-only seçim uydurmaz", () => {
  const result = core.analyze({
    date: "2026-08-24",
    time: "20:00",
    home: "A",
    away: "B",
    status: "scheduled",
    ms1: 1.2,
    msx: 6,
    ms2: 12,
  }, "robot");
  assert.equal(result.noPick, true);
  assert.equal(result.modelScore, null);
  assert.match(result.reasons.join(" "), /PRO veri/i);
});

test("PRO kaydı olmayan kupon sahte model puanı üretmez", () => {
  const coupon = core.analyzeCoupon([
    { date: "2026-08-25", time: "03:15", home: "Lanus", away: "Argentinos Jr", status: "scheduled", ms1: 2.28, msx: 2.64, ms2: 2.77 },
    { date: "2026-08-25", time: "03:15", home: "Talleres", away: "Rosario Central", status: "scheduled", ms1: 2.4, msx: 2.63, ms2: 2.64 },
  ], "robot");
  assert.equal(coupon.pickedCount, 0);
  assert.equal(coupon.opinionCount, 0);
  assert.equal(coupon.unavailableCount, 2);
  assert.equal(coupon.averageModelScore, null);
  assert.deepEqual(coupon.legs.map((leg) => leg.modelScore), [null, null]);
});

test("eşik altı PRO marketi seçim yok diye gizlenmez, izleme görüşü olur", () => {
  const result = core.analyze({
    date: "2026-08-25",
    time: "01:00",
    home: "Tigre",
    away: "Cordoba Santiago",
    status: "scheduled",
    proAnalysis: {
      available: true,
      fresh: true,
      recommended_market: "MS 1",
      recommended_odd: 1.48,
      model_score: 46,
      estimated_probability: 57.4,
      market_probability: 57.4,
      edge_percent: 0,
      data_completeness: 40,
      include_in_coupon: false,
    },
  }, "robot");
  assert.equal(result.noPick, true);
  assert.equal(result.hasOpinion, true);
  assert.equal(result.recommendationStatus, "watch");
  assert.equal(result.market, "MS 1");
  assert.equal(result.odd, 1.48);
  assert.match(result.reasons.join(" "), /46\/100.*60\/100/);
});

test("kupon görünümü PRO görüşlerini gösterir ama uygun olmayanları hesaba katmaz", () => {
  const rows = [
    ["Tigre", "Cordoba Santiago", "MS 1", 46, 57.4, 1.48],
    ["Athletic Club", "Novorizontino", "MS 2", 33, 40.3, 2.05],
    ["Sport Recife", "America Mineiro", "MS 1", 41, 57.2, 1.44],
    ["Charleston Battery", "Miami FC", "MS 1", 44, 64.2, 1.29],
    ["Ferro Carril", "All Boys", "MS 1", 46, 55.8, 1.48],
    ["Botafogo", "Atletico PR", "2.5 Alt", 64, 50.7, 1.67],
  ].map(([home, away, market, score, probability, odd]) => ({
    date: "2026-08-25",
    time: "02:00",
    home,
    away,
    status: "scheduled",
    proAnalysis: {
      available: true,
      fresh: true,
      recommended_market: market,
      recommended_odd: odd,
      model_score: score,
      estimated_probability: probability,
      market_probability: probability,
      edge_percent: 0,
      data_completeness: 40,
      independent_evidence: false,
      include_in_coupon: false,
    },
  }));
  const coupon = core.analyzeCoupon(rows, "robot");
  assert.equal(coupon.pickedCount, 0);
  assert.equal(coupon.opinionCount, 6);
  assert.equal(coupon.watchCount, 6);
  assert.equal(coupon.unavailableCount, 0);
  assert.equal(coupon.totalOdd, null);
  assert.equal(coupon.combinedProbability, null);
  assert.deepEqual(coupon.legs.map((leg) => leg.market), ["MS 1", "MS 2", "MS 1", "MS 1", "MS 1", "2.5 Alt"]);
  assert.ok(coupon.legs.every((leg) => leg.noPick && leg.recommendationStatus === "watch"));
});

test("kupon ortalama model gücü seçim oluşmayan ölçülmüş ayakları da kapsar", () => {
  const pro = (modelScore, market, includeInCoupon = false) => ({
    available: true,
    fresh: true,
    recommended_market: market,
    recommended_odd: market === "MS 1" ? 2.28 : 1.4,
    model_score: modelScore,
    estimated_probability: modelScore === 37 ? 37.2 : 60.7,
    market_probability: modelScore === 37 ? 37.2 : 55.2,
    edge_percent: 0,
    data_completeness: includeInCoupon ? 46 : 40,
    independent_evidence: includeInCoupon,
    risk_level: includeInCoupon ? "Orta" : "Yüksek",
    include_in_coupon: includeInCoupon,
  });
  const coupon = core.analyzeCoupon([
    { date: "2026-08-25", time: "03:15", home: "Lanus", away: "Argentinos Jr", status: "scheduled", proAnalysis: pro(37, "MS 1") },
    { date: "2026-08-25", time: "03:15", home: "Talleres", away: "Rosario Central", status: "scheduled", proAnalysis: pro(68, "2.5 Alt", true) },
  ], "robot");
  assert.equal(coupon.pickedCount, 1);
  assert.equal(coupon.opinionCount, 2);
  assert.equal(coupon.watchCount, 1);
  assert.equal(coupon.averageModelScore, 53);
  assert.equal(coupon.totalOdd, null);
});

test("PRO indeksi bültene kod ve Türkçe takım anahtarıyla bağlanır", () => {
  const bulletin = [{ date: "2026-08-24", time: "21:00", home: "Fenerbahçe", away: "Göztepe", matchCode: "123" }];
  const payload = {
    generated_at: "2026-08-24T17:00:00Z",
    matches: [{ date: "2026-08-24", time: "21:00", home: "Fenerbahce", away: "Goztepe", match_code: "123", recommended_market: "MS 1", model_score: 70, data_completeness: 60 }],
  };
  const merged = core.filterUpcoming(core.mergeProAnalysis(bulletin, payload, new Date("2026-08-24T18:00:00Z")), new Date("2026-08-24T18:00:00Z"));
  assert.equal(merged.length, 1);
  assert.equal(merged[0].pro.available, true);
  assert.equal(merged[0].pro.fresh, true);
  assert.equal(merged[0].pro.modelScore, 70);
});

test("ham kaynak etiketi PRO birleşimini ve doğrudan analizi bozmaz", () => {
  const bulletin = [{
    date: "2026-08-25",
    time: "03:15",
    home: "Talleres",
    away: "Rosario Central",
    matchCode: "33614",
    source: "Maçkolik canlı robot",
  }];
  const payload = {
    generated_at: "2026-08-24T20:30:00Z",
    matches: [{
      date: "2026-08-25",
      time: "03:15",
      home: "Talleres",
      away: "Rosario Central",
      match_code: "33614",
      source: "Robot ham veri havuzu",
      recommended_market: "2.5 Alt",
      recommended_odd: 1.4,
      model_score: 64,
      estimated_probability: 60.7,
      market_probability: 60.7,
      edge_percent: 0,
      data_completeness: 40,
    }],
  };
  const merged = core.mergeProAnalysis(bulletin, payload, new Date("2026-08-24T20:35:00Z"));
  const result = core.analyze(merged[0], "robot");
  assert.equal(result.noPick, false);
  assert.equal(result.market, "2.5 Alt");
  assert.equal(result.modelScore, 64);
  assert.equal(result.couponEligible, false);
  assert.equal(result.recommendationStatus, "analysis");
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
  assert.ok(coupon.combinedProbability > 0);
  assert.ok(coupon.combinedProbability < coupon.legs[0].estimatedProbability);
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

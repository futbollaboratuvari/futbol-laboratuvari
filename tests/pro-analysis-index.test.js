"use strict";

const assert = require("node:assert/strict");
const { buildCalibration, compactMatch, compactMetrics, selectProMatches } = require("../scripts/build-pro-analysis-index.js");

const test = (name, fn) => {
  try {
    fn();
    process.stdout.write(`✓ ${name}\n`);
  } catch (error) {
    process.stderr.write(`✗ ${name}\n`);
    throw error;
  }
};

test("kompakt PRO kaydı model gücü ve olasılığı ayrı tutar", () => {
  const row = compactMatch({
    date: "2026-08-24",
    time: "20:00",
    home: "A",
    away: "B",
    market: "2.5 Üst",
    model_score: 72,
    estimated_probability: 58.4,
    market_probability: 51.2,
    edge_percent: 7.2,
    data_completeness: 64,
    independent_evidence: true,
  }, {});
  assert.equal(row.model_score, 72);
  assert.equal(row.estimated_probability, 58.4);
  assert.equal(row.score_type, "signal_strength");
  assert.equal(row.data_quality, "Orta");
  assert.equal(row.independent_evidence, true);
});

test("kompakt PRO kaydı doğrulanmış kadro ve mevki eşleşmesini kaybetmez", () => {
  const row = compactMatch({
    date: "2026-08-24",
    home: "A",
    away: "B",
    market: "MS 1",
    model_score: 68,
    data_completeness: 70,
    independent_evidence: true,
    squad_risk_level: "Orta",
    lineup_risk_level: "Orta",
    team_status_verified_count: 2,
    named_player_count: 2,
    team_intelligence: {
      squad_risk_level: "Orta",
      lineup_risk_level: "Orta",
      squad_verified_team_count: 2,
      named_player_count: 2,
      home_lineup: {
        team_name: "A",
        formation: "4-3-3",
        starting_11_count: 11,
        lineup_confirmed: true,
        availability_checked: true,
        unavailable_players: [],
      },
      away_lineup: {
        team_name: "B",
        formation: "4-2-3-1",
        starting_11_count: 11,
        lineup_confirmed: true,
        availability_checked: true,
        unavailable_players: [{ name: "Eksik", position: "M", impact_score: 8, impact_level: "Yüksek" }],
      },
      matchup_analysis: {
        version: "matchup-intelligence-v1",
        data_quality: "Orta",
        coverage_score: 70,
        lineup_confirmed_both: true,
        availability_checked_both: true,
        context_edge: 6,
        context_edge_side: "home",
        home: { team_name: "A", formation: "4-3-3", zones: {} },
        away: { team_name: "B", formation: "4-2-3-1", missing_count: 1, missing_impact: 8, zones: {} },
        position_comparison: [{ zone: "midfield", label: "Orta saha", edge: "home", basis: "verified_availability", home_missing_impact: 0, away_missing_impact: 8 }],
        market_context: { goal_pressure: -5, defensive_missing_impact: 0, attacking_missing_impact: 8, goals_note: "test", btts_note: "test" },
        signals: ["B orta sahasında yüksek etkili eksik."],
      },
    },
  }, {});
  assert.equal(row.team_intelligence.squad_verified_team_count, 2);
  assert.equal(row.team_intelligence.away_lineup.unavailable_players[0].impact_score, 8);
  assert.equal(row.team_intelligence.matchup_analysis.coverage_score, 70);
  assert.equal(row.team_intelligence.matchup_analysis.position_comparison[0].edge, "home");
});

test("kupon uygunluk bayrağı bütün kanıt ve value eşiklerini birlikte doğrular", () => {
  const inconsistent = compactMatch({
    home: "A",
    away: "B",
    market: "2.5 Alt",
    model_score: 64,
    estimated_probability: 55,
    data_completeness: 40,
    independent_evidence: false,
    risk_level: "Yüksek",
    include_in_coupon: true,
  }, {});
  const verified = compactMatch({
    home: "C",
    away: "D",
    market: "2.5 Alt",
    model_score: 76,
    estimated_probability: 64,
    market_probability: 56,
    edge_percent: 8,
    estimated_odds: 1.80,
    data_completeness: 72,
    independent_evidence: true,
    risk_level: "Orta",
    include_in_coupon: true,
  }, {});
  assert.equal(inconsistent.include_in_coupon, false);
  assert.equal(verified.include_in_coupon, true);
});

test("AI Şeffaflık için doğrulanmış çoklu seçenekler projection içinde korunur", () => {
  const row = compactMatch({
    date: "2026-09-18",
    home: "A",
    away: "B",
    market: "MS 1",
    estimated_odds: 1.82,
    model_score: 70,
    estimated_probability: 58,
    market_probability: 54,
    data_completeness: 66,
    independent_evidence: true,
    analysis_options: [
      { label: "İlk Yarı KG Var", odd: 2.45, model_score: 63, estimated_probability: 46, market_probability: 41, data_completeness: 61, independent_evidence: true },
      { label: "İY KG / 2Y KG Hayır / Evet", odd: 3.60, model_score: 57, estimated_probability: 34, market_probability: 28, data_completeness: 58, independent_evidence: true },
      { label: "2.5 Üst", odd: 1.88, model_score: 68, estimated_probability: 62, market_probability: 56, data_completeness: 70, independent_evidence: true },
    ],
    goal_market_candidates: [
      { market: "3.5 Üst", odds: 2.35, model_score: 66, estimated_probability: 49, market_probability: 43, data_completeness: 72, specialist_decision: "keep", specialist_eligible: true },
      { market: "6+ Gol", odds: 7.50, model_score: 59, estimated_probability: 17, market_probability: 13, data_completeness: 75, specialist_decision: "keep", specialist_eligible: true },
      { market: "6+ Gol", odds: 6.80, model_score: 30, estimated_probability: 10, data_completeness: 25, specialist_decision: "block", specialist_eligible: false },
    ],
  }, {});
  const markets = row.analysis_options.map((option) => option.market);
  assert.ok(markets.includes("İlk Yarı KG Var"));
  assert.ok(markets.includes("İY KG / 2Y KG Hayır / Evet"));
  assert.ok(markets.includes("2.5 Üst"));
  assert.ok(markets.includes("3.5 Üst"));
  assert.ok(markets.includes("6+ Gol"));
  assert.equal(row.analysis_options.filter((option) => option.market === "6+ Gol").length, 1);
});

test("kompakt metrikler büyük ham ve hafıza bloklarını dışarıda bırakır", () => {
  const metrics = compactMetrics({
    analysis_metrics: {
      over25Percent: 67,
      bttsPercent: 61,
      memory: { samples: 18, matches: new Array(100).fill({ large: true }) },
      poisson: { homeLambda: 1.6, awayLambda: 1.1, samples: 18, matrix: new Array(100).fill(1) },
      raw: new Array(100).fill("x"),
    },
  });
  assert.equal(metrics.over25Percent, 67);
  assert.equal(metrics.memory_samples, 18);
  assert.equal(metrics.poisson.home_lambda, 1.6);
  assert.equal(Object.hasOwn(metrics, "memory"), false);
  assert.equal(Object.hasOwn(metrics, "raw"), false);
  assert.equal(Object.hasOwn(metrics.poisson, "matrix"), false);
});

test("tamamlanan PRO olasılıkları Brier skoru ile ölçülür", () => {
  const calibration = buildCalibration({
    completed_items: [
      { status: "won", market: "MS 1", estimated_probability: 80 },
      { status: "lost", market: "MS 2", estimated_probability: 60 },
    ],
  });
  assert.equal(calibration.probability_sample_count, 2);
  assert.equal(calibration.brier_score, 0.2);
  assert.equal(calibration.calibration_status, "collecting_probability_history");
});

test("eski model skoru olasılık örneği gibi sayılmaz", () => {
  const calibration = buildCalibration({
    completed_items: [{ status: "won", market: "MS 1", analysis_score: 90 }],
  });
  assert.equal(calibration.probability_sample_count, 0);
  assert.equal(calibration.brier_score, null);
});

test("kalibrasyon özeti kırpılmış liste yerine tüm performans hafızasını kullanır", () => {
  const calibration = buildCalibration({
    completed_items: [{ status: "won", market: "MS 1", estimated_probability: 80 }],
    performance: {
      measured_count: 100,
      won_count: 55,
      lost_count: 45,
      success_rate: 55,
      probability_sample_count: 100,
      brier_score: 0.24,
      calibration_buckets: [{ lower: 50, upper: 59, predictions: 100, won: 55 }],
      groups: [{ key: "btts", measured: 25, won: 14, lost: 11, success_rate: 56 }],
    },
  });
  assert.equal(calibration.measured_count, 100);
  assert.equal(calibration.probability_sample_count, 100);
  assert.equal(calibration.brier_score, 0.24);
  assert.equal(calibration.groups[0].key, "btts");
  assert.equal(calibration.calibration_buckets.length, 1);
  assert.equal(calibration.baseline_brier_score, 0.2475);
  assert.ok(calibration.brier_skill_score > 0);
});

test("kompakt PRO akışı canlı ve bitmiş maçları istemciye taşımaz", () => {
  const selected = selectProMatches([
    { status: "scheduled", home: "A" },
    { status: "filtered_no_value_market", home: "B" },
    { status: "live", home: "C" },
    { status: "finished", home: "D" },
  ]);
  assert.deepEqual(selected.map((row) => row.home), ["A", "B"]);
});

process.stdout.write("Kompakt PRO veri indeksi testleri tamamlandı.\n");

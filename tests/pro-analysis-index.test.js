"use strict";

const assert = require("node:assert/strict");
const { buildCalibration, compactMatch, compactMetrics } = require("../scripts/build-pro-analysis-index.js");

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

process.stdout.write("Kompakt PRO veri indeksi testleri tamamlandı.\n");

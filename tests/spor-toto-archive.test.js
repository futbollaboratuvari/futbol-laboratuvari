const assert = require("assert");
const { applyOne } = require("../scripts/apply-spor-toto-archive-analysis");
const { normalizeReady, hasArchiveEvidence, isDistributionOnly } = require("../scripts/finalize-spor-toto-pro");

const base = {
  no: 1,
  date: "2026-08-28",
  time: "21:30",
  home: "Gençlerbirliği",
  away: "Erzurumspor FK",
  match: "Gençlerbirliği - Erzurumspor FK",
  analysis_ready: false,
  probabilities: { "1": null, X: null, "2": null },
  market_probabilities: { "1": null, X: null, "2": null },
  selected_options: [],
  decision: null,
};

const publicOnly = applyOne(base, {
  archive_ready: false,
  probabilities: { "1": 55, X: 27, "2": 18 },
  probability_basis: "cross_verified_public_distribution",
  confidence: 50,
  data_completeness: 28,
  form: { home: { count: 1, recent: ["W"] }, away: { count: 1, recent: ["L"] } },
  h2h: [],
});
assert.strictEqual(publicOnly.analysis_ready, true, "oynanma dağılımı boş kart bırakmamalı");
assert.strictEqual(publicOnly.independent_evidence, false, "oynanma dağılımı arşiv kanıtı sayılmamalı");
assert.strictEqual(publicOnly.archive_analysis.ready, false, "yetersiz arşiv örneği açıkça false kalmalı");
assert.strictEqual(isDistributionOnly(publicOnly), true, "oynanma dağılımı modu ayrıştırılmalı");
const publicFinal = normalizeReady(publicOnly);
assert.strictEqual(publicFinal.evidence_mode, "cross_verified_public_distribution", "dağılım modu finalizer sonrası korunmalı");
assert.strictEqual(publicFinal.independent_evidence, false, "tek maçlık örnek bağımsız arşiv kanıtına dönüşmemeli");
assert(publicFinal.classification.includes("Oynanma Dağılımı"), "dağılım bazlı sınıf korunmalı");
assert(publicFinal.confidence <= 54, "dağılım bazlı güven yüksek gösterilmemeli");
assert(!publicFinal.reasons.some((reason) => /doğrulanmış sonuç hafızası mevcut/i.test(reason)), "dağılım bazlı kart arşiv doğrulaması iddia etmemeli");

const archiveBacked = applyOne(base, {
  archive_ready: true,
  probabilities: { "1": 61, X: 23, "2": 16 },
  probability_basis: "archive_poisson_plus_public_distribution",
  confidence: 74,
  data_completeness: 82,
  agreement_score: 76,
  form: {
    home: { count: 10, wins: 7, draws: 2, losses: 1, pointsPerGame: 2.3, goalsForAvg: 1.8, goalsAgainstAvg: 0.8, recent: ["W", "W", "D", "W", "W"] },
    away: { count: 10, wins: 3, draws: 2, losses: 5, pointsPerGame: 1.1, goalsForAvg: 1.0, goalsAgainstAvg: 1.5, recent: ["L", "W", "D", "L", "L"] },
  },
  h2h: [{ date: "2025-01-01", home: "Gençlerbirliği", away: "Erzurumspor FK", score: "2-0" }],
  poisson: { home_lambda: 1.7, away_lambda: 0.8, samples: 20, reliability: 1 },
});
assert.strictEqual(hasArchiveEvidence(archiveBacked), true, "gerçek arşiv örneği bağımsız kanıt sayılmalı");
assert.strictEqual(archiveBacked.form.home.sample, 10, "UI için sample alanı normalize edilmeli");
assert.strictEqual(archiveBacked.form.home.ppg, 2.3, "UI için ppg alanı normalize edilmeli");
const archiveFinal = normalizeReady(archiveBacked);
assert.strictEqual(archiveFinal.independent_evidence, true, "finalizer arşiv kanıtını korumalı");
assert(archiveFinal.confidence >= 70, "arşiv destekli güven gereksiz yere düşürülmemeli");
assert(Math.abs(archiveFinal.probabilities["1"] + archiveFinal.probabilities.X + archiveFinal.probabilities["2"] - 100) < 0.2, "olasılıklar 100 olmalı");

console.log("Spor Toto archive evidence test PASS.");

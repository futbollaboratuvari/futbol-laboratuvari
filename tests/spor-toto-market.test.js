const assert = require("assert");
const { applyOne, marketProbabilities, blend } = require("../scripts/apply-spor-toto-weekly-market");

const base = {
  no: 1,
  date: "2026-08-28",
  time: "21:30",
  home: "Gençlerbirliği",
  away: "Erzurumspor FK",
  match: "Gençlerbirliği - Erzurumspor FK",
  analysis_ready: false,
  probabilities: { "1": null, X: null, "2": null },
  public_distribution: { "1": 67, X: 19, "2": 14 },
  form: { home: { recent: [], sample: 0 }, away: { recent: [], sample: 0 } },
  h2h: [],
};

const market = marketProbabilities({ "1": 2.15, X: 3.6, "2": 3.0 });
assert(market, "market probability oluşmalı");
assert(Math.abs(market["1"] + market.X + market["2"] - 100) < 0.2, "market olasılıkları 100 olmalı");

const blended = blend(market, { "1": 48, X: 27, "2": 25 });
assert(blended, "blended probability oluşmalı");
assert(Math.abs(blended["1"] + blended.X + blended["2"] - 100) < 0.2, "blended olasılıkları 100 olmalı");

const singleSource = applyOne(base, {
  market_verified: false,
  market: { source_count: 1, odds: { "1": 2.15, X: 3.6, "2": 3.0 }, bookmakers: ["A"] },
});
assert.strictEqual(singleSource.analysis_ready, false, "tek bookmaker kaynaklı veri hazır analiz sayılmamalı");

const verified = applyOne(base, {
  fixture_id: 123,
  league: "Süper Lig",
  market_verified: true,
  market_fetched_at: new Date().toISOString(),
  market: { source_count: 3, odds: { "1": 2.15, X: 3.6, "2": 3.0 }, bookmakers: ["A", "B", "C"] },
  prediction_fetched_at: new Date().toISOString(),
  prediction: {
    probabilities: { "1": 48, X: 27, "2": 25 },
    h2h: [{ date: "2025-01-01", home: "Gençlerbirliği", away: "Erzurumspor FK", score: "2-1" }],
  },
});
assert.strictEqual(verified.analysis_ready, true, "çoklu bookmaker doğrulaması hazır analiz üretmeli");
assert(["1", "X", "2"].includes(verified.decision), "hazır analizde geçerli karar olmalı");
assert.strictEqual(verified.market_validation.verified, true, "market doğrulanmış olmalı");
assert(verified.market_validation.source_count >= 2, "en az iki bookmaker olmalı");
assert(Math.abs(verified.probabilities["1"] + verified.probabilities.X + verified.probabilities["2"] - 100) < 0.2, "çıktı olasılıkları 100 olmalı");
assert(Array.isArray(verified.h2h) && verified.h2h.length === 1, "doğrulanmış H2H korunmalı");

console.log("Spor Toto market enrichment test PASS.");

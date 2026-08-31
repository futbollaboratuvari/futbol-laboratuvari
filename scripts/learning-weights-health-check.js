const fs = require("fs");
const path = require("path");
const { evaluateLearningBucket, hydrateLearningProfitability } = require("./learning-confidence");

const root = path.join(__dirname, "..");
const memoryFile = path.join(root, "data", "learning-memory.json");
const measurementFile = path.join(root, "data", "prediction-measurement-health-status.json");
const outJson = path.join(root, "data", "learning-weights-health-status.json");
const outMd = path.join(root, "outputs", "learning-weights-health-report.md");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function rows(obj) {
  return Object.entries(obj || {}).map(([name, stat]) => ({ name, ...(stat || {}) }));
}

function summarize(items, scope) {
  const evaluated = items.map((item) => ({ ...item, ...evaluateLearningBucket(item, scope) }));
  const readyItems = evaluated.filter((item) => item.sample_ready);
  const boost = readyItems.filter((item) => item.learning_state === "boost");
  const penalty = readyItems.filter((item) => item.learning_state === "penalty");
  return {
    total: evaluated.length,
    ready: readyItems.length,
    active: boost.length + penalty.length,
    boost: boost.length,
    penalty: penalty.length,
    best: boost.sort((a, b) => Number(b.adjusted_roi || 0) - Number(a.adjusted_roi || 0)).slice(0, 10),
    weak: penalty.sort((a, b) => Number(a.adjusted_roi || 0) - Number(b.adjusted_roi || 0)).slice(0, 10)
  };
}

function runLearningWeightsHealthCheck() {
  const memory = hydrateLearningProfitability(readJson(memoryFile, { market_memory: {}, league_memory: {}, league_market_memory: {}, predictions: [] }));
  const measurement = readJson(measurementFile, {});
  const markets = summarize(rows(memory.market_memory), "market");
  const leagues = summarize(rows(memory.league_memory), "league");
  const leagueMarkets = summarize(rows(memory.league_market_memory), "league_market");
  const predictionCount = Array.isArray(memory.predictions) ? memory.predictions.length : 0;
  const totalReady = markets.ready + leagues.ready + leagueMarkets.ready;
  const totalActive = markets.active + leagues.active + leagueMarkets.active;
  const watchOnly = predictionCount === 0 && measurement.status === "izleme";
  const status = totalActive > 0 ? "active" : totalReady > 0 ? "calibrating" : watchOnly ? "izleme" : "waiting_data";
  const report = {
    generated_at: new Date().toISOString(),
    status,
    prediction_count: predictionCount,
    market_memory: markets,
    league_memory: leagues,
    league_market_memory: leagueMarkets,
    next_action: status === "active"
      ? "Yalniz guven araligi notr bandin disina cikan hafizalar sonraki analizlerde sinirli uygulanir."
      : status === "calibrating"
        ? "Orneklem hazir; guven araligi ayrisana kadar agirliklar notr kalir."
        : status === "izleme" ? "Ogrenme icin veri yok. Izleme devam." : "Politika esikleri dolana kadar agirliklar notr kalir."
  };
  const md = [
    "# Ogrenme Agirlik Saglik Kontrolu",
    "",
    `Durum: ${report.status}`,
    `Tahmin sayisi: ${report.prediction_count}`,
    `Hazir market hafizasi: ${markets.ready}/${markets.total}`,
    `Hazir lig hafizasi: ${leagues.ready}/${leagues.total}`,
    `Hazir lig+market hafizasi: ${leagueMarkets.ready}/${leagueMarkets.total}`,
    `Aktif ve guvenli agirlik: ${totalActive}`,
    `Guclendirilen toplam: ${markets.boost + leagues.boost + leagueMarkets.boost}`,
    `Dusurulen toplam: ${markets.penalty + leagues.penalty + leagueMarkets.penalty}`,
    "",
    "## Guclu Marketler",
    ...markets.best.map((x) => `- ${x.name}: duzeltilmis getiri ${x.adjusted_roi}, agirlik ${x.weight}, guven ${x.confidence_adjustment}`),
    "",
    "## Zayif Marketler",
    ...markets.weak.map((x) => `- ${x.name}: duzeltilmis getiri ${x.adjusted_roi}, agirlik ${x.weight}, guven ${x.confidence_adjustment}`),
    "",
    `Sonraki aksiyon: ${report.next_action}`,
    ""
  ].join("\n");
  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Learning weights health: ${report.status}. Ready buckets: ${totalReady}. Active buckets: ${totalActive}`);
  return report;
}

if (require.main === module) runLearningWeightsHealthCheck();
module.exports = { runLearningWeightsHealthCheck };

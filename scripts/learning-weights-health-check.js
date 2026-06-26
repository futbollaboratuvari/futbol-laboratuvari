const fs = require("fs");
const path = require("path");

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

function settled(stat) {
  return Number(stat.won || 0) + Number(stat.lost || 0);
}

function ready(stat) {
  return settled(stat) >= 5 && Number.isFinite(Number(stat.success_rate));
}

function classify(stat) {
  if (!ready(stat)) return "neutral";
  if (Number(stat.weight || 1) > 1) return "boost";
  if (Number(stat.weight || 1) < 1) return "penalty";
  return "neutral";
}

function summarize(items) {
  const readyItems = items.filter(ready);
  const boost = readyItems.filter((x) => classify(x) === "boost");
  const penalty = readyItems.filter((x) => classify(x) === "penalty");
  return {
    total: items.length,
    ready: readyItems.length,
    boost: boost.length,
    penalty: penalty.length,
    best: boost.sort((a, b) => Number(b.success_rate || 0) - Number(a.success_rate || 0)).slice(0, 10),
    weak: penalty.sort((a, b) => Number(a.success_rate || 0) - Number(b.success_rate || 0)).slice(0, 10)
  };
}

function runLearningWeightsHealthCheck() {
  const memory = readJson(memoryFile, { market_memory: {}, league_memory: {}, league_market_memory: {}, predictions: [] });
  const measurement = readJson(measurementFile, {});
  const markets = summarize(rows(memory.market_memory));
  const leagues = summarize(rows(memory.league_memory));
  const leagueMarkets = summarize(rows(memory.league_market_memory));
  const predictionCount = Array.isArray(memory.predictions) ? memory.predictions.length : 0;
  const totalReady = markets.ready + leagues.ready + leagueMarkets.ready;
  const watchOnly = predictionCount === 0 && measurement.status === "izleme";
  const status = totalReady > 0 ? "active" : watchOnly ? "izleme" : "waiting_data";
  const report = {
    generated_at: new Date().toISOString(),
    status,
    prediction_count: predictionCount,
    market_memory: markets,
    league_memory: leagues,
    league_market_memory: leagueMarkets,
    next_action: status === "active" ? "Sonraki analizlerde agirliklar uygulanir." : status === "izleme" ? "Ogrenme icin veri yok. Izleme devam." : "En az 5 sonuclu veri birikene kadar agirliklar notr kalir."
  };
  const md = [
    "# Ogrenme Agirlik Saglik Kontrolu",
    "",
    `Durum: ${report.status}`,
    `Tahmin sayisi: ${report.prediction_count}`,
    `Hazir market hafizasi: ${markets.ready}/${markets.total}`,
    `Hazir lig hafizasi: ${leagues.ready}/${leagues.total}`,
    `Hazir lig+market hafizasi: ${leagueMarkets.ready}/${leagueMarkets.total}`,
    `Guclendirilen toplam: ${markets.boost + leagues.boost + leagueMarkets.boost}`,
    `Dusurulen toplam: ${markets.penalty + leagues.penalty + leagueMarkets.penalty}`,
    "",
    "## Guclu Marketler",
    ...markets.best.map((x) => `- ${x.name}: basari ${x.success_rate}, agirlik ${x.weight}, guven ${x.confidence_adjustment}`),
    "",
    "## Zayif Marketler",
    ...markets.weak.map((x) => `- ${x.name}: basari ${x.success_rate}, agirlik ${x.weight}, guven ${x.confidence_adjustment}`),
    "",
    `Sonraki aksiyon: ${report.next_action}`,
    ""
  ].join("\n");
  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Learning weights health: ${report.status}. Ready buckets: ${totalReady}`);
  return report;
}

if (require.main === module) runLearningWeightsHealthCheck();
module.exports = { runLearningWeightsHealthCheck };

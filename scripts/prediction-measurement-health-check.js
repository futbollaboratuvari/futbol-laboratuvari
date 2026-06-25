const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const memoryFile = path.join(root, "data", "learning-memory.json");
const finalizerFile = path.join(root, "data", "learning-finalizer-status.json");
const outJson = path.join(root, "data", "prediction-measurement-health-status.json");
const outMd = path.join(root, "outputs", "prediction-measurement-health-report.md");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function hasScore(value) {
  return /\d+\D+\d+/.test(String(value || ""));
}

function runPredictionMeasurementHealthCheck() {
  const memory = readJson(memoryFile, { predictions: [], summary: {} });
  const finalizer = readJson(finalizerFile, {});
  const predictions = Array.isArray(memory.predictions) ? memory.predictions : [];
  const pending = predictions.filter((p) => p.status === "pending");
  const won = predictions.filter((p) => p.status === "won");
  const lost = predictions.filter((p) => p.status === "lost");
  const scoredPending = pending.filter((p) => hasScore(p.result_score));
  const measured = won.length + lost.length;
  const status = predictions.length === 0 ? "empty" : scoredPending.length ? "warning" : "ok";
  const report = {
    generated_at: new Date().toISOString(),
    status,
    prediction_count: predictions.length,
    measured_count: measured,
    pending_count: pending.length,
    won_count: won.length,
    lost_count: lost.length,
    scored_pending_count: scoredPending.length,
    last_checked: finalizer.checked || 0,
    last_updated: finalizer.updated || 0,
    scored_pending_examples: scoredPending.slice(0, 50).map((p) => ({ id: p.id, match_name: p.match_name, market: p.market, result_score: p.result_score })),
    next_action: status === "ok" ? "Agirlik degistirme asamasina gecilebilir." : "Skoru olan pending tahminler finalizer tarafindan olculmeli."
  };
  const md = [
    "# Tahmin Olcum Saglik Kontrolu",
    "",
    `Durum: ${report.status}`,
    `Toplam tahmin: ${report.prediction_count}`,
    `Olculen tahmin: ${report.measured_count}`,
    `Bekleyen tahmin: ${report.pending_count}`,
    `Kazanan: ${report.won_count}`,
    `Kaybeden: ${report.lost_count}`,
    `Skoru olup pending kalan: ${report.scored_pending_count}`,
    `Son finalizer kontrolu: ${report.last_checked}`,
    `Son finalizer guncelleme: ${report.last_updated}`,
    "",
    `Sonraki aksiyon: ${report.next_action}`,
    ""
  ].join("\n");
  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Prediction measurement health: ${report.status}. Measured: ${measured}`);
  return report;
}

if (require.main === module) runPredictionMeasurementHealthCheck();
module.exports = { runPredictionMeasurementHealthCheck };

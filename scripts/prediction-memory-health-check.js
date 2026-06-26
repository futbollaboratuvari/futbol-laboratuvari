const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const memoryFile = path.join(root, "data", "learning-memory.json");
const robotFile = path.join(root, "data", "robot-analysis.json");
const outJson = path.join(root, "data", "prediction-memory-health-status.json");
const outMd = path.join(root, "outputs", "prediction-memory-health-report.md");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function rows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.predictions)) return data.predictions;
  if (Array.isArray(data.matches)) return data.matches;
  return [];
}

function text(value) {
  return String(value || "").trim();
}

function scoreNumber(value) {
  const n = Number(String(value ?? "").replace("%", ""));
  return Number.isFinite(n) ? n : null;
}

function simpleText(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c");
}

function hasPick(item) {
  const market = simpleText(item.recommended_market || item.market || item.selection);
  if (!market) return false;
  if (market.includes("degerli market yok")) return false;
  if (market.includes("degerli secenek yok")) return false;
  if (market.includes("belirsiz")) return false;
  return true;
}

function missingPredictionFields(item) {
  const missing = [];
  if (!text(item.id)) missing.push("id");
  if (!text(item.date)) missing.push("date");
  if (!text(item.match_name)) missing.push("match_name");
  if (!text(item.league)) missing.push("league");
  if (!text(item.market)) missing.push("market");
  if (!text(item.status)) missing.push("status");
  if (scoreNumber(item.analysis_score) === null) missing.push("analysis_score");
  if (!text(item.risk_level) || text(item.risk_level) === "-") missing.push("risk_level");
  if (!text(item.confidence_score) || text(item.confidence_score) === "-") missing.push("confidence_score");
  return missing;
}

function runPredictionMemoryHealthCheck() {
  const memory = readJson(memoryFile, { predictions: [], summary: {} });
  const robot = readJson(robotFile, { matches: [], summary: {} });
  const predictions = rows(memory);
  const robotMatches = rows(robot);
  const reportedCandidateCount = Number(robot?.summary?.coupon_candidate_count);
  const candidateCount = Number.isFinite(reportedCandidateCount)
    ? reportedCandidateCount
    : robotMatches.reduce((total, item) => total + (hasPick(item) ? 1 : 0), 0);
  const noCandidateRun = predictions.length === 0 && robotMatches.length > 0 && candidateCount === 0;
  const pending = predictions.filter((item) => item.status === "pending").length;
  const won = predictions.filter((item) => item.status === "won").length;
  const lost = predictions.filter((item) => item.status === "lost").length;
  const seen = new Set();
  const duplicates = [];
  const missing = [];

  for (const item of predictions) {
    if (seen.has(item.id)) duplicates.push(item.id);
    seen.add(item.id);
    const miss = missingPredictionFields(item);
    if (miss.length) missing.push({ id: item.id || item.match_name || "unknown", missing: miss });
  }

  const status = noCandidateRun ? "aday_yok_izleme" : predictions.length === 0 ? "empty" : missing.length || duplicates.length ? "warning" : "ok";
  const report = {
    generated_at: new Date().toISOString(),
    status,
    robot_match_count: robotMatches.length,
    candidate_count: candidateCount,
    prediction_count: predictions.length,
    pending_count: pending,
    won_count: won,
    lost_count: lost,
    duplicate_count: duplicates.length,
    missing_count: missing.length,
    missing_examples: missing.slice(0, 50),
    duplicate_examples: duplicates.slice(0, 50),
    next_action: status === "ok" ? "Sonuc takip asamasina gecilebilir." : status === "aday_yok_izleme" ? "Aday yok. Izleme devam." : "Tahmin kaydi kontrol edilmeli."
  };

  const md = [
    "# Tahmin Kayit Saglik Kontrolu",
    "",
    `Durum: ${report.status}`,
    `Robot analiz maci: ${report.robot_match_count}`,
    `Aday tahmin: ${report.candidate_count}`,
    `Toplam tahmin: ${report.prediction_count}`,
    `Bekleyen: ${report.pending_count}`,
    `Kazanan: ${report.won_count}`,
    `Kaybeden: ${report.lost_count}`,
    `Eksik kayit: ${report.missing_count}`,
    `Tekrar eden: ${report.duplicate_count}`,
    "",
    `Sonraki aksiyon: ${report.next_action}`,
    "",
    ...missing.slice(0, 20).map((item) => `- ${item.id}: eksik ${item.missing.join(", ")}`),
    ""
  ].join("\n");

  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Prediction memory health: ${report.status}. Predictions: ${predictions.length}. Candidates: ${candidateCount}`);
  return report;
}

if (require.main === module) runPredictionMemoryHealthCheck();
module.exports = { runPredictionMemoryHealthCheck };

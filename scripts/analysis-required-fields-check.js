const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const robotFile = path.join(root, "data", "robot-analysis.json");
const outJson = path.join(root, "data", "analysis-required-fields-status.json");
const outMd = path.join(root, "outputs", "analysis-required-fields-report.md");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function rows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.matches)) return data.matches;
  return [];
}

function text(value) {
  return String(value || "").trim();
}

function num(value) {
  const n = Number(String(value ?? "").replace("%", ""));
  return Number.isFinite(n) ? n : null;
}

function matchName(item) {
  return text(item.match_name || item.match || `${item.home || ""} - ${item.away || ""}`) || "unknown";
}

function fieldState(item) {
  const market = text(item.recommended_market || item.market || item.selection || item.suggested_option);
  const score = num(item.analysis_score ?? item.score);
  const confidence = num(item.confidence_score ?? item.confidence);
  const risk = text(item.risk_level || item.risk);
  const reason = text(item.robot_comment || item.robot_reason || item.reason || (Array.isArray(item.signals) ? item.signals.join(" | ") : ""));
  const missing = [];
  if (!market || market === "-") missing.push("market");
  if (score === null || score <= 0) missing.push("score");
  if (confidence === null || confidence <= 0) missing.push("confidence");
  if (!risk || risk === "-") missing.push("risk");
  if (!reason || reason === "-") missing.push("reason");
  return { market, score, confidence, risk, reason, missing };
}

function runAnalysisRequiredFieldsCheck() {
  const data = readJson(robotFile, { matches: [] });
  const list = rows(data);
  const details = list.map((item) => ({ match: matchName(item), ...fieldState(item) }));
  const bad = details.filter((item) => item.missing.length);
  const report = {
    generated_at: new Date().toISOString(),
    total: details.length,
    ok_count: details.length - bad.length,
    bad_count: bad.length,
    status: details.length === 0 ? "empty" : bad.length ? "warning" : "ok",
    bad_examples: bad.slice(0, 50)
  };
  const md = [
    "# Analiz Zorunlu Alan Kontrolu",
    "",
    `Durum: ${report.status}`,
    `Toplam analiz: ${report.total}`,
    `Tam analiz: ${report.ok_count}`,
    `Eksik analiz: ${report.bad_count}`,
    "",
    ...bad.slice(0, 20).map((item) => `- ${item.match}: eksik ${item.missing.join(", ")}`),
    ""
  ].join("\n");
  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Analysis required fields: ${report.status}. Missing: ${report.bad_count}`);
  return report;
}

if (require.main === module) runAnalysisRequiredFieldsCheck();
module.exports = { runAnalysisRequiredFieldsCheck };

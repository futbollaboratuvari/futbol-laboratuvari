const fs = require("fs");
const path = require("path");
const { evaluateLearningBucket, hydrateLearningProfitability } = require("./learning-confidence");

const root = path.join(__dirname, "..");
const memoryFile = path.join(root, "data", "learning-memory.json");
const statusFile = path.join(root, "data", "learning-output-status.json");
const outJson = path.join(root, "data", "robot-development-report.json");
const outMd = path.join(root, "outputs", "robot-development-report.md");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeText(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function pct(won, total) {
  return total ? Math.round((won / total) * 100) : 0;
}

function pickMemory(memory, snake, camel) {
  return memory?.[snake] || memory?.[camel] || {};
}

function bucketRows(items, scope) {
  return Object.entries(items || {}).map(([name, data]) => {
    const won = Number(data.won || 0);
    const lost = Number(data.lost || 0);
    const total = won + lost;
    const evaluation = evaluateLearningBucket(data, scope);
    return {
      name,
      won,
      lost,
      total,
      success_rate: pct(won, total),
      adjusted_success_rate: Math.round(evaluation.adjusted_success_rate * 100),
      flat_roi: evaluation.flat_roi,
      adjusted_roi: evaluation.adjusted_roi,
      weight: evaluation.weight,
      ready: evaluation.sample_ready,
      learning_state: evaluation.learning_state,
    };
  }).sort((a, b) => Number(b.adjusted_roi || 0) - Number(a.adjusted_roi || 0) || b.total - a.total);
}

function adviceFrom(rows, label) {
  const ready = rows.filter((row) => row.ready);
  const strong = ready.filter((row) => row.learning_state === "boost").slice(0, 5);
  const weak = ready.filter((row) => row.learning_state === "penalty").slice(-5);
  return { label, strong, weak };
}

function runRobotDevelopmentReport() {
  const memory = hydrateLearningProfitability(readJson(memoryFile, { predictions: [], market_memory: {}, league_memory: {}, league_market_memory: {} }));
  const outputStatus = readJson(statusFile, {});
  const predictions = Array.isArray(memory.predictions) ? memory.predictions : [];
  const pending = predictions.filter((item) => item.status === "pending").length;
  const finished = predictions.length - pending;
  const marketRows = bucketRows(pickMemory(memory, "market_memory", "marketMemory"), "market");
  const leagueRows = bucketRows(pickMemory(memory, "league_memory", "leagueMemory"), "league");
  const leagueMarketRows = bucketRows(pickMemory(memory, "league_market_memory", "leagueMarketMemory"), "league_market");
  const report = {
    generated_at: new Date().toISOString(),
    totals: { predictions: predictions.length, finished, pending },
    learning_output_status: outputStatus.status || outputStatus.level || "unknown",
    market_development: adviceFrom(marketRows, "market"),
    league_development: adviceFrom(leagueRows, "league"),
    league_market_development: adviceFrom(leagueMarketRows, "league_market"),
    next_actions: [
      "Pending kayitlar icin skor senkronunu takip et.",
      "Kucuk orneklem ve genis guven araliginda agirligi notr tut.",
      "Tek mac ogrenme etkisini bagimsiz kanit yoksa 3, varsa 6 puanla sinirla.",
      "Basari orani dusuk marketleri kupon adaylarinda daha dusuk guvenle kullan.",
      "Basari orani yuksek marketleri o liglerde one cikar."
    ]
  };
  const md = [
    "# Robot Gelişim Raporu",
    "",
    `Oluşturma: ${report.generated_at}`,
    `Toplam tahmin: ${report.totals.predictions}`,
    `Sonuçlanan: ${report.totals.finished}`,
    `Bekleyen: ${report.totals.pending}`,
    "",
    "## Güçlü Marketler",
    ...report.market_development.strong.map((row) => `- ${row.name}: düz getiri %${Math.round(row.flat_roi * 100)} (${row.won}/${row.total})`),
    "",
    "## Zayıf Marketler",
    ...report.market_development.weak.map((row) => `- ${row.name}: düz getiri %${Math.round(row.flat_roi * 100)} (${row.won}/${row.total})`),
    "",
    "## Sonraki Aksiyonlar",
    ...report.next_actions.map((item) => `- ${item}`),
    ""
  ].join("\n");
  writeText(outJson, `${JSON.stringify(report, null, 2)}\n`);
  writeText(outMd, md);
  console.log(`Robot development report created. Predictions: ${predictions.length}, Pending: ${pending}`);
  return report;
}

if (require.main === module) runRobotDevelopmentReport();
module.exports = { runRobotDevelopmentReport };

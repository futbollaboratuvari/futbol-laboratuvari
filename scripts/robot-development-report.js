const fs = require("fs");
const path = require("path");

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

function bucketRows(items) {
  return Object.entries(items || {}).map(([name, data]) => {
    const won = Number(data.won || 0);
    const lost = Number(data.lost || 0);
    const total = won + lost;
    return { name, won, lost, total, success_rate: pct(won, total), weight: Number(data.weight || 1), ready: total >= 5 };
  }).sort((a, b) => b.success_rate - a.success_rate || b.total - a.total);
}

function adviceFrom(rows, label) {
  const ready = rows.filter((row) => row.ready);
  const strong = ready.filter((row) => row.success_rate >= 60).slice(0, 5);
  const weak = ready.filter((row) => row.success_rate <= 40).slice(-5);
  return { label, strong, weak };
}

function runRobotDevelopmentReport() {
  const memory = readJson(memoryFile, { predictions: [], market_memory: {}, league_memory: {}, league_market_memory: {} });
  const outputStatus = readJson(statusFile, {});
  const predictions = Array.isArray(memory.predictions) ? memory.predictions : [];
  const pending = predictions.filter((item) => item.status === "pending").length;
  const finished = predictions.length - pending;
  const marketRows = bucketRows(pickMemory(memory, "market_memory", "marketMemory"));
  const leagueRows = bucketRows(pickMemory(memory, "league_memory", "leagueMemory"));
  const leagueMarketRows = bucketRows(pickMemory(memory, "league_market_memory", "leagueMarketMemory"));
  const report = {
    generated_at: new Date().toISOString(),
    totals: { predictions: predictions.length, finished, pending },
    learning_output_status: outputStatus.status || outputStatus.level || "unknown",
    market_development: adviceFrom(marketRows, "market"),
    league_development: adviceFrom(leagueRows, "league"),
    league_market_development: adviceFrom(leagueMarketRows, "league_market"),
    next_actions: [
      "Pending kayitlar icin skor senkronunu takip et.",
      "Hazir olmayan marketlerde en az 5 sonuc birikene kadar agirlik degistirme.",
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
    ...report.market_development.strong.map((row) => `- ${row.name}: %${row.success_rate} (${row.won}/${row.total})`),
    "",
    "## Zayıf Marketler",
    ...report.market_development.weak.map((row) => `- ${row.name}: %${row.success_rate} (${row.won}/${row.total})`),
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

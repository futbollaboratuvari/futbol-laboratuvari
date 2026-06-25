const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const fixturesFile = path.join(root, "data", "fixtures.json");
const robotFile = path.join(root, "data", "robot-analysis.json");
const liveFile = path.join(root, "data", "live-matches.json");
const outJson = path.join(root, "data", "analysis-health-status.json");
const outMd = path.join(root, "outputs", "analysis-health-report.md");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function todayTR() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function list(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.matches)) return data.matches;
  return [];
}

function keyOf(item) {
  return String(item.match_name || item.match || `${item.home || ""} - ${item.away || ""}`).trim().toLowerCase();
}

function hasMarket(item) {
  const market = item.recommended_market || item.market || item.selection || item.suggested_option;
  return Boolean(market && market !== "-" && market !== "Veri bekleniyor");
}

function hasScore(item) {
  const score = Number(item.analysis_score ?? item.score ?? item.confidence_score ?? 0);
  return Number.isFinite(score) && score > 0;
}

function runAnalysisHealthCheck() {
  const today = todayTR();
  const fixtures = list(readJson(fixturesFile, []));
  const todaysFixtures = fixtures.filter((m) => String(m.date || "").slice(0, 10) === today);
  const robot = readJson(robotFile, { matches: [] });
  const live = readJson(liveFile, { matches: [] });
  const robotMatches = list(robot);
  const liveMatches = list(live);
  const seen = new Set();
  const duplicates = [];
  const missingMarket = [];
  const missingScore = [];

  for (const item of robotMatches) {
    const key = keyOf(item);
    if (seen.has(key)) duplicates.push(key);
    seen.add(key);
    if (!hasMarket(item)) missingMarket.push(key);
    if (!hasScore(item)) missingScore.push(key);
  }

  const status = todaysFixtures.length === 0 ? "no_fixture" : robotMatches.length === 0 ? "empty" : missingMarket.length || missingScore.length ? "warning" : "ok";
  const report = {
    generated_at: new Date().toISOString(),
    status,
    date: today,
    fixture_count: todaysFixtures.length,
    robot_match_count: robotMatches.length,
    live_match_count: liveMatches.length,
    duplicate_count: duplicates.length,
    missing_market_count: missingMarket.length,
    missing_score_count: missingScore.length,
    duplicate_examples: duplicates.slice(0, 30),
    missing_market_examples: missingMarket.slice(0, 30),
    missing_score_examples: missingScore.slice(0, 30),
    next_action: status === "ok" ? "Tahmin kaydi asamasina gecilebilir." : "Analiz verisi kontrol edilmeli."
  };

  const md = [
    "# Analiz Sağlık Kontrolü",
    "",
    `Durum: ${report.status}`,
    `Tarih: ${report.date}`,
    `Bugünkü bülten maçı: ${report.fixture_count}`,
    `Robot analiz maçı: ${report.robot_match_count}`,
    `Canlı veri maçı: ${report.live_match_count}`,
    `Tekrar eden analiz: ${report.duplicate_count}`,
    `Marketsiz analiz: ${report.missing_market_count}`,
    `Skorsuz analiz: ${report.missing_score_count}`,
    "",
    `Sonraki aksiyon: ${report.next_action}`,
    ""
  ].join("\n");

  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Analysis health: ${report.status}. Robot: ${robotMatches.length}. Fixtures: ${todaysFixtures.length}`);
  return report;
}

if (require.main === module) runAnalysisHealthCheck();
module.exports = { runAnalysisHealthCheck };

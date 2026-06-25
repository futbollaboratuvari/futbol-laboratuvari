const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const fixturesFile = path.join(root, "data", "fixtures.json");
const rawPoolFile = path.join(root, "data", "ham_mac_havuzu.json");
const outJson = path.join(root, "data", "bulletin-health-status.json");
const outMd = path.join(root, "outputs", "bulletin-health-report.md");

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

function keyOf(match) {
  return [match.date, match.time, match.home || match.home_team_name, match.away || match.away_team_name]
    .map((v) => String(v || "").trim().toLowerCase())
    .join("|");
}

function missingFields(match) {
  const miss = [];
  if (!match.date) miss.push("date");
  if (!match.time) miss.push("time");
  if (!(match.league || match.competition_name)) miss.push("league");
  if (!(match.home || match.home_team_name)) miss.push("home");
  if (!(match.away || match.away_team_name)) miss.push("away");
  return miss;
}

function runBulletinHealthCheck() {
  const fixtures = readJson(fixturesFile, []);
  const raw = readJson(rawPoolFile, {});
  const today = todayTR();
  const seen = new Set();
  const duplicateKeys = [];
  const missing = [];
  const todayMatches = [];
  const futureMatches = [];
  const oldMatches = [];

  for (const match of Array.isArray(fixtures) ? fixtures : []) {
    const key = keyOf(match);
    if (seen.has(key)) duplicateKeys.push(key);
    seen.add(key);
    const miss = missingFields(match);
    if (miss.length) missing.push({ key, missing: miss });
    if (match.date === today) todayMatches.push(key);
    else if (String(match.date || "") > today) futureMatches.push(key);
    else oldMatches.push(key);
  }

  const total = Array.isArray(fixtures) ? fixtures.length : 0;
  const status = total > 0 && missing.length === 0 && duplicateKeys.length === 0 ? "ok" : total > 0 ? "warning" : "empty";
  const report = {
    generated_at: new Date().toISOString(),
    status,
    source: raw.source || "unknown",
    total_matches: total,
    today_matches: todayMatches.length,
    future_matches: futureMatches.length,
    old_matches: oldMatches.length,
    duplicate_count: duplicateKeys.length,
    missing_count: missing.length,
    duplicate_keys: duplicateKeys.slice(0, 50),
    missing_examples: missing.slice(0, 50),
    next_action: status === "ok" ? "Analiz asamasina gecilebilir." : "Bulten verisi kontrol edilmeli."
  };

  const md = [
    "# Bülten Sağlık Kontrolü",
    "",
    `Durum: ${report.status}`,
    `Kaynak: ${report.source}`,
    `Toplam maç: ${report.total_matches}`,
    `Bugünkü maç: ${report.today_matches}`,
    `Gelecek maç: ${report.future_matches}`,
    `Eski maç: ${report.old_matches}`,
    `Eksik kayıt: ${report.missing_count}`,
    `Tekrar eden kayıt: ${report.duplicate_count}`,
    "",
    `Sonraki aksiyon: ${report.next_action}`,
    ""
  ].join("\n");

  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Bulletin health: ${report.status}. Matches: ${total}. Missing: ${missing.length}. Duplicates: ${duplicateKeys.length}`);
  return report;
}

if (require.main === module) runBulletinHealthCheck();
module.exports = { runBulletinHealthCheck };

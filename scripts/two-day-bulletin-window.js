const fs = require("fs");
const path = require("path");
const { filterActiveBulletinMatches, countInactiveBulletinMatches } = require("./bulletin-active-filter");

const root = path.join(__dirname, "..");
const fixturesFile = path.join(root, "data", "fixtures.json");
const outJson = path.join(root, "data", "two-day-bulletin.json");
const outMd = path.join(root, "outputs", "two-day-bulletin-report.md");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function trDate(offset = 0) {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  local.setDate(local.getDate() + offset);
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, "0");
  const d = String(local.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function runTwoDayBulletinWindow() {
  const fixtures = readJson(fixturesFile, []);
  const sourceMatches = Array.isArray(fixtures) ? fixtures : [];
  const days = [trDate(0), trDate(1)];
  const sourceWindowMatches = sourceMatches.filter((m) => days.includes(m.date));
  const matches = filterActiveBulletinMatches(sourceWindowMatches);
  const byDay = Object.fromEntries(days.map((day) => [day, matches.filter((m) => m.date === day).length]));
  const removedInactiveCount = countInactiveBulletinMatches(sourceWindowMatches);
  const report = {
    generated_at: new Date().toISOString(),
    days,
    total_source_matches: sourceWindowMatches.length,
    total_matches: matches.length,
    active_match_count: matches.length,
    removed_finished_count: removedInactiveCount,
    removed_statuses: ["finished", "cancelled", "postponed"],
    by_day: byDay,
    matches
  };
  const rows = matches.map((m) => `- ${m.date} ${m.time || "--:--"} | ${m.league || "Lig"} | ${m.home || "?"} - ${m.away || "?"}`).join("\n");
  const md = `# Iki Gunluk Bulten\n\nGunler: ${days.join(" / ")}\nHam mac: ${sourceWindowMatches.length}\nAktif mac: ${matches.length}\nBultenden dusurulen mac: ${removedInactiveCount}\nBugun: ${byDay[days[0]]}\nYarin: ${byDay[days[1]]}\n\n${rows || "Mac bekleniyor."}\n`;
  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Two-day bulletin window: ${matches.length} active matches. Removed: ${removedInactiveCount}.`);
  return report;
}

if (require.main === module) runTwoDayBulletinWindow();
module.exports = { runTwoDayBulletinWindow };

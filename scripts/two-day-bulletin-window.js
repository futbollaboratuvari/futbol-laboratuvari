const fs = require("fs");
const path = require("path");
const { filterActiveBulletinMatches, countInactiveBulletinMatches, classifyBulletinMatch } = require("./bulletin-active-filter");

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

function withFlowStatus(match) {
  const flowStatus = classifyBulletinMatch(match);
  return {
    ...match,
    status: flowStatus === "scheduled" ? (match.status || "scheduled") : flowStatus,
    liveStatus: flowStatus,
    flow_status: flowStatus
  };
}

function row(match) {
  const score = match.score || (match.homeScore !== null && match.homeScore !== undefined && match.awayScore !== null && match.awayScore !== undefined ? `${match.homeScore}-${match.awayScore}` : "-");
  return `- ${match.date} ${match.time || "--:--"} | ${match.league || "Lig"} | ${match.home || "?"} - ${match.away || "?"} | ${match.flow_status || match.status || "scheduled"} | ${score}`;
}

function allReportMatches(report) {
  return [
    ...(Array.isArray(report?.matches) ? report.matches : []),
    ...(Array.isArray(report?.live_matches) ? report.live_matches : []),
    ...(Array.isArray(report?.finished_matches) ? report.finished_matches : [])
  ];
}

function usableFallback(report, days) {
  const allowed = new Set(days);
  return allReportMatches(report).filter((match) => allowed.has(String(match.date || "").slice(0, 10))).map(withFlowStatus);
}

function buildReport(sourceWindowMatches, days, options = {}) {
  const flowMatches = sourceWindowMatches.map(withFlowStatus);
  const matches = filterActiveBulletinMatches(flowMatches).map(withFlowStatus);
  const liveMatches = flowMatches.filter((m) => m.flow_status === "live");
  const finishedMatches = flowMatches.filter((m) => ["finished", "cancelled", "postponed"].includes(m.flow_status));
  const byDay = Object.fromEntries(days.map((day) => [day, matches.filter((m) => m.date === day).length]));
  const removedInactiveCount = countInactiveBulletinMatches(sourceWindowMatches);
  const report = {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: options.source || "fixtures.json",
    warning: options.warning || "",
    days,
    total_source_matches: sourceWindowMatches.length,
    total_matches: matches.length,
    active_match_count: matches.length,
    live_match_count: liveMatches.length,
    finished_match_count: finishedMatches.length,
    removed_finished_count: removedInactiveCount,
    removed_statuses: ["live", "finished", "cancelled", "postponed"],
    by_day: byDay,
    matches,
    live_matches: liveMatches,
    finished_matches: finishedMatches
  };
  const scheduledRows = matches.map(row).join("\n");
  const liveRows = liveMatches.map(row).join("\n");
  const finishedRows = finishedMatches.map(row).join("\n");
  const md = `# Iki Gunluk Bulten\n\nGunler: ${days.join(" / ")}\nKaynak: ${report.source}\n${report.warning ? `Uyari: ${report.warning}\n` : ""}Ham mac: ${sourceWindowMatches.length}\nAktif mac: ${matches.length}\nCanli mac: ${liveMatches.length}\nBiten mac: ${finishedMatches.length}\nBultenden dusurulen mac: ${removedInactiveCount}\nBugun: ${byDay[days[0]]}\nYarin: ${byDay[days[1]]}\n\n## Baslamamis Maclar\n${scheduledRows || "Mac bekleniyor."}\n\n## Canli Maclar\n${liveRows || "Canli mac yok."}\n\n## Biten Maclar\n${finishedRows || "Biten mac yok."}\n`;
  return { report, md };
}

function runTwoDayBulletinWindow() {
  const fixtures = readJson(fixturesFile, []);
  const sourceMatches = Array.isArray(fixtures) ? fixtures : [];
  const previousReport = readJson(outJson, null);
  const days = [trDate(0), trDate(1)];
  let sourceWindowMatches = sourceMatches.filter((m) => days.includes(String(m.date || "").slice(0, 10)));
  let source = "fixtures.json";
  let warning = "";

  if (!sourceWindowMatches.length) {
    const fallbackMatches = usableFallback(previousReport, days);
    if (fallbackMatches.length) {
      sourceWindowMatches = fallbackMatches;
      source = "son saglam two-day-bulletin yedegi";
      warning = "Yeni Maçkolik/fixtures kaynağı boş geldi; son geçerli iki günlük bülten korundu.";
    }
  }

  const { report, md } = buildReport(sourceWindowMatches, days, { source, warning });
  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Two-day bulletin window: ${report.active_match_count} active, ${report.live_match_count} live, ${report.finished_match_count} finished. Removed: ${report.removed_finished_count}. Source: ${source}.`);
  return report;
}

if (require.main === module) runTwoDayBulletinWindow();
module.exports = { runTwoDayBulletinWindow };

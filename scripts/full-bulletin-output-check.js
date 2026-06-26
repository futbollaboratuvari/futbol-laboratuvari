const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const outputDir = path.join(rootDir, "outputs");
const fullBulletinPath = path.join(dataDir, "full-bulletin.json");
const healthPath = path.join(dataDir, "full-bulletin-health.json");
const reportPath = path.join(outputDir, "full_bulletin_test_report.md");

const readJson = (filePath, fallback) => {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const writeText = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, "utf8");
};

const parseClockMinutes = (time) => {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const isEarly = (match) => {
  const minute = parseClockMinutes(match.time);
  return minute !== null && minute < 8 * 60;
};

const row = (cells) => `| ${cells.map((cell) => String(cell ?? "-").replace(/\|/g, "/")).join(" | ")} |`;

const main = () => {
  const bulletin = readJson(fullBulletinPath, null);
  const matches = Array.isArray(bulletin?.matches) ? bulletin.matches : [];
  const earlyMatches = matches.filter(isEarly);
  const liveMatches = matches.filter((match) => String(match.status || "").toLowerCase() === "live");
  const firstMatches = matches.slice(0, 10);

  const health = {
    generated_at: new Date().toISOString(),
    status: matches.length ? "pass" : "waiting",
    source_status: bulletin?.status || "missing",
    full_bulletin_exists: Boolean(bulletin),
    match_count: matches.length,
    early_match_count: earlyMatches.length,
    live_match_count: liveMatches.length,
    first_match: matches[0] || null,
    date_window: bulletin?.date_window || null,
    notes: matches.length
      ? ["full-bulletin.json veri uretti.", earlyMatches.length ? "Erken saat maclari yakalandi." : "Erken saat maci yok veya kaynakta bulunamadi."]
      : ["full-bulletin.json henuz mac listesi uretmedi."]
  };

  writeJson(healthPath, health);

  const report = [
    "# Full Bulletin Test Report",
    "",
    `- Generated: ${health.generated_at}`,
    `- Status: ${health.status}`,
    `- Source status: ${health.source_status}`,
    `- Match count: ${health.match_count}`,
    `- Early match count 00:00-07:59: ${health.early_match_count}`,
    `- Live match count: ${health.live_match_count}`,
    `- Date window: ${health.date_window ? `${health.date_window.main_day || "-"} / ${health.date_window.includes_next_day_until || "-"}` : "-"}`,
    "",
    "## First Matches",
    row(["Date", "Time", "League", "Home", "Away", "Status", "MS1", "MSX", "MS2"]),
    row(["---", "---", "---", "---", "---", "---", "---", "---", "---"]),
    ...firstMatches.map((match) => row([
      match.date,
      match.time,
      match.league,
      match.home,
      match.away,
      match.status,
      match.odds?.ms1,
      match.odds?.msx,
      match.odds?.ms2,
    ])),
    "",
    "## Notes",
    ...health.notes.map((note) => `- ${note}`),
    ""
  ].join("\n");

  writeText(reportPath, report);
  console.log(`Full bulletin check: ${health.status}. Matches: ${health.match_count}. Early: ${health.early_match_count}. Live: ${health.live_match_count}`);
};

main();

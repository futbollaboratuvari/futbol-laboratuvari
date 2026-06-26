const fs = require("fs");
const path = require("path");
const { filterActiveBulletinMatches, countInactiveBulletinMatches } = require("./bulletin-active-filter");

const rootDir = path.join(__dirname, "..");
const fixturesPath = path.join(rootDir, "data", "fixtures.json");
const bulletinPath = path.join(rootDir, "data", "spor_toto_bulteni.json");
const reportPath = path.join(rootDir, "outputs", "spor-toto-bulletin-rebuild-report.md");

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
};

const writeText = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, "utf8");
};

const trDate = (offset = 0) => {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  local.setDate(local.getDate() + offset);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const safeNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeFixture = (fixture, index) => ({
  no: index + 1,
  week: `${trDate(0)} / ${trDate(6)}`,
  date: fixture.date || "",
  time: fixture.time || "",
  league: fixture.league || fixture.competition_name || "Lig",
  home: fixture.home || fixture.home_team_name || "",
  away: fixture.away || fixture.away_team_name || "",
  match: `${fixture.home || fixture.home_team_name || "?"} - ${fixture.away || fixture.away_team_name || "?"}`,
  one: safeNumber(fixture.one ?? fixture.oneOdd ?? fixture.ms1 ?? fixture.odd1),
  draw: safeNumber(fixture.draw ?? fixture.drawOdd ?? fixture.msx ?? fixture.oddX),
  two: safeNumber(fixture.two ?? fixture.twoOdd ?? fixture.ms2 ?? fixture.odd2),
  oneOdd: safeNumber(fixture.oneOdd ?? fixture.one ?? fixture.ms1 ?? fixture.odd1),
  drawOdd: safeNumber(fixture.drawOdd ?? fixture.draw ?? fixture.msx ?? fixture.oddX),
  twoOdd: safeNumber(fixture.twoOdd ?? fixture.two ?? fixture.ms2 ?? fixture.odd2),
  decision: "Bekleniyor",
  className: "Haftalık Spor Toto",
  minute: fixture.minute ?? null,
  homeScore: fixture.homeScore ?? null,
  awayScore: fixture.awayScore ?? null,
  score: fixture.score || "-",
  status: fixture.status || fixture.liveStatus || "scheduled",
  source: fixture.source || "Maçkolik canlı robot",
});

const sortFixtures = (items) => [...items].sort((a, b) =>
  String(a.date || "").localeCompare(String(b.date || "")) ||
  String(a.time || "99:99").localeCompare(String(b.time || "99:99")) ||
  String(a.home || "").localeCompare(String(b.home || ""))
);

const run = () => {
  const fixtures = readJson(fixturesPath, []);
  const sourceMatches = Array.isArray(fixtures) ? fixtures : [];
  const today = trDate(0);
  const tomorrow = trDate(1);
  const sourceWindowMatches = sourceMatches.filter((fixture) => [today, tomorrow].includes(fixture.date));
  const activeMatches = sortFixtures(filterActiveBulletinMatches(sourceWindowMatches));
  const visibleMatches = activeMatches.slice(0, 15);
  const removedInactiveCount = countInactiveBulletinMatches(sourceWindowMatches);

  const bulletin = {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: sourceMatches.length ? "Robot fixtures sonrası yeniden üretildi" : "Maçkolik canlı veri bekleniyor",
    week_label: `${today} / ${trDate(6)}`,
    total_source_matches: sourceWindowMatches.length,
    active_match_count: activeMatches.length,
    removed_finished_count: removedInactiveCount,
    removed_statuses: ["finished", "cancelled", "postponed"],
    match_count: visibleMatches.length,
    matches: visibleMatches.map(normalizeFixture),
  };

  const rows = bulletin.matches
    .map((match) => `- ${match.no}. ${match.date} ${match.time || "--:--"} | ${match.league} | ${match.home} - ${match.away} | ${match.status}`)
    .join("\n");

  const report = `# Spor Toto Bulten Rebuild Raporu\n\n- Guncelleme: ${bulletin.generated_at}\n- Ham fixture sayisi: ${sourceMatches.length}\n- Bugun/yarin kaynak mac: ${sourceWindowMatches.length}\n- Aktif bulten maci: ${activeMatches.length}\n- Gosterilen mac: ${visibleMatches.length}\n- Bultenden dusurulen mac: ${removedInactiveCount}\n\n${rows || "Mac bekleniyor."}\n`;

  writeText(bulletinPath, `${JSON.stringify(bulletin, null, 2)}\n`);
  writeText(reportPath, report);

  console.log(`Spor Toto bulletin rebuilt. Source: ${sourceWindowMatches.length}. Active: ${activeMatches.length}. Visible: ${visibleMatches.length}. Removed: ${removedInactiveCount}.`);
  return bulletin;
};

if (require.main === module) run();
module.exports = { run };

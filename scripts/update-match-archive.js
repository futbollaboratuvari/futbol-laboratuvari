const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const fixturesPath = path.join(root, "data", "fixtures.json");
const archivePath = path.join(root, "data", "robot_match_archive.json");

const readJson = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return fallback; }
};

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const keyOf = (match) => [match.date, match.time, match.league, match.home, match.away]
  .map((part) => String(part || "").trim().toLowerCase())
  .join("|");

const normalizeStatus = (status) => {
  const text = String(status || "scheduled").toLowerCase();
  if (["finished", "full_time", "ft", "tamamlandı", "bitti"].includes(text)) return "finished";
  if (["live", "canlı"].includes(text)) return "live";
  return "scheduled";
};

const parseScore = (match) => {
  const score = match.score || match.result || match.result_score || "";
  const found = String(score).match(/(\d+)\D+(\d+)/);
  if (!found) return null;
  return { home: Number(found[1]), away: Number(found[2]) };
};

const addTeam = (index, name) => {
  if (!name) return;
  if (!index[name]) {
    index[name] = {
      team: name,
      matches: 0,
      finished: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      recent: []
    };
  }
};

const updateTeamStats = (index, match) => {
  addTeam(index, match.home);
  addTeam(index, match.away);
  const home = index[match.home];
  const away = index[match.away];
  if (!home || !away) return;
  home.matches += 1;
  away.matches += 1;
  const score = parseScore(match);
  if (normalizeStatus(match.status) !== "finished" || !score) return;

  home.finished += 1;
  away.finished += 1;
  home.goals_for += score.home;
  home.goals_against += score.away;
  away.goals_for += score.away;
  away.goals_against += score.home;

  let homeResult = "D";
  let awayResult = "D";
  if (score.home > score.away) { home.wins += 1; away.losses += 1; homeResult = "W"; awayResult = "L"; }
  else if (score.home < score.away) { away.wins += 1; home.losses += 1; homeResult = "L"; awayResult = "W"; }
  else { home.draws += 1; away.draws += 1; }

  home.recent.push({ date: match.date, opponent: match.away, result: homeResult, score: `${score.home}-${score.away}` });
  away.recent.push({ date: match.date, opponent: match.home, result: awayResult, score: `${score.away}-${score.home}` });
  home.recent = home.recent.slice(-10);
  away.recent = away.recent.slice(-10);
};

const rebuildTeamIndex = (matches) => {
  const index = {};
  matches.forEach((match) => updateTeamStats(index, match));
  return index;
};

const main = () => {
  const fixtures = readJson(fixturesPath, []);
  const archive = readJson(archivePath, {
    generated_at: null,
    timezone: "Europe/Istanbul",
    visibility: "robot_internal_not_shown_on_site",
    description: "Robotun analiz icin kullandigi kalici mac arsivi. Site ziyaretcisine gosterilmez.",
    matches: [],
    team_index: {}
  });

  const map = new Map((archive.matches || []).map((match) => [keyOf(match), match]));

  fixtures.forEach((match) => {
    const key = keyOf(match);
    const old = map.get(key) || {};
    map.set(key, {
      ...old,
      ...match,
      status: normalizeStatus(match.status),
      source: match.source || old.source || "site_fixture_flow",
      archived_at: old.archived_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  });

  const matches = [...map.values()].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || String(a.time || "").localeCompare(String(b.time || "")));
  archive.generated_at = new Date().toISOString();
  archive.matches = matches;
  archive.team_index = rebuildTeamIndex(matches);

  writeJson(archivePath, archive);
  console.log(`Robot mac arsivi guncellendi. Toplam mac: ${matches.length}`);
};

main();

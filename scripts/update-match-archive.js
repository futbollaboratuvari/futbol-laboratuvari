const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const fixturesPath = path.join(root, "data", "fixtures.json");
const archivePath = path.join(root, "data", "robot_match_archive.json");
const FINISHED_AFTER_MINUTES = 135;

const readJson = (file, fallback) => {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    if (!text) return fallback;
    return JSON.parse(text);
  } catch {
    return fallback;
  }
};

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const keyOf = (match) => [match.date, match.time, match.league, match.home, match.away]
  .map((part) => String(part || "").trim().toLowerCase())
  .join("|");

const normalizeStatus = (status) => {
  const text = String(status || "scheduled").trim().toLowerCase();
  if (["finished", "full_time", "full-time", "ft", "after_extra_time", "aet", "penalty", "penalties", "tamamlandı", "tamamlandi", "bitti", "sona erdi"].includes(text)) return "finished";
  if (["live", "in_play", "playing", "canlı", "canli"].includes(text)) return "live";
  if (["postponed", "delayed", "ertelendi"].includes(text)) return "postponed";
  if (["cancelled", "canceled", "abandoned", "iptal", "iptal edildi"].includes(text)) return "cancelled";
  return "scheduled";
};

const istanbulNow = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date()).reduce((acc, item) => {
    acc[item.type] = item.value;
    return acc;
  }, {});

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
};

const timeToMinutes = (time) => {
  const found = String(time || "").match(/(\d{1,2})[:.](\d{2})/);
  if (!found) return null;
  const hour = Number(found[1]);
  const minute = Number(found[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
};

const shouldArchive = (match, now = istanbulNow()) => {
  const status = normalizeStatus(match.status || match.match_status || match.status_short || match.state);
  if (["finished", "cancelled"].includes(status)) return true;
  if (status === "live") return false;

  const date = String(match.date || "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  if (date < now.date) return true;
  if (date > now.date) return false;

  const kickoff = timeToMinutes(match.time || match.kickoff || match.match_time);
  if (kickoff === null) return false;
  return now.minutes >= kickoff + FINISHED_AFTER_MINUTES;
};

const archiveMatch = (match, old = {}, nowIso = new Date().toISOString()) => {
  const status = normalizeStatus(match.status || match.match_status || match.status_short || match.state);
  const inferredFinished = shouldArchive(match) && status === "scheduled";
  return {
    ...old,
    ...match,
    status: inferredFinished ? "finished" : status,
    inferred_finished: Boolean(old.inferred_finished || inferredFinished),
    source: match.source || old.source || "site_fixture_flow",
    archived_at: old.archived_at || nowIso,
    updated_at: nowIso
  };
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

const sortByDateTime = (a, b) => String(a.date || "").localeCompare(String(b.date || "")) || String(a.time || "").localeCompare(String(b.time || ""));

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

  const now = istanbulNow();
  const nowIso = new Date().toISOString();
  const map = new Map((archive.matches || []).map((match) => [keyOf(match), match]));
  const activeFixtures = [];

  fixtures.forEach((match) => {
    if (shouldArchive(match, now)) {
      const key = keyOf(match);
      map.set(key, archiveMatch(match, map.get(key) || {}, nowIso));
      return;
    }

    activeFixtures.push({
      ...match,
      status: normalizeStatus(match.status || match.match_status || match.status_short || match.state)
    });
  });

  const matches = [...map.values()].sort(sortByDateTime);
  archive.generated_at = nowIso;
  archive.matches = matches;
  archive.team_index = rebuildTeamIndex(matches);

  writeJson(archivePath, archive);
  writeJson(fixturesPath, activeFixtures.sort(sortByDateTime));
  console.log(`Robot mac arsivi guncellendi. Arsiv: ${matches.length}, aktif bulten: ${activeFixtures.length}`);
};

main();

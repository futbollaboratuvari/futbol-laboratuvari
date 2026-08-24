const fs = require("fs");
const https = require("https");
const path = require("path");

const root = path.join(__dirname, "..");
const archiveFile = path.join(root, "data", "robot_match_archive.json");
const fixturesFile = path.join(root, "data", "fixtures.json");
const liveFile = path.join(root, "data", "live-matches.json");
const memoryFile = path.join(root, "data", "learning-memory.json");
const statusFile = path.join(root, "data", "final-score-sync-status.json");

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);
const MAX_DATES_PER_RUN = Math.max(1, Number(process.env.RESULT_DATE_LIMIT || 3));
const RECHECK_INTERVAL_MS = Math.max(30, Number(process.env.RESULT_RECHECK_MINUTES || 120)) * 60 * 1000;
const FINISHED_AFTER_MINUTES = 135;

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function istanbulParts(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
}

function istanbulDate(date = new Date()) {
  const parts = istanbulParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function istanbulMinutes(date = new Date()) {
  const parts = istanbulParts(date);
  const hour = Number(parts.hour === "24" ? "0" : parts.hour || 0);
  return hour * 60 + Number(parts.minute || 0);
}

function normalizeTeam(value) {
  const generic = new Set(["fc", "cf", "sc", "afc", "fk", "sk", "ac", "ca", "club", "football", "futbol"]);
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token && !generic.has(token))
    .join(" ");
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;
    for (let column = 1; column <= b.length; column += 1) {
      const old = previous[column];
      previous[column] = Math.min(
        previous[column] + 1,
        previous[column - 1] + 1,
        diagonal + (a[row - 1] === b[column - 1] ? 0 : 1),
      );
      diagonal = old;
    }
  }
  return previous[b.length];
}

function teamSimilarity(left, right) {
  const a = normalizeTeam(left);
  const b = normalizeTeam(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  const compactA = a.replace(/\s+/g, "");
  const compactB = b.replace(/\s+/g, "");
  const shortest = Math.min(compactA.length, compactB.length);
  const longest = Math.max(compactA.length, compactB.length);
  if (shortest >= 5 && (compactA.startsWith(compactB) || compactB.startsWith(compactA) || compactA.endsWith(compactB) || compactB.endsWith(compactA))) {
    return 0.9 + (shortest / longest) * 0.08;
  }
  const distanceScore = 1 - levenshtein(compactA, compactB) / longest;
  const tokensA = new Set(a.split(" "));
  const tokensB = new Set(b.split(" "));
  const intersection = [...tokensA].filter((token) => tokensB.has(token)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  const tokenScore = union ? intersection / union : 0;
  return Math.max(distanceScore, tokenScore);
}

function splitMatchName(value) {
  const parts = String(value || "").split(/\s+-\s+|\s+vs\.?\s+/i);
  return parts.length >= 2 ? { home: parts[0].trim(), away: parts.slice(1).join(" - ").trim() } : { home: "", away: "" };
}

function teamsOf(item) {
  const split = splitMatchName(item.match_name || item.match || item.title || "");
  return {
    home: item.home || item.home_team_name || split.home,
    away: item.away || item.away_team_name || split.away,
  };
}

function dateOf(item) {
  return String(item.date || item.tarih || item.utc_date || "").slice(0, 10);
}

function pairSimilarity(left, right) {
  const a = teamsOf(left);
  const b = teamsOf(right);
  const home = teamSimilarity(a.home, b.home);
  const away = teamSimilarity(a.away, b.away);
  return { home, away, score: (home + away) / 2 };
}

function findResultForMatch(match, results) {
  const sameDate = results.filter((result) => dateOf(result) === dateOf(match));
  const ranked = sameDate
    .map((result) => ({ result, quality: pairSimilarity(match, result) }))
    .filter((entry) => entry.quality.home >= 0.62 && entry.quality.away >= 0.62 && entry.quality.score >= 0.78)
    .sort((a, b) => b.quality.score - a.quality.score);
  if (!ranked.length) return null;
  if (ranked[1] && ranked[0].quality.score - ranked[1].quality.score < 0.025) return null;
  return ranked[0];
}

function scoreText(home, away) {
  const h = Number(home);
  const a = Number(away);
  return Number.isFinite(h) && Number.isFinite(a) ? `${h}-${a}` : "";
}

function apiFootballResults(payload) {
  return (Array.isArray(payload?.response) ? payload.response : []).flatMap((row) => {
    const short = String(row?.fixture?.status?.short || "").toUpperCase();
    if (!FINISHED_STATUSES.has(short)) return [];
    const fullTime = row?.score?.fulltime || {};
    const homeScore = fullTime.home ?? row?.goals?.home;
    const awayScore = fullTime.away ?? row?.goals?.away;
    const score = scoreText(homeScore, awayScore);
    if (!score) return [];
    return [{
      date: istanbulDate(new Date(row.fixture.date)),
      home: row?.teams?.home?.name || "",
      away: row?.teams?.away?.name || "",
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      score,
      status: "finished",
      source: "API-Football",
      source_match_id: row?.fixture?.id || null,
    }];
  });
}

function footballDataResults(payload) {
  return (Array.isArray(payload?.matches) ? payload.matches : []).flatMap((row) => {
    if (String(row?.status || "").toUpperCase() !== "FINISHED") return [];
    const regular = row?.score?.regularTime || {};
    const fullTime = row?.score?.fullTime || {};
    const homeScore = regular.home ?? fullTime.home;
    const awayScore = regular.away ?? fullTime.away;
    const score = scoreText(homeScore, awayScore);
    if (!score) return [];
    return [{
      date: istanbulDate(new Date(row.utcDate)),
      home: row?.homeTeam?.name || row?.homeTeam?.shortName || "",
      away: row?.awayTeam?.name || row?.awayTeam?.shortName || "",
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      score,
      status: "finished",
      source: "football-data.org",
      source_match_id: row.id || null,
    }];
  });
}

function espnResults(payload) {
  return (Array.isArray(payload?.events) ? payload.events : []).flatMap((event) => {
    const competition = event?.competitions?.[0] || {};
    const status = event?.status?.type || competition?.status?.type || {};
    if (!status.completed || !["STATUS_FULL_TIME", "STATUS_FINAL_PEN"].includes(String(status.name || ""))) return [];
    const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
    const home = competitors.find((item) => item.homeAway === "home") || competitors[0];
    const away = competitors.find((item) => item.homeAway === "away") || competitors[1];
    const homeScore = Number(home?.score);
    const awayScore = Number(away?.score);
    const score = scoreText(homeScore, awayScore);
    if (!home || !away || !score) return [];
    return [{
      date: istanbulDate(new Date(event.date || competition.date)),
      home: home?.team?.displayName || home?.team?.shortDisplayName || home?.team?.name || "",
      away: away?.team?.displayName || away?.team?.shortDisplayName || away?.team?.name || "",
      homeScore,
      awayScore,
      score,
      status: "finished",
      source: "ESPN Scoreboard",
      source_match_id: event.id || competition.id || null,
    }];
  });
}

function sportsDbResults(payload) {
  return (Array.isArray(payload?.events) ? payload.events : []).flatMap((event) => {
    const status = String(event.strStatus || "").toUpperCase();
    if (status && !["FT", "MATCH FINISHED", "FINISHED"].includes(status)) return [];
    const homeScore = Number(event.intHomeScore);
    const awayScore = Number(event.intAwayScore);
    const score = scoreText(homeScore, awayScore);
    if (!event.strHomeTeam || !event.strAwayTeam || !score) return [];
    return [{
      date: String(event.dateEvent || "").slice(0, 10),
      home: event.strHomeTeam,
      away: event.strAwayTeam,
      homeScore,
      awayScore,
      score,
      status: "finished",
      source: "TheSportsDB",
      source_match_id: event.idEvent || null,
    }];
  });
}

function requestJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { Accept: "application/json", "User-Agent": "FutbolLaboratuvari-ResultSync/1.0", ...headers } }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode}: ${body.slice(0, 180)}`));
          return;
        }
        try { resolve(JSON.parse(body)); }
        catch { reject(new Error("Sonuç kaynağı geçerli JSON döndürmedi.")); }
      });
    });
    request.setTimeout(30000, () => request.destroy(new Error("Sonuç kaynağı zaman aşımına uğradı.")));
    request.on("error", reject);
  });
}

function uniqueKeys(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

async function fetchDateResults(date) {
  const apiFootballKeys = uniqueKeys([process.env.API_FOOTBALL_KEY, process.env.API_FOOTBALL_KEY2]);
  const errors = [];
  const results = [];
  const sources = [];
  for (const apiKey of apiFootballKeys) {
    try {
      const payload = await requestJson(
        `https://v3.football.api-sports.io/fixtures?date=${encodeURIComponent(date)}&timezone=Europe%2FIstanbul`,
        { "x-apisports-key": apiKey },
      );
      if (payload?.errors && Object.keys(payload.errors).length) throw new Error(JSON.stringify(payload.errors));
      results.push(...apiFootballResults(payload));
      sources.push("API-Football");
      break;
    } catch (error) {
      errors.push(`API-Football: ${error.message}`);
    }
  }

  const footballDataKey = String(process.env.FOOTBALL_DATA_API_KEY || "").trim();
  if (footballDataKey) {
    try {
      const payload = await requestJson(
        `https://api.football-data.org/v4/matches?dateFrom=${encodeURIComponent(date)}&dateTo=${encodeURIComponent(date)}`,
        { "X-Auth-Token": footballDataKey },
      );
      results.push(...footballDataResults(payload));
      sources.push("football-data.org");
    } catch (error) {
      errors.push(`football-data.org: ${error.message}`);
    }
  }

  try {
    const compactDate = date.replaceAll("-", "");
    const payload = await requestJson(`https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?dates=${compactDate}&limit=1000`);
    results.push(...espnResults(payload));
    sources.push("ESPN Scoreboard");
  } catch (error) {
    errors.push(`ESPN Scoreboard: ${error.message}`);
  }

  try {
    const payload = await requestJson(`https://www.thesportsdb.com/api/v1/json/123/eventsday.php?d=${encodeURIComponent(date)}&s=Soccer`);
    results.push(...sportsDbResults(payload));
    sources.push("TheSportsDB");
  } catch (error) {
    errors.push(`TheSportsDB: ${error.message}`);
  }

  return {
    source: sources.join(" + ") || "unavailable",
    results: dedupeResults(results),
    errors,
  };
}

function timeMinutes(value) {
  const found = String(value || "").match(/(\d{1,2})[:.](\d{2})/);
  return found ? Number(found[1]) * 60 + Number(found[2]) : null;
}

function eligiblePrediction(item, now = new Date()) {
  if (item.status !== "pending" || item.result_score) return false;
  const date = dateOf(item);
  const today = istanbulDate(now);
  if (!date || date > today) return false;
  if (date < today) return true;
  const kickoff = timeMinutes(item.start_time || item.time);
  return kickoff !== null && istanbulMinutes(now) >= kickoff + FINISHED_AFTER_MINUTES;
}

function datesToCheck(memory, previousStatus, now = new Date()) {
  const dates = [...new Set((memory.predictions || []).filter((item) => eligiblePrediction(item, now)).map(dateOf))].sort();
  const checks = previousStatus?.date_checks || {};
  return dates.filter((date) => {
    const lastSuccess = Date.parse(checks[date]?.last_success_at || "");
    return !Number.isFinite(lastSuccess) || now.getTime() - lastSuccess >= RECHECK_INTERVAL_MS;
  }).slice(0, MAX_DATES_PER_RUN);
}

function applyResults(rows, results, nowIso = new Date().toISOString()) {
  let updated = 0;
  let alreadyScored = 0;
  let unmatched = 0;
  const matches = (Array.isArray(rows) ? rows : []).map((row) => {
    const existingScore = scoreText(row.homeScore ?? row.home_score, row.awayScore ?? row.away_score) || String(row.score || row.result_score || "").trim();
    if (existingScore) {
      alreadyScored += 1;
      return row;
    }
    const match = findResultForMatch(row, results);
    if (!match) {
      if (results.some((result) => dateOf(result) === dateOf(row))) unmatched += 1;
      return row;
    }
    updated += 1;
    return {
      ...row,
      status: "finished",
      liveStatus: "finished",
      minute: 90,
      homeScore: match.result.homeScore,
      awayScore: match.result.awayScore,
      score: match.result.score,
      result_score: match.result.score,
      inferred_finished: false,
      score_source: match.result.source,
      score_source_match_id: match.result.source_match_id,
      score_updated_at: nowIso,
      updated_at: nowIso,
    };
  });
  return { matches, updated, alreadyScored, unmatched };
}

function dedupeResults(results) {
  const map = new Map();
  for (const result of results) {
    const teams = teamsOf(result);
    const key = [dateOf(result), normalizeTeam(teams.home), normalizeTeam(teams.away)].join("|");
    if (key && result.score) map.set(key, result);
  }
  return [...map.values()];
}

async function runFinalScoreSync() {
  const memory = readJson(memoryFile, { predictions: [] });
  const archive = readJson(archiveFile, { matches: [] });
  const fixtures = readJson(fixturesFile, []);
  const live = readJson(liveFile, { matches: [] });
  const previousStatus = readJson(statusFile, { date_checks: {} });
  const now = new Date();
  const nowIso = now.toISOString();
  const dates = datesToCheck(memory, previousStatus, now);
  const dateChecks = { ...(previousStatus.date_checks || {}) };
  const fetchedResults = [];
  const sources = new Set();
  const errors = [];

  for (const date of dates) {
    const response = await fetchDateResults(date);
    fetchedResults.push(...response.results);
    sources.add(response.source);
    errors.push(...response.errors.map((message) => `${date}: ${message}`));
    dateChecks[date] = {
      last_attempt_at: nowIso,
      last_success_at: response.source === "unavailable" ? (dateChecks[date]?.last_success_at || null) : nowIso,
      source: response.source,
      finished_result_count: response.results.length,
      error_count: response.errors.length,
    };
  }

  const results = dedupeResults(fetchedResults);
  const archiveUpdate = applyResults(archive.matches || [], results, nowIso);
  const fixtureUpdate = applyResults(Array.isArray(fixtures) ? fixtures : [], results, nowIso);
  const liveUpdate = applyResults(Array.isArray(live.matches) ? live.matches : [], results, nowIso);

  archive.matches = archiveUpdate.matches;
  archive.generated_at = nowIso;
  live.matches = liveUpdate.matches;
  if (archiveUpdate.updated) writeJson(archiveFile, archive);
  if (fixtureUpdate.updated) writeJson(fixturesFile, fixtureUpdate.matches);
  if (liveUpdate.updated) writeJson(liveFile, live);

  const status = {
    generated_at: nowIso,
    status: !dates.length ? "waiting" : sources.has("unavailable") && sources.size === 1 ? "source_unavailable" : errors.length ? "partial" : "ok",
    checked_dates: dates,
    source: [...sources].filter((source) => source !== "unavailable").join(" + ") || "-",
    fetched_finished_result_count: results.length,
    archived_score_update_count: archiveUpdate.updated,
    fixture_score_update_count: fixtureUpdate.updated,
    live_score_update_count: liveUpdate.updated,
    pending_prediction_count: (memory.predictions || []).filter((item) => item.status === "pending").length,
    errors: errors.slice(0, 20),
    date_checks: dateChecks,
  };
  writeJson(statusFile, status);
  console.log(`Final score sync: ${status.status}. Dates: ${dates.length}, Results: ${results.length}, Archive updates: ${archiveUpdate.updated}`);
  return status;
}

if (require.main === module) {
  runFinalScoreSync().catch((error) => {
    console.error(`Final score sync failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  apiFootballResults,
  applyResults,
  datesToCheck,
  eligiblePrediction,
  espnResults,
  fetchDateResults,
  findResultForMatch,
  footballDataResults,
  normalizeTeam,
  pairSimilarity,
  runFinalScoreSync,
  sportsDbResults,
  teamSimilarity,
};

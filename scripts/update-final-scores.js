const fs = require("fs");
const https = require("https");
const path = require("path");
const { writeJson } = require("./json-file-policy");
const { fetchIddaaEventDetail } = require("./iddaa-data-source");

const root = path.join(__dirname, "..");
const archiveFile = path.join(root, "data", "robot_match_archive.json");
const fixturesFile = path.join(root, "data", "fixtures.json");
const liveFile = path.join(root, "data", "live-matches.json");
const memoryFile = path.join(root, "data", "learning-memory.json");
const statusFile = path.join(root, "data", "final-score-sync-status.json");

const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);
const MAX_DATES_PER_RUN = Math.max(1, Math.min(14, Number(process.env.RESULT_DATE_LIMIT || 7)));
const RECHECK_INTERVAL_MS = Math.max(30, Number(process.env.RESULT_RECHECK_MINUTES || 60)) * 60 * 1000;
const FINISHED_AFTER_MINUTES = 135;
const IDDAA_RESULT_DETAIL_LIMIT = Math.max(0, Math.min(120, Number(process.env.IDDAA_RESULT_DETAIL_LIMIT || 60)));
const IDDAA_RESULT_DETAIL_CONCURRENCY = Math.max(1, Math.min(6, Number(process.env.IDDAA_RESULT_DETAIL_CONCURRENCY || 4)));
const IDDAA_RESULT_RECHECK_MS = Math.max(60, Number(process.env.IDDAA_RESULT_RECHECK_MINUTES || 180)) * 60 * 1000;
const ENABLE_SOFASCORE = String(process.env.RESULT_ENABLE_SOFASCORE || "1").trim() !== "0";

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
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

function addDays(date, days) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))
    ? new Date(`${date}T12:00:00Z`)
    : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return "";
  parsed.setUTCDate(parsed.getUTCDate() + Number(days || 0));
  return parsed.toISOString().slice(0, 10);
}

function resultDatesForMatch(match) {
  const date = dateOf(match);
  if (!date) return [];
  const dates = [date];
  const kickoff = timeMinutes(match?.start_time || match?.time);
  if (kickoff !== null && kickoff < 7 * 60) dates.push(addDays(date, 1));
  return dates.filter(Boolean);
}

function resultScore(result) {
  return scoreText(
    result?.homeScore ?? result?.home_score ?? result?.homeGoals ?? result?.home_goals,
    result?.awayScore ?? result?.away_score ?? result?.awayGoals ?? result?.away_goals,
  ) || String(result?.score || result?.result_score || "").trim();
}

function sameFixtureRows(left, right) {
  if (!left || !right) return false;
  const similarity = pairSimilarity(left, right);
  return similarity.home >= 0.78 && similarity.away >= 0.78 && similarity.score >= 0.88;
}

function equivalentResultRows(left, right) {
  if (!sameFixtureRows(left, right)) return false;
  const leftScore = resultScore(left);
  const rightScore = resultScore(right);
  return Boolean(leftScore && rightScore && leftScore === rightScore);
}

function findResultForMatch(match, results) {
  const allowedDates = new Set(resultDatesForMatch(match));
  const dated = results.filter((result) => allowedDates.has(dateOf(result)));
  const ranked = dated
    .map((result) => ({ result, quality: pairSimilarity(match, result) }))
    .filter((entry) => entry.quality.home >= 0.62 && entry.quality.away >= 0.62 && entry.quality.score >= 0.78)
    .sort((a, b) => b.quality.score - a.quality.score);
  if (!ranked.length) return null;

  const top = ranked[0];

  const sameFixtureCandidates = dated.filter((result) => sameFixtureRows(top.result, result));
  const knownScores = new Set(sameFixtureCandidates.map(resultScore).filter(Boolean));
  if (knownScores.size > 1) return null;

  const tied = ranked.slice(1).filter((entry) => top.quality.score - entry.quality.score < 0.025);
  if (tied.length && !tied.every((entry) => equivalentResultRows(top.result, entry.result))) return null;
  return top;
}

function scoreText(home, away) {
  if (home === null || home === undefined || away === null || away === undefined) return "";
  if (String(home).trim() === "" || String(away).trim() === "") return "";
  const h = Number(home);
  const a = Number(away);
  return Number.isFinite(h) && Number.isFinite(a) ? `${h}-${a}` : "";
}

function apiFootballResults(payload) {
  return (Array.isArray(payload?.response) ? payload.response : []).flatMap((row) => {
    const short = String(row?.fixture?.status?.short || "").toUpperCase();
    if (!FINISHED_STATUSES.has(short)) return [];
    const fullTime = row?.score?.fulltime || {};
    const halfTime = row?.score?.halftime || {};
    const homeScore = fullTime.home ?? row?.goals?.home;
    const awayScore = fullTime.away ?? row?.goals?.away;
    const score = scoreText(homeScore, awayScore);
    const halfTimeScore = scoreText(halfTime.home, halfTime.away);
    if (!score) return [];
    return [{
      date: istanbulDate(new Date(row.fixture.date)),
      home: row?.teams?.home?.name || "",
      away: row?.teams?.away?.name || "",
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      score,
      half_time_score: halfTimeScore,
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
    const halfTime = row?.score?.halfTime || {};
    const homeScore = regular.home ?? fullTime.home;
    const awayScore = regular.away ?? fullTime.away;
    const score = scoreText(homeScore, awayScore);
    const halfTimeScore = scoreText(halfTime.home, halfTime.away);
    if (!score) return [];
    return [{
      date: istanbulDate(new Date(row.utcDate)),
      home: row?.homeTeam?.name || row?.homeTeam?.shortName || "",
      away: row?.awayTeam?.name || row?.awayTeam?.shortName || "",
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      score,
      half_time_score: halfTimeScore,
      status: "finished",
      source: "football-data.org",
      source_match_id: row.id || null,
    }];
  });
}

function firstPeriodScore(competitor) {
  const rows = Array.isArray(competitor?.linescores) ? competitor.linescores : [];
  const first = rows[0];
  const value = typeof first === "object" && first !== null
    ? (first.value ?? first.displayValue)
    : first;
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
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
    const halfTimeScore = scoreText(firstPeriodScore(home), firstPeriodScore(away));
    if (!home || !away || !score) return [];
    return [{
      date: istanbulDate(new Date(event.date || competition.date)),
      home: home?.team?.displayName || home?.team?.shortDisplayName || home?.team?.name || "",
      away: away?.team?.displayName || away?.team?.shortDisplayName || away?.team?.name || "",
      homeScore,
      awayScore,
      score,
      half_time_score: halfTimeScore,
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
    const score = scoreText(event.intHomeScore, event.intAwayScore);
    if (!event.strHomeTeam || !event.strAwayTeam || !score) return [];
    const homeScore = Number(event.intHomeScore);
    const awayScore = Number(event.intAwayScore);
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

function sofascoreResults(payload) {
  return (Array.isArray(payload?.events) ? payload.events : []).flatMap((event) => {
    const statusType = String(event?.status?.type || "").toLowerCase();
    if (statusType !== "finished") return [];
    const homeValue = event?.homeScore?.normaltime ?? event?.homeScore?.current ?? event?.homeScore?.display;
    const awayValue = event?.awayScore?.normaltime ?? event?.awayScore?.current ?? event?.awayScore?.display;
    const score = scoreText(homeValue, awayValue);
    const halfTimeScore = scoreText(event?.homeScore?.period1, event?.awayScore?.period1);
    const timestamp = Number(event?.startTimestamp);
    if (!score || !event?.homeTeam?.name || !event?.awayTeam?.name || !Number.isFinite(timestamp)) return [];
    return [{
      date: istanbulDate(new Date(timestamp * 1000)),
      home: event.homeTeam.name || event.homeTeam.shortName || "",
      away: event.awayTeam.name || event.awayTeam.shortName || "",
      homeScore: Number(homeValue),
      awayScore: Number(awayValue),
      score,
      half_time_score: halfTimeScore,
      status: "finished",
      source: "SofaScore",
      source_match_id: event.id || null,
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
  const warnings = [];
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

  const compactDate = date.replaceAll("-", "");
  const espnErrors = [];
  for (const host of ["site.web.api.espn.com", "site.api.espn.com"]) {
    try {
      const payload = await requestJson(
        `https://${host}/apis/site/v2/sports/soccer/all/scoreboard?dates=${compactDate}&limit=1000`,
        { "User-Agent": "Mozilla/5.0 (compatible; FutbolLaboratuvari/1.0)", Referer: "https://www.espn.com/" },
      );
      results.push(...espnResults(payload));
      sources.push("ESPN Scoreboard");
      espnErrors.length = 0;
      break;
    } catch (error) {
      espnErrors.push(`${host}: ${error.message}`);
    }
  }
  if (espnErrors.length) errors.push(`ESPN Scoreboard: ${espnErrors.join(" | ")}`);

  if (ENABLE_SOFASCORE) {
    const sofaErrors = [];
    for (const host of ["www.sofascore.com", "api.sofascore.com"]) {
      try {
        const payload = await requestJson(
          `https://${host}/api/v1/sport/football/scheduled-events/${encodeURIComponent(date)}`,
          {
            "User-Agent": "Mozilla/5.0 (compatible; FutbolLaboratuvari-ResultSync/1.1)",
            Referer: "https://www.sofascore.com/",
            "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
          },
        );
        results.push(...sofascoreResults(payload));
        sources.push("SofaScore");
        sofaErrors.length = 0;
        break;
      } catch (error) {
        sofaErrors.push(`${host}: ${error.message}`);
      }
    }
    if (sofaErrors.length) warnings.push(`SofaScore fallback: ${sofaErrors.join(" | ")}`);
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
    warnings,
  };
}

function timeMinutes(value) {
  const found = String(value || "").match(/(\d{1,2})[:.](\d{2})/);
  return found ? Number(found[1]) * 60 + Number(found[2]) : null;
}

function requiresHalfTimeScore(item) {
  const market = String(item?.market || item?.recommended_market || item?.selection || "").toLocaleLowerCase("tr-TR");
  return /ilk yarı kg|ilk yari kg|ikinci yarı kg|ikinci yari kg|iy\/ms|ht\/ft|(^|\s)(1\/1|1\/2|2\/1)(\s|$)/.test(market);
}

function eligiblePrediction(item, now = new Date()) {
  if (item.status !== "pending") return false;
  const hasFullTime = Boolean(String(item.result_score || "").trim());
  const hasHalfTime = Boolean(String(item.half_time_score || item.halftime_score || item.ht_score || "").trim());
  if (hasFullTime && (!requiresHalfTimeScore(item) || hasHalfTime)) return false;
  const date = dateOf(item);
  const today = istanbulDate(now);
  if (!date || date > today) return false;
  if (date < today) return true;
  const kickoff = timeMinutes(item.start_time || item.time);
  return kickoff !== null && istanbulMinutes(now) >= kickoff + FINISHED_AFTER_MINUTES;
}

function datesToCheck(memory, previousStatus, now = new Date()) {
  const dates = [...new Set((memory.predictions || []).filter((item) => eligiblePrediction(item, now)).map(dateOf))];
  const checks = previousStatus?.date_checks || {};
  return dates
    .map((date) => {
      const check = checks[date] || {};
      const lastSuccess = Date.parse(check.last_success_at || "");
      const due = Number(check.error_count || 0) > 0
        || !Number.isFinite(lastSuccess)
        || now.getTime() - lastSuccess >= RECHECK_INTERVAL_MS;
      return {
        date,
        due,
        last_success_ms: Number.isFinite(lastSuccess) ? lastSuccess : 0,
        had_error: Number(check.error_count || 0) > 0,
      };
    })
    .filter((entry) => entry.due)
    .sort((left, right) => {
      if (left.had_error !== right.had_error) return left.had_error ? -1 : 1;
      if (left.last_success_ms !== right.last_success_ms) return left.last_success_ms - right.last_success_ms;
      return left.date.localeCompare(right.date);
    })
    .slice(0, MAX_DATES_PER_RUN)
    .map((entry) => entry.date);
}

function archiveIdentityKey(item) {
  const teams = teamsOf(item);
  return [dateOf(item), normalizeTeam(teams.home), normalizeTeam(teams.away)].join("|");
}

function buildArchiveIdentityIndex(rows) {
  const buckets = new Map();
  const byDate = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const key = archiveIdentityKey(row);
    const date = dateOf(row);
    const rowTeams = teamsOf(row);
    if (!date || !normalizeTeam(rowTeams.home) || !normalizeTeam(rowTeams.away)) continue;
    const eventId = String(row?.iddaa_event_id || "").trim();
    const bucket = buckets.get(key) || { rows: [], event_ids: new Set() };
    bucket.rows.push(row);
    if (/^\d{1,12}$/.test(eventId)) bucket.event_ids.add(eventId);
    buckets.set(key, bucket);
    if (/^\d{1,12}$/.test(eventId)) {
      const dated = byDate.get(date) || [];
      dated.push(row);
      byDate.set(date, dated);
    }
  }

  const exact = new Map();
  for (const [key, bucket] of buckets) {
    if (bucket.event_ids.size !== 1) continue;
    exact.set(key, {
      event_id: [...bucket.event_ids][0],
      row: bucket.rows.find((item) => String(item?.iddaa_event_id || "").trim()) || bucket.rows[0],
      match_mode: "exact",
      match_score: 1,
    });
  }
  return { exact, byDate };
}

function findArchiveIdentityForPrediction(prediction, index) {
  for (const date of resultDatesForMatch(prediction)) {
    const exact = index.exact.get([date, normalizeTeam(teamsOf(prediction).home), normalizeTeam(teamsOf(prediction).away)].join("|"));
    if (exact) return exact;
  }

  const candidates = resultDatesForMatch(prediction)
    .flatMap((date) => index.byDate.get(date) || [])
    .map((row) => ({
      row,
      event_id: String(row?.iddaa_event_id || "").trim(),
      quality: pairSimilarity(prediction, row),
    }))
    .filter((entry) => /^\d{1,12}$/.test(entry.event_id)
      && entry.quality.home >= 0.78
      && entry.quality.away >= 0.78
      && entry.quality.score >= 0.88)
    .sort((a, b) => b.quality.score - a.quality.score);

  if (!candidates.length) return null;
  const top = candidates[0];
  const competing = candidates.filter((entry, index) => index > 0
    && entry.event_id !== top.event_id
    && top.quality.score - entry.quality.score < 0.04);
  if (competing.length) return null;

  return {
    event_id: top.event_id,
    row: top.row,
    match_mode: "strict_fuzzy",
    match_score: Number(top.quality.score.toFixed(3)),
  };
}

function buildIddaaBackfillTargets(memory, archiveRows, previousStatus = {}, now = new Date(), limit = IDDAA_RESULT_DETAIL_LIMIT) {
  if (limit <= 0) return [];
  const today = istanbulDate(now);
  const index = buildArchiveIdentityIndex(archiveRows);
  const checks = previousStatus?.iddaa_detail_checks || {};
  const targets = [];
  const seenIds = new Set();

  const candidates = (memory?.predictions || [])
    .filter((item) => item?.status === "pending"
      && !String(item?.result_score || "").trim()
      && dateOf(item)
      && dateOf(item) < today)
    .sort((a, b) => dateOf(b).localeCompare(dateOf(a))
      || String(b?.start_time || b?.time || "").localeCompare(String(a?.start_time || a?.time || "")));

  for (const prediction of candidates) {
    const identity = findArchiveIdentityForPrediction(prediction, index);
    if (!identity || seenIds.has(identity.event_id)) continue;
    const lastAttempt = Date.parse(checks[identity.event_id]?.last_attempt_at || "");
    if (Number.isFinite(lastAttempt) && now.getTime() - lastAttempt < IDDAA_RESULT_RECHECK_MS) continue;
    seenIds.add(identity.event_id);
    targets.push({
      event_id: identity.event_id,
      prediction,
      archive_row: identity.row,
      identity_match_mode: identity.match_mode,
      identity_match_score: identity.match_score,
    });
    if (targets.length >= limit) break;
  }
  return targets;
}

function iddaaDetailResult(detailMatch, target) {
  if (!detailMatch || !target?.prediction || !target?.event_id) return null;
  if (String(detailMatch?.iddaa_event_id || detailMatch?.id || "").trim() !== String(target.event_id)) return null;
  const score = scoreText(detailMatch?.homeScore, detailMatch?.awayScore)
    || String(detailMatch?.score || "").trim();
  if (!score) return null;

  const prediction = target.prediction;
  if (!resultDatesForMatch(prediction).includes(dateOf(detailMatch))) return null;
  const similarity = pairSimilarity(prediction, detailMatch);
  if (similarity.home < 0.78 || similarity.away < 0.78 || similarity.score < 0.88) return null;

  const parsed = String(score).match(/(\d+)\D+(\d+)/);
  if (!parsed) return null;
  return {
    date: dateOf(detailMatch),
    home: teamsOf(detailMatch).home,
    away: teamsOf(detailMatch).away,
    homeScore: Number(parsed[1]),
    awayScore: Number(parsed[2]),
    score: `${Number(parsed[1])}-${Number(parsed[2])}`,
    half_time_score: "",
    status: "finished",
    source: "iddaa.com resmi etkinlik detayı",
    source_match_id: String(target.event_id),
  };
}

async function mapLimit(items, limit, worker) {
  if (!items.length) return [];
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        results[index] = { ok: false, error: String(error?.message || error) };
      }
    }
  });
  await Promise.all(runners);
  return results;
}

async function fetchIddaaBackfillResults(memory, archiveRows, previousStatus = {}, now = new Date(), options = {}) {
  const fetchDetail = options.fetchDetail || fetchIddaaEventDetail;
  const limit = options.limit ?? IDDAA_RESULT_DETAIL_LIMIT;
  const concurrency = options.concurrency ?? IDDAA_RESULT_DETAIL_CONCURRENCY;
  const targets = buildIddaaBackfillTargets(memory, archiveRows, previousStatus, now, limit);
  const checks = { ...(previousStatus?.iddaa_detail_checks || {}) };
  const results = [];
  const errors = [];
  const nowIso = now.toISOString();

  const fetched = await mapLimit(targets, concurrency, async (target) => {
    const payload = await fetchDetail(target.event_id, { timeoutMs: 7000 });
    const result = iddaaDetailResult(payload?.match || null, target);
    return { ok: true, target, result };
  });

  let scoreFound = 0;
  let rejected = 0;
  for (let index = 0; index < fetched.length; index += 1) {
    const item = fetched[index];
    const target = targets[index];
    if (!target) continue;
    if (!item?.ok) {
      checks[target.event_id] = {
        last_attempt_at: nowIso,
        last_success_at: checks[target.event_id]?.last_success_at || null,
        score_found: false,
        error: String(item?.error || "unknown").slice(0, 180),
      };
      errors.push(`${target.event_id}: ${String(item?.error || "unknown")}`);
      continue;
    }

    if (item.result) {
      results.push(item.result);
      scoreFound += 1;
      checks[target.event_id] = {
        last_attempt_at: nowIso,
        last_success_at: nowIso,
        score_found: true,
        error: null,
      };
    } else {
      rejected += 1;
      checks[target.event_id] = {
        last_attempt_at: nowIso,
        last_success_at: checks[target.event_id]?.last_success_at || null,
        score_found: false,
        error: null,
      };
    }
  }

  return {
    results,
    checks,
    requested: targets.length,
    score_found: scoreFound,
    rejected,
    errors,
  };
}

function needsNextDayLookup(memory, date, now = new Date()) {
  return (memory?.predictions || []).some((item) => {
    if (!eligiblePrediction(item, now) || dateOf(item) !== date) return false;
    const kickoff = timeMinutes(item?.start_time || item?.time);
    return kickoff !== null && kickoff < 7 * 60;
  });
}

function applyResults(rows, results, nowIso = new Date().toISOString()) {
  let updated = 0;
  let alreadyScored = 0;
  let unmatched = 0;
  const matches = (Array.isArray(rows) ? rows : []).map((row) => {
    const existingScore = scoreText(row.homeScore ?? row.home_score, row.awayScore ?? row.away_score) || String(row.score || row.result_score || "").trim();
    const existingHalfTime = String(row.half_time_score || row.halftime_score || row.ht_score || "").trim();
    if (existingScore && existingHalfTime) {
      alreadyScored += 1;
      return row;
    }

    const match = findResultForMatch(row, results);
    if (!match) {
      if (existingScore) alreadyScored += 1;
      if (results.some((result) => dateOf(result) === dateOf(row))) unmatched += 1;
      return row;
    }

    const nextScore = existingScore || match.result.score;
    const nextHalfTime = existingHalfTime || String(match.result.half_time_score || "").trim();
    if (existingScore && !nextHalfTime) {
      alreadyScored += 1;
      return row;
    }

    updated += 1;
    return {
      ...row,
      status: "finished",
      liveStatus: "finished",
      minute: 90,
      homeScore: Number.isFinite(Number(row.homeScore ?? row.home_score))
        ? Number(row.homeScore ?? row.home_score)
        : match.result.homeScore,
      awayScore: Number.isFinite(Number(row.awayScore ?? row.away_score))
        ? Number(row.awayScore ?? row.away_score)
        : match.result.awayScore,
      score: nextScore,
      result_score: nextScore,
      half_time_score: nextHalfTime,
      inferred_finished: false,
      score_source: match.result.source,
      score_source_match_id: match.result.source_match_id,
      score_updated_at: nowIso,
      updated_at: nowIso,
    };
  });
  return { matches, updated, alreadyScored, unmatched };
}

function applyPredictionResults(rows, results, nowIso = new Date().toISOString()) {
  let checked = 0;
  let linked = 0;
  let halfTimeLinked = 0;
  let unmatched = 0;

  const predictions = (Array.isArray(rows) ? rows : []).map((row) => {
    if (row?.status !== "pending") return row;

    const wantsHalfTime = requiresHalfTimeScore(row);
    const existingScore = String(row.result_score || "").trim();
    const existingHalfTime = String(row.half_time_score || row.halftime_score || row.ht_score || "").trim();
    if (existingScore && (!wantsHalfTime || existingHalfTime)) return row;

    checked += 1;
    const match = findResultForMatch(row, results);
    if (!match) {
      if (results.some((result) => dateOf(result) === dateOf(row))) unmatched += 1;
      return row;
    }

    const nextScore = existingScore || String(match.result.score || "").trim();
    const nextHalfTime = existingHalfTime || String(match.result.half_time_score || "").trim();
    if (!nextScore && !nextHalfTime) return row;

    const changedScore = !existingScore && Boolean(nextScore);
    const changedHalfTime = !existingHalfTime && Boolean(nextHalfTime);
    if (!changedScore && !changedHalfTime) return row;

    linked += 1;
    if (changedHalfTime) halfTimeLinked += 1;
    return {
      ...row,
      ...(nextScore ? { result_score: nextScore } : {}),
      ...(nextHalfTime ? { half_time_score: nextHalfTime } : {}),
      result_source: match.result.source,
      result_source_match_id: match.result.source_match_id,
      result_linked_at: nowIso,
      updated_at: nowIso,
    };
  });

  return { predictions, checked, linked, halfTimeLinked, unmatched };
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
  const archive = require("./archive-storage").readArchive(archiveFile, { matches: [] });
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
  const warnings = [];
  const fetchCache = new Map();

  async function fetchSourceDate(sourceDate) {
    if (!fetchCache.has(sourceDate)) fetchCache.set(sourceDate, await fetchDateResults(sourceDate));
    return fetchCache.get(sourceDate);
  }

  for (const date of dates) {
    const lookupDates = [date];
    if (needsNextDayLookup(memory, date, now)) lookupDates.push(addDays(date, 1));
    const responses = [];
    for (const sourceDate of lookupDates.filter(Boolean)) {
      const response = await fetchSourceDate(sourceDate);
      responses.push({ sourceDate, response });
      fetchedResults.push(...response.results);
      sources.add(response.source);
      errors.push(...response.errors.map((message) => `${sourceDate}: ${message}`));
      warnings.push(...(response.warnings || []).map((message) => `${sourceDate}: ${message}`));
    }
    const combinedResults = responses.reduce((sum, entry) => sum + entry.response.results.length, 0);
    const combinedErrors = responses.reduce((sum, entry) => sum + entry.response.errors.length, 0);
    const anyAvailable = responses.some((entry) => entry.response.source !== "unavailable");
    dateChecks[date] = {
      last_attempt_at: nowIso,
      last_success_at: anyAvailable ? nowIso : (dateChecks[date]?.last_success_at || null),
      source: [...new Set(responses.map((entry) => entry.response.source).filter((value) => value !== "unavailable"))].join(" + ") || "unavailable",
      lookup_dates: lookupDates.filter(Boolean),
      finished_result_count: combinedResults,
      error_count: combinedErrors,
      warning_count: responses.reduce((sum, entry) => sum + (entry.response.warnings || []).length, 0),
    };
  }

  const iddaaBackfill = await fetchIddaaBackfillResults(memory, archive.matches || [], previousStatus, now);
  fetchedResults.push(...iddaaBackfill.results);
  if (iddaaBackfill.results.length) sources.add("iddaa.com resmi etkinlik detayı");
  warnings.push(...iddaaBackfill.errors.map((message) => `Iddaa detail: ${message}`));

  const results = dedupeResults(fetchedResults);
  const predictionUpdate = applyPredictionResults(memory.predictions || [], results, nowIso);
  const archiveUpdate = applyResults(archive.matches || [], results, nowIso);
  const fixtureUpdate = applyResults(Array.isArray(fixtures) ? fixtures : [], results, nowIso);
  const liveUpdate = applyResults(Array.isArray(live.matches) ? live.matches : [], results, nowIso);

  memory.predictions = predictionUpdate.predictions;
  memory.updated_at = nowIso;
  memory.summary = {
    ...(memory.summary || {}),
    last_direct_result_checked: predictionUpdate.checked,
    last_direct_result_linked: predictionUpdate.linked,
    last_direct_half_time_linked: predictionUpdate.halfTimeLinked,
  };
  archive.matches = archiveUpdate.matches;
  archive.generated_at = nowIso;
  live.matches = liveUpdate.matches;
  if (predictionUpdate.linked) writeJson(memoryFile, memory);
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
    direct_learning_score_checked_count: predictionUpdate.checked,
    direct_learning_score_update_count: predictionUpdate.linked,
    direct_learning_half_time_update_count: predictionUpdate.halfTimeLinked,
    direct_learning_unmatched_count: predictionUpdate.unmatched,
    iddaa_detail_requested_count: iddaaBackfill.requested,
    iddaa_detail_score_found_count: iddaaBackfill.score_found,
    iddaa_detail_rejected_count: iddaaBackfill.rejected,
    iddaa_detail_checks: iddaaBackfill.checks,
    provider_configuration: {
      api_football_configured: uniqueKeys([process.env.API_FOOTBALL_KEY, process.env.API_FOOTBALL_KEY2]).length > 0,
      football_data_configured: Boolean(String(process.env.FOOTBALL_DATA_API_KEY || "").trim()),
      sofascore_enabled: ENABLE_SOFASCORE,
      iddaa_detail_enabled: IDDAA_RESULT_DETAIL_LIMIT > 0,
    },
    pending_prediction_count: (memory.predictions || []).filter((item) => item.status === "pending").length,
    errors: errors.slice(0, 20),
    warnings: warnings.slice(0, 20),
    date_checks: dateChecks,
  };
  writeJson(statusFile, status);
  console.log(`Final score sync: ${status.status}. Dates: ${dates.length}, Results: ${results.length}, Learning links: ${predictionUpdate.linked}, Archive updates: ${archiveUpdate.updated}`);
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
  applyPredictionResults,
  archiveIdentityKey,
  buildArchiveIdentityIndex,
  findArchiveIdentityForPrediction,
  buildIddaaBackfillTargets,
  applyResults,
  datesToCheck,
  eligiblePrediction,
  espnResults,
  fetchDateResults,
  fetchIddaaBackfillResults,
  firstPeriodScore,
  findResultForMatch,
  footballDataResults,
  normalizeTeam,
  pairSimilarity,
  iddaaDetailResult,
  runFinalScoreSync,
  resultDatesForMatch,
  sofascoreResults,
  sportsDbResults,
  teamSimilarity,
  requiresHalfTimeScore,
  scoreText,
};



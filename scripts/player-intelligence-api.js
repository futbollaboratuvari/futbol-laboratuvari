const fs = require("fs");
const https = require("https");
const path = require("path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const outputPath = path.join(dataDir, "player-intelligence.json");
const cachePath = path.join(dataDir, "player-intelligence-cache.json");
const API_HOST = "v3.football.api-sports.io";
const TIMEZONE = "Europe/Istanbul";
const FIXTURE_TTL_MS = 6 * 60 * 60 * 1000;
const INJURY_TTL_MS = 3 * 60 * 60 * 1000;
const RETRY_TTL_MS = 30 * 60 * 1000;
const LINEUP_RETRY_MS = 20 * 60 * 1000;
const LINEUP_FINAL_TTL_MS = 12 * 60 * 60 * 1000;
const SQUAD_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TRANSFER_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_LINEUP_REQUESTS_PER_DAY = 32;
const MAX_SQUAD_REQUESTS_PER_DAY = 8;
const MAX_TRANSFER_REQUESTS_PER_DAY = 16;

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

function todayTR(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(a s|as|fk|fc|sk|spor kulubu|sporting club|club|cf|sc|u21|u23)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function alias(value) {
  return clean(value)
    .replace(/paris saint germain|paris st germain|psg/g, "paris sg")
    .replace(/istanbul basaksehir/g, "basaksehir")
    .replace(/hamburger sv/g, "hamburg")
    .replace(/newcastle utd/g, "newcastle united")
    .replace(/atletico madrid/g, "a madrid")
    .replace(/caykur rizespor/g, "rize")
    .replace(/konyaspor/g, "konya")
    .replace(/alanyaspor/g, "alanya");
}

function tokens(value) {
  return new Set(alias(value).split(" ").filter((item) => item.length > 1));
}

function similarity(a, b) {
  const aa = alias(a);
  const bb = alias(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 1;
  if (aa.includes(bb) || bb.includes(aa)) return 0.9;
  const left = tokens(aa);
  const right = tokens(bb);
  const common = [...left].filter((item) => right.has(item)).length;
  return common / (new Set([...left, ...right]).size || 1);
}

function teamsOf(row) {
  const name = String(row?.match_name || row?.match || "");
  const parts = name.split(/\s+(?:VS|vs\.?|v|-)\s+/i);
  return {
    home: String(row?.home || row?.home_team_name || row?.ev_sahibi || parts[0] || "").trim(),
    away: String(row?.away || row?.away_team_name || row?.deplasman || parts[1] || "").trim(),
  };
}

function localMatch(row) {
  const teams = teamsOf(row);
  return {
    date: String(row?.date || row?.tarih || row?.utc_date || "").slice(0, 10),
    time: String(row?.time || row?.saat || row?.start_time || "").slice(0, 5),
    league: String(row?.league || row?.competition_name || row?.lig || "Lig"),
    home: teams.home,
    away: teams.away,
    status: String(row?.status || row?.liveStatus || "scheduled"),
    match_code: String(row?.matchCode || row?.match_code || ""),
  };
}

function matchKey(row) {
  const match = localMatch(row);
  return `${match.date}|${alias(match.home)}|${alias(match.away)}`;
}

function uniqueMatches(rows) {
  const map = new Map();
  for (const source of rows) {
    for (const row of Array.isArray(source) ? source : []) {
      const match = localMatch(row);
      if (!match.date || !match.home || !match.away) continue;
      const key = matchKey(match);
      const old = map.get(key);
      map.set(key, old ? { ...old, ...match } : match);
    }
  }
  return [...map.values()].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

function normalizeFixture(item) {
  const iso = String(item?.fixture?.date || "");
  return {
    fixture_id: Number(item?.fixture?.id) || null,
    date: iso.slice(0, 10),
    time: iso.slice(11, 16),
    status: String(item?.fixture?.status?.short || item?.fixture?.status?.long || ""),
    league: String(item?.league?.name || ""),
    home: { id: Number(item?.teams?.home?.id) || null, name: String(item?.teams?.home?.name || "") },
    away: { id: Number(item?.teams?.away?.id) || null, name: String(item?.teams?.away?.name || "") },
  };
}

function findApiFixture(match, fixtures) {
  let best = null;
  for (const fixture of fixtures || []) {
    const homeScore = similarity(match.home, fixture?.home?.name);
    const awayScore = similarity(match.away, fixture?.away?.name);
    if (homeScore < 0.45 || awayScore < 0.45) continue;
    const timeBonus = match.time && fixture.time && Math.abs(Number(match.time.replace(":", "")) - Number(fixture.time.replace(":", ""))) <= 200 ? 0.1 : 0;
    const score = homeScore + awayScore + (fixture.date === match.date ? 0.45 : 0) + timeBonus;
    if (!best || score > best.score) best = { fixture, score };
  }
  return best && best.score >= 1.45 ? best.fixture : null;
}

function injuryCategory(type, reason) {
  const value = clean(`${type || ""} ${reason || ""}`);
  if (/suspend|ban|red card|yellow card|cards|disciplin|ceza|kart/.test(value)) return "suspension";
  if (/doubt|question|uncertain|day to day|test|supheli|belirsiz/.test(value)) return "doubtful";
  return "injury";
}

function normalizeInjury(item) {
  const category = injuryCategory(item?.player?.type, item?.player?.reason);
  return {
    fixture_id: Number(item?.fixture?.id) || null,
    date: String(item?.fixture?.date || "").slice(0, 10),
    team_id: Number(item?.team?.id) || null,
    team_name: String(item?.team?.name || ""),
    player_id: Number(item?.player?.id) || null,
    name: String(item?.player?.name || "Bilinmeyen oyuncu"),
    type: String(item?.player?.type || ""),
    reason: String(item?.player?.reason || ""),
    category,
  };
}

function normalizeLineupPlayer(entry, role) {
  const player = entry?.player || entry || {};
  return {
    id: Number(player.id) || null,
    name: String(player.name || player.player || "Bilinmeyen oyuncu"),
    number: Number(player.number) || null,
    position: String(player.pos || player.position || "-"),
    grid: String(player.grid || ""),
    role,
    role_score: role === "starter" ? 1 : 0,
  };
}

function normalizeLineupTeam(item) {
  const starters = (Array.isArray(item?.startXI) ? item.startXI : []).map((row) => normalizeLineupPlayer(row, "starter"));
  const substitutes = (Array.isArray(item?.substitutes) ? item.substitutes : []).map((row) => normalizeLineupPlayer(row, "substitute"));
  return {
    team_id: Number(item?.team?.id) || null,
    team_name: String(item?.team?.name || ""),
    formation: String(item?.formation || ""),
    coach: String(item?.coach?.name || ""),
    starting_11: starters,
    substitutes,
    confirmed: starters.length >= 11,
  };
}

function normalizeSquad(payload, teamId) {
  const blocks = Array.isArray(payload?.response) ? payload.response : [];
  const block = blocks.find((row) => Number(row?.team?.id) === Number(teamId)) || blocks[0] || {};
  return (Array.isArray(block.players) ? block.players : []).map((player) => ({
    id: Number(player?.id) || null,
    name: String(player?.name || ""),
    age: Number(player?.age) || null,
    number: Number(player?.number) || null,
    position: String(player?.position || "-"),
  })).filter((player) => player.id || player.name);
}

function normalizeTransfers(payload, teamId) {
  const cutoff = Date.now() - (120 * 24 * 60 * 60 * 1000);
  const rows = [];
  for (const block of Array.isArray(payload?.response) ? payload.response : []) {
    for (const transfer of Array.isArray(block?.transfers) ? block.transfers : []) {
      const date = String(transfer?.date || "").slice(0, 10);
      const timestamp = Date.parse(`${date}T00:00:00Z`);
      if (Number.isFinite(timestamp) && timestamp < cutoff) continue;
      const inId = Number(transfer?.teams?.in?.id) || null;
      const outId = Number(transfer?.teams?.out?.id) || null;
      if (inId !== Number(teamId) && outId !== Number(teamId)) continue;
      rows.push({
        player_id: Number(block?.player?.id) || null,
        name: String(block?.player?.name || "Bilinmeyen oyuncu"),
        date,
        type: String(transfer?.type || ""),
        direction: inId === Number(teamId) ? "in" : "out",
        from: String(transfer?.teams?.out?.name || ""),
        to: String(transfer?.teams?.in?.name || ""),
      });
    }
  }
  return [...new Map(rows.map((row) => [`${row.player_id || clean(row.name)}|${row.date}|${row.direction}`, row])).values()];
}

function apiRequest(endpoint, params, key) {
  const query = new URLSearchParams(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null && value !== "")).toString();
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: API_HOST,
      path: `${endpoint}${query ? `?${query}` : ""}`,
      method: "GET",
      headers: { "x-apisports-key": key, Accept: "application/json", "User-Agent": "FutbolLaboratuvari-PlayerIntel/1.0" },
      timeout: 30000,
    }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`API-Football HTTP ${res.statusCode}`));
        try {
          const parsed = JSON.parse(body);
          const errors = parsed?.errors;
          const hasErrors = Array.isArray(errors) ? errors.length : errors && typeof errors === "object" ? Object.keys(errors).length : 0;
          if (hasErrors) return reject(new Error(`API-Football error: ${JSON.stringify(errors)}`));
          resolve(parsed);
        } catch (error) {
          reject(new Error(`API-Football JSON error: ${error.message}`));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("API-Football timeout")));
    req.end();
  });
}

function apiKeys() {
  return [...new Set([process.env.API_FOOTBALL_KEY, process.env.API_FOOTBALL_KEY2]
    .map((value) => String(value || "").trim()).filter(Boolean))];
}

async function request(endpoint, params) {
  let lastError = null;
  for (const key of apiKeys()) {
    try { return await apiRequest(endpoint, params, key); } catch (error) { lastError = error; }
  }
  throw lastError || new Error("API_FOOTBALL_KEY/API_FOOTBALL_KEY2 yok");
}

function ageMs(value, now = Date.now()) {
  const parsed = Date.parse(String(value || ""));
  return Number.isFinite(parsed) ? now - parsed : Infinity;
}

function shouldRefresh(record, ttl, now = Date.now()) {
  if (ageMs(record?.fetched_at, now) < ttl) return false;
  return ageMs(record?.attempted_at, now) >= RETRY_TTL_MS;
}

function emptyCache() {
  return {
    schema_version: 1,
    updated_at: null,
    fixtures_by_date: {},
    injuries_by_date: {},
    lineups_by_fixture: {},
    squads_by_team: {},
    transfers_by_team: {},
    request_log: [],
  };
}

function logRequest(cache, kind) {
  cache.request_log = [...(cache.request_log || []), { at: new Date().toISOString(), kind }]
    .filter((row) => ageMs(row.at) <= 2 * 24 * 60 * 60 * 1000);
}

function pruneCache(cache, now = Date.now()) {
  const dateCutoff = new Date(now - (7 * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10);
  for (const group of [cache.fixtures_by_date || {}, cache.injuries_by_date || {}]) {
    for (const date of Object.keys(group)) if (date < dateCutoff) delete group[date];
  }
  for (const [fixtureId, row] of Object.entries(cache.lineups_by_fixture || {})) {
    if (ageMs(row.fetched_at || row.attempted_at, now) > 14 * 24 * 60 * 60 * 1000) delete cache.lineups_by_fixture[fixtureId];
  }
  for (const group of [cache.squads_by_team || {}, cache.transfers_by_team || {}]) {
    for (const [teamId, row] of Object.entries(group)) {
      if (ageMs(row.fetched_at || row.attempted_at, now) > 180 * 24 * 60 * 60 * 1000) delete group[teamId];
    }
  }
  cache.request_log = (cache.request_log || []).filter((row) => ageMs(row.at, now) <= 2 * 24 * 60 * 60 * 1000);
  return cache;
}

function remainingDaily(cache, kind, limit) {
  const today = todayTR();
  const used = (cache.request_log || []).filter((row) => row.kind === kind && todayTR(new Date(row.at)) === today).length;
  return Math.max(0, limit - used);
}

function minutesUntil(match, now = Date.now()) {
  const timestamp = Date.parse(`${match.date}T${match.time || "23:59"}:00+03:00`);
  return Number.isFinite(timestamp) ? Math.round((timestamp - now) / 60000) : Infinity;
}

function lineupDue(match, cached, now = Date.now()) {
  const until = minutesUntil(match, now);
  const inWindow = /^(live|1h|2h|ht|et|p)$/i.test(match.status) || (until <= 150 && until >= -180);
  if (!inWindow) return false;
  const ttl = cached?.confirmed ? LINEUP_FINAL_TTL_MS : LINEUP_RETRY_MS;
  return ageMs(cached?.fetched_at || cached?.attempted_at, now) >= ttl;
}

function positionImpact(position) {
  const value = clean(position);
  if (/goalkeeper|kaleci|^gk$/.test(value)) return 2;
  if (/attacker|forward|striker|forvet|^f$/.test(value)) return 1.5;
  if (/midfield|orta saha|^m$/.test(value)) return 1;
  return 0.5;
}

function playerImpact(event, squad, lineup) {
  const squadPlayer = (squad || []).find((row) => (event.player_id && Number(row.id) === Number(event.player_id)) || clean(row.name) === clean(event.name));
  const priorStarter = (lineup?.starting_11 || []).some((row) => (event.player_id && Number(row.id) === Number(event.player_id)) || clean(row.name) === clean(event.name));
  const position = squadPlayer?.position || "-";
  const base = event.category === "suspension" ? 5 : event.category === "doubtful" ? 2 : 4;
  const score = Math.min(10, base + positionImpact(position) + (priorStarter ? 2 : 0));
  return {
    id: event.player_id,
    name: event.name,
    position,
    type: event.type,
    reason: event.reason,
    status: event.category,
    likely_starter: priorStarter,
    impact_score: Number(score.toFixed(1)),
    impact_level: score >= 7 ? "Yüksek" : score >= 4.5 ? "Orta" : "Düşük",
    source: "API-Football injuries",
  };
}

function playerTransferredOut(event, transfers, fixtureDate) {
  const referenceDate = String(fixtureDate || "").slice(0, 10);
  if (!referenceDate) return false;
  const matching = (Array.isArray(transfers) ? transfers : [])
    .filter((row) => {
      const sameId = event?.player_id && row?.player_id && Number(event.player_id) === Number(row.player_id);
      const sameName = clean(event?.name) && clean(event?.name) === clean(row?.name);
      const transferDate = String(row?.date || "").slice(0, 10);
      return (sameId || sameName) && transferDate && transferDate <= referenceDate;
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return matching[0]?.direction === "out";
}

function teamIntelligence(localName, side, fixture, injuriesEntry, cache) {
  const providerTeam = fixture?.[side] || {};
  const teamId = providerTeam.id || null;
  const lineupEntry = fixture?.fixture_id ? cache.lineups_by_fixture?.[fixture.fixture_id] : null;
  const lineup = (lineupEntry?.teams || []).find((row) => Number(row.team_id) === Number(teamId)) || null;
  const squad = cache.squads_by_team?.[teamId]?.players || [];
  const transfers = cache.transfers_by_team?.[teamId]?.items || [];
  const events = (injuriesEntry?.items || []).filter((row) => Number(row.team_id) === Number(teamId)
    && (!row.fixture_id || Number(row.fixture_id) === Number(fixture?.fixture_id))
    && !playerTransferredOut(row, transfers, fixture?.date));
  const playerRows = events.map((event) => playerImpact(event, squad, lineup));
  const availabilityChecked = Boolean(fixture && injuriesEntry?.status === "ok");
  const lineupConfirmed = Boolean(lineup?.confirmed && lineupEntry?.status === "confirmed");
  const sources = [];
  if (availabilityChecked) sources.push("API-Football injuries");
  if (lineupConfirmed) sources.push("API-Football lineups");
  if (squad.length) sources.push("API-Football squads");
  if (transfers.length) sources.push("API-Football transfers");
  return {
    team_name: localName,
    provider_team_id: teamId,
    provider_team_name: providerTeam.name || "",
    data_status: lineupConfirmed ? "lineup_confirmed" : availabilityChecked ? "availability_checked" : fixture ? "fixture_matched" : "no_verified_data",
    availability_checked: availabilityChecked,
    lineup_confirmed: lineupConfirmed,
    injured_players: playerRows.filter((row) => row.status === "injury"),
    suspended_players: playerRows.filter((row) => row.status === "suspension"),
    doubtful_players: playerRows.filter((row) => row.status === "doubtful"),
    transfers_in: transfers.filter((row) => row.direction === "in"),
    transfers_out: transfers.filter((row) => row.direction === "out"),
    lineup: lineup ? {
      formation: lineup.formation,
      coach: lineup.coach,
      starting_11: lineup.starting_11,
      substitutes: lineup.substitutes,
      confirmed: lineupConfirmed,
      fetched_at: lineupEntry.fetched_at,
    } : null,
    sources,
  };
}

function buildOutput(matches, cache, errors = [], requestCount = 0) {
  const rows = [];
  const teams = {};
  for (const match of matches) {
    const fixtureEntry = cache.fixtures_by_date?.[match.date];
    const fixture = findApiFixture(match, fixtureEntry?.items || []);
    const injuriesEntry = cache.injuries_by_date?.[match.date] || null;
    const home = teamIntelligence(match.home, "home", fixture, injuriesEntry, cache);
    const away = teamIntelligence(match.away, "away", fixture, injuriesEntry, cache);
    teams[match.home] = home;
    teams[match.away] = away;
    rows.push({
      match_name: `${match.home} VS ${match.away}`,
      date: match.date,
      time: match.time,
      league: match.league,
      home: match.home,
      away: match.away,
      fixture_id: fixture?.fixture_id || null,
      fixture_status: fixture?.status || "",
      home_team: home,
      away_team: away,
    });
  }
  const output = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    timezone: TIMEZONE,
    source: "API-Football injuries, lineups, squads and transfers",
    status: errors.length ? (rows.some((row) => row.fixture_id) ? "partial" : "source_error") : "ok",
    policy: "Only named provider records are treated as structured player facts. Missing records are shown as unknown and are not proof of a healthy squad.",
    request_count: requestCount,
    match_count: rows.length,
    fixture_match_count: rows.filter((row) => row.fixture_id).length,
    availability_checked_match_count: rows.filter((row) => row.home_team.availability_checked && row.away_team.availability_checked).length,
    confirmed_lineup_match_count: rows.filter((row) => row.home_team.lineup_confirmed && row.away_team.lineup_confirmed).length,
    named_unavailable_player_count: rows.reduce((sum, row) => sum
      + row.home_team.injured_players.length + row.home_team.suspended_players.length + row.home_team.doubtful_players.length
      + row.away_team.injured_players.length + row.away_team.suspended_players.length + row.away_team.doubtful_players.length, 0),
    errors: errors.slice(0, 20),
    matches: rows,
    teams,
  };
  return output;
}

async function run() {
  const full = readJson(path.join(dataDir, "full-bulletin.json"), { matches: [], live_matches: [] });
  const fixtures = readJson(path.join(dataDir, "fixtures.json"), []);
  const robot = readJson(path.join(dataDir, "robot-analysis.json"), { matches: [] });
  const matches = uniqueMatches([
    full.matches || [],
    full.live_matches || [],
    Array.isArray(fixtures) ? fixtures : [],
    robot.matches || [],
  ]).filter((row) => row.date >= todayTR());
  const previous = readJson(outputPath, null);
  if (!apiKeys().length) {
    if (previous) {
      console.log("Player intelligence skipped: API key yok; son sağlam çıktı korunuyor.");
      return previous;
    }
    const empty = buildOutput(matches, emptyCache(), ["API anahtarı bu çalıştırma ortamında yok; yapılandırılmış oyuncu verisi bekleniyor."], 0);
    empty.status = "no_key";
    writeJson(outputPath, empty);
    if (!fs.existsSync(cachePath)) writeJson(cachePath, emptyCache());
    console.log("Player intelligence initialized without API data; verified data is not assumed.");
    return empty;
  }

  const cache = { ...emptyCache(), ...readJson(cachePath, {}) };
  cache.fixtures_by_date ||= {};
  cache.injuries_by_date ||= {};
  cache.lineups_by_fixture ||= {};
  cache.squads_by_team ||= {};
  cache.transfers_by_team ||= {};
  cache.request_log ||= [];
  const errors = [];
  let requestCount = 0;
  const call = async (kind, endpoint, params) => {
    requestCount += 1;
    logRequest(cache, kind);
    return request(endpoint, params);
  };

  const dates = [...new Set(matches.map((row) => row.date).filter(Boolean))];
  for (const date of dates) {
    const entry = cache.fixtures_by_date[date] || {};
    const unresolved = matches.filter((row) => row.date === date).some((row) => !findApiFixture(row, entry.items || []));
    if (shouldRefresh(entry, FIXTURE_TTL_MS) || (unresolved && ageMs(entry.attempted_at) >= RETRY_TTL_MS)) {
      entry.attempted_at = new Date().toISOString();
      try {
        const payload = await call("fixtures", "/fixtures", { date, timezone: TIMEZONE });
        entry.items = (Array.isArray(payload?.response) ? payload.response : []).map(normalizeFixture).filter((row) => row.fixture_id);
        entry.fetched_at = new Date().toISOString();
        entry.status = "ok";
      } catch (error) {
        entry.status = "source_error";
        entry.error = error.message;
        errors.push(`fixtures ${date}: ${error.message}`);
      }
      cache.fixtures_by_date[date] = entry;
    }

    const injuryEntry = cache.injuries_by_date[date] || {};
    if (shouldRefresh(injuryEntry, INJURY_TTL_MS)) {
      injuryEntry.attempted_at = new Date().toISOString();
      try {
        const payload = await call("injuries", "/injuries", { date, timezone: TIMEZONE });
        injuryEntry.items = (Array.isArray(payload?.response) ? payload.response : []).map(normalizeInjury);
        injuryEntry.fetched_at = new Date().toISOString();
        injuryEntry.status = "ok";
        delete injuryEntry.error;
      } catch (error) {
        injuryEntry.status = injuryEntry.fetched_at ? "stale" : "source_error";
        injuryEntry.error = error.message;
        errors.push(`injuries ${date}: ${error.message}`);
      }
      cache.injuries_by_date[date] = injuryEntry;
    }
  }

  const resolved = matches.map((match) => ({
    match,
    fixture: findApiFixture(match, cache.fixtures_by_date?.[match.date]?.items || []),
  })).filter((row) => row.fixture?.fixture_id);

  let lineupBudget = remainingDaily(cache, "lineups", MAX_LINEUP_REQUESTS_PER_DAY);
  for (const { match, fixture } of resolved) {
    if (lineupBudget <= 0) break;
    const entry = cache.lineups_by_fixture[fixture.fixture_id] || {};
    if (!lineupDue(match, entry)) continue;
    entry.attempted_at = new Date().toISOString();
    lineupBudget -= 1;
    try {
      const payload = await call("lineups", "/fixtures/lineups", { fixture: fixture.fixture_id });
      entry.teams = (Array.isArray(payload?.response) ? payload.response : []).map(normalizeLineupTeam);
      entry.confirmed = entry.teams.length >= 2 && entry.teams.every((team) => team.confirmed);
      entry.fetched_at = new Date().toISOString();
      entry.status = entry.confirmed ? "confirmed" : "waiting";
      delete entry.error;
    } catch (error) {
      entry.status = "source_error";
      entry.error = error.message;
      errors.push(`lineups ${fixture.fixture_id}: ${error.message}`);
    }
    cache.lineups_by_fixture[fixture.fixture_id] = entry;
  }

  const injuryTeamIds = [...new Set(dates.flatMap((date) => (cache.injuries_by_date?.[date]?.items || []).map((row) => row.team_id)).filter(Boolean))];
  let squadBudget = remainingDaily(cache, "squads", MAX_SQUAD_REQUESTS_PER_DAY);
  for (const teamId of injuryTeamIds) {
    if (squadBudget <= 0) break;
    const entry = cache.squads_by_team[teamId] || {};
    if (!shouldRefresh(entry, SQUAD_TTL_MS)) continue;
    entry.attempted_at = new Date().toISOString();
    squadBudget -= 1;
    try {
      const payload = await call("squads", "/players/squads", { team: teamId });
      entry.players = normalizeSquad(payload, teamId);
      entry.fetched_at = new Date().toISOString();
      entry.status = "ok";
      delete entry.error;
    } catch (error) {
      entry.status = "source_error";
      entry.error = error.message;
      errors.push(`squads ${teamId}: ${error.message}`);
    }
    cache.squads_by_team[teamId] = entry;
  }

  const allTeamIds = [...new Set(resolved.flatMap(({ fixture }) => [fixture.home.id, fixture.away.id]).filter(Boolean))]
    .sort((a, b) => ageMs(cache.transfers_by_team?.[b]?.fetched_at) - ageMs(cache.transfers_by_team?.[a]?.fetched_at));
  let transferBudget = remainingDaily(cache, "transfers", MAX_TRANSFER_REQUESTS_PER_DAY);
  for (const teamId of allTeamIds) {
    if (transferBudget <= 0) break;
    const entry = cache.transfers_by_team[teamId] || {};
    if (!shouldRefresh(entry, TRANSFER_TTL_MS)) continue;
    entry.attempted_at = new Date().toISOString();
    transferBudget -= 1;
    try {
      const payload = await call("transfers", "/transfers", { team: teamId });
      entry.items = normalizeTransfers(payload, teamId);
      entry.fetched_at = new Date().toISOString();
      entry.status = "ok";
      delete entry.error;
    } catch (error) {
      entry.status = "source_error";
      entry.error = error.message;
      errors.push(`transfers ${teamId}: ${error.message}`);
    }
    cache.transfers_by_team[teamId] = entry;
  }

  cache.updated_at = new Date().toISOString();
  pruneCache(cache);
  const output = buildOutput(matches, cache, errors, requestCount);
  writeJson(cachePath, cache);
  writeJson(outputPath, output);
  console.log(`Player intelligence updated: fixtures=${output.fixture_match_count}/${output.match_count}, availability=${output.availability_checked_match_count}, lineups=${output.confirmed_lineup_match_count}, named unavailable=${output.named_unavailable_player_count}, requests=${requestCount}.`);
  return output;
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });

module.exports = {
  buildOutput,
  clean,
  findApiFixture,
  injuryCategory,
  lineupDue,
  normalizeFixture,
  normalizeInjury,
  normalizeLineupTeam,
  normalizeSquad,
  normalizeTransfers,
  playerImpact,
  playerTransferredOut,
  pruneCache,
  run,
  similarity,
  uniqueMatches,
};


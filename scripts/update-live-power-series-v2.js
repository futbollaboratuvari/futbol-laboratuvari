const fs = require('fs');
const https = require('https');
const path = require('path');
const base = require('./update-live-power-series');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'live-power-series.json');
const FULL_BULLETIN_FILE = path.join(DATA_DIR, 'full-bulletin.json');
const LIVE_MATCHES_FILE = path.join(DATA_DIR, 'live-matches.json');
const THESPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/123';
const MAX_MATCHES = Math.max(1, Math.min(12, Number(process.env.LIVE_POWER_MAX_MATCHES || 8)));
const MAX_SNAPSHOTS = 40;
const KEEP_RECENT_HOURS = 8;
const SPORTSDB_EVENT_CACHE = new Map();
const SPORTSDB_SEARCH_CACHE = new Map();

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, 'utf8').trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeIfChanged(file, current, next) {
  if (JSON.stringify(current) === JSON.stringify(next)) return false;
  writeJson(file, next);
  return true;
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; FutbolLaboratuvari-LivePower/3.0)',
        Referer: 'https://www.espn.com/',
      },
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          const error = new Error(`HTTP ${response.statusCode}`);
          error.statusCode = response.statusCode;
          reject(error);
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('Kaynak geçerli JSON döndürmedi.'));
        }
      });
    });
    request.setTimeout(20000, () => request.destroy(new Error('Kaynak zaman aşımına uğradı.')));
    request.on('error', reject);
  });
}

function safeProviderError(stage, url, error) {
  const status = Number(error?.statusCode) || Number(String(error?.message || '').match(/HTTP\s+(\d{3})/i)?.[1]);
  const code = status
    ? `http_${status}`
    : /zaman aşımı|timeout/i.test(String(error?.message || '')) ? 'timeout'
      : /json/i.test(String(error?.message || '')) ? 'invalid_json' : 'unavailable';
  let host = 'provider';
  try { host = new URL(url).hostname; } catch { /* safe fallback */ }
  return `${stage}:${host}:${code}`.slice(0, 120);
}

function extractUidPart(value, key) {
  const match = String(value || '').match(new RegExp(`(?:^|~)${key}:([^~]+)`));
  return match ? match[1] : '';
}

function extractLeagueId(event) {
  return extractUidPart(event?.uid, 'l')
    || extractUidPart(event?.competitions?.[0]?.uid, 'l')
    || String(event?.league?.id || event?.competitions?.[0]?.league?.id || '');
}

function collectSiteCandidates() {
  const rows = [];
  const seen = new Set();
  const push = (item, priority = 0) => {
    const home = item?.home || item?.homeTeam || item?.home_team || item?.home_team_name || item?.teams?.home?.name;
    const away = item?.away || item?.awayTeam || item?.away_team || item?.away_team_name || item?.teams?.away?.name;
    if (!home || !away) return;
    const key = `${base.normalizeName(home)}|${base.normalizeName(away)}`;
    if (!key || seen.has(key)) return;
    seen.add(key);
    rows.push({
      home: String(home),
      away: String(away),
      league: item?.league || item?.league_name || item?.competition || item?.tournament || '',
      date: String(item?.date || item?.match_date || item?.utc_date || '').slice(0, 10),
      priority,
    });
  };

  const live = readJson(LIVE_MATCHES_FILE, []);
  (Array.isArray(live) ? live : live?.matches || []).forEach((row) => push(row, 300));
  const bulletin = readJson(FULL_BULLETIN_FILE, []);
  const bulletinRows = Array.isArray(bulletin) ? bulletin : bulletin?.matches || bulletin?.fixtures || [];
  bulletinRows.forEach((row) => push(row, 200));
  return rows;
}

function teamPairSimilarity(site, event) {
  const teams = base.espnEventTeams(event);
  const home = base.nameSimilarity(site.home, teams.home);
  const away = base.nameSimilarity(site.away, teams.away);
  return { home, away, total: (home + away) / 2 };
}

function bestSiteMatch(event, siteCandidates) {
  let best = null;
  for (const site of siteCandidates) {
    const sim = teamPairSimilarity(site, event);
    if (sim.home < 0.45 || sim.away < 0.45 || sim.total < 0.6) continue;
    const rank = sim.total + Math.min(0.2, site.priority / 5000);
    if (!best || rank > best.rank) best = { site, sim, rank };
  }
  return best;
}

async function fetchScoreboard() {
  const urls = [
    'https://site.web.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?limit=1000',
    'https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?limit=1000',
  ];
  const errors = [];
  for (const url of urls) {
    try {
      return { payload: await requestJson(url), url, errors };
    } catch (error) {
      errors.push(safeProviderError('scoreboard', url, error));
    }
  }
  throw new Error(errors.join(' | ') || 'ESPN scoreboard unavailable');
}

function statRowsFromTree(node, rows = [], seen = new Set()) {
  if (!node || typeof node !== 'object') return rows;
  if (seen.has(node)) return rows;
  seen.add(node);
  if (Array.isArray(node)) {
    node.forEach((value) => statRowsFromTree(value, rows, seen));
    return rows;
  }

  const value = node.displayValue ?? node.value;
  const name = node.name || node.displayName || node.shortDisplayName || node.label;
  if (name && value !== undefined && value !== null && typeof value !== 'object') {
    rows.push({
      name: String(name),
      label: String(node.displayName || node.shortDisplayName || node.label || name),
      displayValue: value,
      value,
    });
  }

  Object.entries(node).forEach(([key, child]) => {
    if (key === '$ref') return;
    statRowsFromTree(child, rows, seen);
  });
  return rows;
}

function parseCoreStats(payload) {
  return base.parseTeamStatsFromRows(statRowsFromTree(payload));
}

function hasUsefulStats(stats) {
  return base.statsCoverage(stats, stats).common_metric_count > 0;
}

function scoreboardTeamStats(event) {
  const competitors = Array.isArray(event?.competitions?.[0]?.competitors)
    ? event.competitions[0].competitors : [];
  const rowFor = (side, fallbackIndex) => competitors.find((row) => row?.homeAway === side) || competitors[fallbackIndex];
  const home = rowFor('home', 0);
  const away = rowFor('away', 1);
  return {
    home: home ? base.parseTeamStatsFromRows(home.statistics) : null,
    away: away ? base.parseTeamStatsFromRows(away.statistics) : null,
  };
}

function mergeStats(...rows) {
  const fields = [
    'shots_on_goal', 'total_shots', 'shots_inside_box', 'blocked_shots', 'corners',
    'possession', 'accurate_passes', 'total_passes', 'expected_goals', 'dangerous_attacks',
  ];
  return Object.fromEntries(fields.map((key) => {
    const found = rows.map((row) => base.finite(row?.[key])).find((value) => value !== null);
    return [key, found === undefined ? null : found];
  }));
}

function comparableStats(home, away) {
  return hasUsefulStats(home) && hasUsefulStats(away)
    && base.statsCoverage(home, away).common_metric_count > 0;
}

function competitionParts(event, side) {
  const competition = event?.competitions?.[0] || {};
  const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
  const competitor = competitors.find((row) => row.homeAway === side) || competitors[side === 'home' ? 0 : 1] || {};
  return {
    leagueId: extractLeagueId(event),
    eventId: String(event?.id || competition?.id || ''),
    competitionId: String(competition?.id || event?.id || ''),
    teamId: String(competitor?.id || competitor?.team?.id || ''),
    competitor,
  };
}

function normalizeRef(value) {
  const ref = String(value || '').replace(/^http:/, 'https:');
  return ref || '';
}

function findStatisticsRef(node, seen = new Set()) {
  if (!node || typeof node !== 'object' || seen.has(node)) return '';
  seen.add(node);
  if (!Array.isArray(node) && node.statistics?.$ref) return normalizeRef(node.statistics.$ref);
  const values = Array.isArray(node) ? node : Object.values(node);
  for (const value of values) {
    const ref = findStatisticsRef(value, seen);
    if (ref) return ref;
  }
  return '';
}

async function fetchCoreTeamStats(event, side) {
  const parts = competitionParts(event, side);
  const errors = [];
  if (!parts.leagueId || !parts.eventId || !parts.competitionId || !parts.teamId) {
    return { stats: null, verified: false, errors: ['core identifiers incomplete'], parts };
  }

  const baseUrl = `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${encodeURIComponent(parts.leagueId)}/events/${encodeURIComponent(parts.eventId)}/competitions/${encodeURIComponent(parts.competitionId)}/competitors/${encodeURIComponent(parts.teamId)}`;
  const directUrls = [
    `${baseUrl}/statistics?lang=en&region=us`,
    `${baseUrl}/statistics`,
  ];

  for (const url of directUrls) {
    try {
      const payload = await requestJson(url);
      const stats = parseCoreStats(payload);
      if (hasUsefulStats(stats)) return { stats, verified: true, source: 'espn_core_statistics', url, errors, parts };
      errors.push(safeProviderError(`core_${side}`, url, new Error('empty')));
    } catch (error) {
      errors.push(safeProviderError(`core_${side}`, url, error));
    }
  }

  try {
    const competitorPayload = await requestJson(`${baseUrl}?lang=en&region=us`);
    const directParsed = parseCoreStats(competitorPayload);
    if (hasUsefulStats(directParsed)) {
      return { stats: directParsed, verified: true, source: 'espn_core_competitor', url: baseUrl, errors, parts };
    }
    const ref = findStatisticsRef(competitorPayload);
    if (ref) {
      try {
        const refPayload = await requestJson(ref);
        const refStats = parseCoreStats(refPayload);
        if (hasUsefulStats(refStats)) return { stats: refStats, verified: true, source: 'espn_core_ref', url: ref, errors, parts };
        errors.push(safeProviderError(`core_ref_${side}`, ref, new Error('empty')));
      } catch (error) {
        errors.push(safeProviderError(`core_ref_${side}`, ref, error));
      }
    }
  } catch (error) {
    errors.push(safeProviderError(`core_competitor_${side}`, baseUrl, error));
  }

  return { stats: null, verified: false, errors, parts };
}

async function fetchSummaryStats(event) {
  const eventId = String(event?.id || event?.competitions?.[0]?.id || '');
  const leagueId = extractLeagueId(event);
  const leagueTokens = [...new Set([leagueId, 'all'].filter(Boolean))];
  const errors = [];
  for (const league of leagueTokens) {
    const urls = [
      `https://site.web.api.espn.com/apis/site/v2/sports/soccer/${encodeURIComponent(league)}/summary?event=${encodeURIComponent(eventId)}`,
      `https://site.web.api.espn.com/apis/site/v3/sports/soccer/${encodeURIComponent(league)}/summary?event=${encodeURIComponent(eventId)}`,
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${encodeURIComponent(league)}/summary?event=${encodeURIComponent(eventId)}`,
    ];
    for (const url of urls) {
      try {
        const payload = await requestJson(url);
        const stats = base.boxscoreTeams(payload);
        if (hasUsefulStats(stats.home) || hasUsefulStats(stats.away)) {
          return { stats, verified: true, source: 'espn_summary', url, errors, payload };
        }
        errors.push(safeProviderError('summary', url, new Error('empty')));
      } catch (error) {
        errors.push(safeProviderError('summary', url, error));
      }
    }
  }
  return { stats: { home: null, away: null }, verified: false, errors };
}

function sportsDbRows(payload) {
  if (Array.isArray(payload?.events)) return payload.events;
  if (Array.isArray(payload?.event)) return payload.event;
  return [];
}

async function sportsDbEventsForDate(date) {
  if (!date) return [];
  if (!SPORTSDB_EVENT_CACHE.has(date)) {
    const url = `${THESPORTSDB_BASE}/eventsday.php?d=${encodeURIComponent(date)}&s=Soccer`;
    SPORTSDB_EVENT_CACHE.set(date, requestJson(url).then(sportsDbRows));
  }
  return SPORTSDB_EVENT_CACHE.get(date);
}

async function searchSportsDbEvent(date, home, away) {
  const key = `${date}|${base.normalizeName(home)}|${base.normalizeName(away)}`;
  if (!SPORTSDB_SEARCH_CACHE.has(key)) {
    const eventName = `${home} vs ${away}`;
    const url = `${THESPORTSDB_BASE}/searchevents.php?e=${encodeURIComponent(eventName)}&d=${encodeURIComponent(date)}`;
    SPORTSDB_SEARCH_CACHE.set(key, requestJson(url).then(sportsDbRows));
  }
  return SPORTSDB_SEARCH_CACHE.get(key);
}

function bestSportsDbEvent(events, home, away) {
  let best = null;
  for (const event of events || []) {
    const homeSimilarity = base.nameSimilarity(home, event?.strHomeTeam);
    const awaySimilarity = base.nameSimilarity(away, event?.strAwayTeam);
    const similarity = (homeSimilarity + awaySimilarity) / 2;
    if (homeSimilarity < 0.5 || awaySimilarity < 0.5 || similarity < 0.65) continue;
    if (!best || similarity > best.similarity) best = { event, similarity };
  }
  return best;
}

async function findSportsDbEvent(dates, home, away) {
  const errors = [];
  for (const date of [...new Set((Array.isArray(dates) ? dates : [dates]).filter(Boolean))]) {
    const dayUrl = `${THESPORTSDB_BASE}/eventsday.php?d=${encodeURIComponent(date)}&s=Soccer`;
    try {
      const matched = bestSportsDbEvent(await sportsDbEventsForDate(date), home, away);
      if (matched) return { ...matched, date, errors };
    } catch (error) {
      errors.push(safeProviderError('sportsdb_day', dayUrl, error));
    }
    const searchUrl = `${THESPORTSDB_BASE}/searchevents.php?e=${encodeURIComponent(`${home} vs ${away}`)}&d=${encodeURIComponent(date)}`;
    try {
      const matched = bestSportsDbEvent(await searchSportsDbEvent(date, home, away), home, away);
      if (matched) return { ...matched, date, errors };
    } catch (error) {
      errors.push(safeProviderError('sportsdb_search', searchUrl, error));
    }
  }
  return { event: null, similarity: 0, errors };
}

function parseSportsDbStats(payload) {
  const rows = Array.isArray(payload?.eventstats) ? payload.eventstats : [];
  const homeRows = rows.map((row) => ({ name: row?.strStat, displayValue: row?.intHome }));
  const awayRows = rows.map((row) => ({ name: row?.strStat, displayValue: row?.intAway }));
  return {
    home: base.parseTeamStatsFromRows(homeRows),
    away: base.parseTeamStatsFromRows(awayRows),
  };
}

async function fetchSportsDbStats(dates, home, away) {
  const matched = await findSportsDbEvent(dates, home, away);
  if (!matched.event?.idEvent) return { home: null, away: null, verified: false, errors: matched.errors };
  const url = `${THESPORTSDB_BASE}/lookupeventstats.php?id=${encodeURIComponent(matched.event.idEvent)}`;
  try {
    const stats = parseSportsDbStats(await requestJson(url));
    return {
      ...stats,
      verified: comparableStats(stats.home, stats.away),
      event_id: String(matched.event.idEvent),
      similarity: Number(matched.similarity.toFixed(3)),
      errors: matched.errors,
    };
  } catch (error) {
    return { home: null, away: null, verified: false, errors: [...matched.errors, safeProviderError('sportsdb_stats', url, error)] };
  }
}

async function fetchObservedStats(event, site) {
  const errors = [];
  const providers = [];
  const embedded = scoreboardTeamStats(event);
  let home = embedded.home;
  let away = embedded.away;
  if (comparableStats(home, away)) {
    return {
      home, away, verified: true, method: 'espn_scoreboard', errors,
      metadata: { provider_chain: ['espn_scoreboard'], league_id: extractLeagueId(event) },
    };
  }

  const [homeCore, awayCore] = await Promise.all([
    fetchCoreTeamStats(event, 'home'),
    fetchCoreTeamStats(event, 'away'),
  ]);
  errors.push(...homeCore.errors, ...awayCore.errors);
  if (homeCore.verified || awayCore.verified) providers.push('espn_core');
  home = mergeStats(home, homeCore.stats);
  away = mergeStats(away, awayCore.stats);

  if (!comparableStats(home, away)) {
    const summary = await fetchSummaryStats(event);
    errors.push(...summary.errors);
    if (summary.verified) providers.push('espn_summary');
    home = mergeStats(home, summary.stats.home);
    away = mergeStats(away, summary.stats.away);
  }

  let sportsDb = null;
  if (!comparableStats(home, away)) {
    const teams = base.espnEventTeams(event);
    sportsDb = await fetchSportsDbStats(
      [site?.date, String(event?.date || '').slice(0, 10)],
      teams.home,
      teams.away,
    );
    errors.push(...sportsDb.errors);
    if (sportsDb.verified) providers.push('thesportsdb_event_stats');
    home = mergeStats(home, sportsDb.home);
    away = mergeStats(away, sportsDb.away);
  }

  const verified = comparableStats(home, away);
  const method = providers.includes('espn_summary') ? 'espn_summary'
    : providers.includes('espn_core') ? 'espn_core'
      : providers.includes('thesportsdb_event_stats') ? 'thesportsdb_event_stats' : 'none';
  return {
    home,
    away,
    verified,
    method,
    errors,
    metadata: {
      provider_chain: providers,
      league_id: extractLeagueId(event),
      sportsdb_event_id: sportsDb?.event_id || null,
      sportsdb_similarity: sportsDb?.similarity ?? null,
    },
  };
}

function recentEnough(iso, hours = KEEP_RECENT_HOURS) {
  const time = Date.parse(String(iso || ''));
  return Number.isFinite(time) && (Date.now() - time) <= hours * 3600 * 1000;
}

async function verifyWithSportsDb(dates, home, away) {
  const result = await findSportsDbEvent(dates, home, away);
  return {
    checked: result.errors.length === 0,
    matched: Boolean(result.event),
    event_id: result.event?.idEvent ? String(result.event.idEvent) : null,
    similarity: result.event ? Number(result.similarity.toFixed(3)) : 0,
    errors: result.errors,
  };
}

async function main() {
  const now = new Date().toISOString();
  const previous = readJson(OUTPUT_FILE, { schema_version: 1, matches: [], recent_matches: [] });
  let scoreboard;
  try {
    scoreboard = await fetchScoreboard();
  } catch (error) {
    const payload = {
      ...previous,
      schema_version: 1,
      timezone: 'Europe/Istanbul',
      status: 'provider_error',
      source: 'ESPN Scoreboard + ESPN Core/Summary + TheSportsDB event stats',
      source_verified: false,
      sampling: {
        ...(previous.sampling || {}),
        workflow_interval_minutes: 30,
        observed_points_only: true,
        interpolation_used: false,
        max_matches_per_run: MAX_MATCHES,
        paid_api_required: false,
      },
      message: 'Ücretsiz ESPN canlı veri kaynağına geçici olarak ulaşılamadı. Eski doğrulanmış veriler korunuyor.',
      provider_errors: [safeProviderError('scoreboard', 'https://site.web.api.espn.com/', error)],
    };
    writeIfChanged(OUTPUT_FILE, previous, payload);
    return;
  }

  const events = (Array.isArray(scoreboard.payload?.events) ? scoreboard.payload.events : []).filter(base.isLiveEspnEvent);
  const candidates = collectSiteCandidates();
  const previousMap = new Map((Array.isArray(previous.matches) ? previous.matches : []).map((row) => [String(row.fixture_id), row]));
  const matched = [];
  for (const event of events) {
    const best = bestSiteMatch(event, candidates);
    if (!best) continue;
    const eventId = String(event?.id || event?.competitions?.[0]?.id || '');
    if (!eventId) continue;
    matched.push({ event, eventId, site: best.site, similarity: best.sim.total });
  }
  matched.sort((a, b) => {
    const continuityA = previousMap.has(a.eventId) ? 100000 : 0;
    const continuityB = previousMap.has(b.eventId) ? 100000 : 0;
    return (continuityB - continuityA) || (b.site.priority - a.site.priority) || (b.similarity - a.similarity);
  });

  const active = [];
  const errors = [...(scoreboard.errors || [])];
  let statsSuccessCount = 0;
  let scoreboardStatsCount = 0;
  let coreStatsCount = 0;
  let summaryStatsCount = 0;
  let sportsDbStatsCount = 0;
  let sportsDbVerifiedCount = 0;

  for (const item of matched.slice(0, MAX_MATCHES)) {
    const observed = await fetchObservedStats(item.event, item.site);
    errors.push(...observed.errors.map((value) => `${item.eventId}:${value}`.slice(0, 140)));
    if (!observed.verified || (!hasUsefulStats(observed.home) && !hasUsefulStats(observed.away))) {
      const old = previousMap.get(item.eventId);
      if (old) active.push({ ...old, status: 'stats_temporarily_unavailable' });
      continue;
    }

    statsSuccessCount += 1;
    if (observed.method === 'espn_scoreboard') scoreboardStatsCount += 1;
    if (observed.method === 'espn_core') coreStatsCount += 1;
    if (observed.method === 'espn_summary') summaryStatsCount += 1;
    if (observed.method === 'thesportsdb_event_stats') sportsDbStatsCount += 1;

    const minute = base.extractMinute(item.event, null);
    if (minute === null) continue;
    const teams = base.espnEventTeams(item.event);
    const old = previousMap.get(item.eventId) || {};
    const oldSnapshots = Array.isArray(old.snapshots) ? old.snapshots : [];
    const previousSnapshot = oldSnapshots.length ? oldSnapshots[oldSnapshots.length - 1] : null;
    const power = base.computePower(observed.home, observed.away, minute, teams.homeScore, teams.awayScore, previousSnapshot);
    const snapshot = {
      minute,
      recorded_at: now,
      observed: true,
      interpolated: false,
      score: { home: teams.homeScore, away: teams.awayScore },
      ...power,
      stats: { home: observed.home, away: observed.away },
    };
    const snapshots = base.mergeSnapshot(oldSnapshots, snapshot).slice(-MAX_SNAPSHOTS);
    const matchDate = String(item.event?.date || '').slice(0, 10);
    const sportsDb = await verifyWithSportsDb([item.site.date, matchDate], teams.home, teams.away);
    errors.push(...sportsDb.errors.map((value) => `${item.eventId}:${value}`.slice(0, 140)));
    if (sportsDb.matched) sportsDbVerifiedCount += 1;

    active.push({
      fixture_id: item.eventId,
      provider_event_id: item.eventId,
      provider_league_id: extractLeagueId(item.event),
      status: 'live',
      api_status: String(item.event?.status?.type?.name || item.event?.status?.type?.state || 'LIVE'),
      date: matchDate,
      league: item.event?.league?.name || item.site.league || '',
      home: teams.home,
      away: teams.away,
      source_match: item.site,
      source_match_similarity: Number(item.similarity.toFixed(3)),
      source: observed.method === 'espn_scoreboard' ? 'ESPN Scoreboard embedded live statistics'
        : observed.method === 'espn_core' ? 'ESPN Core live statistics'
          : observed.method === 'espn_summary' ? 'ESPN match summary'
            : 'TheSportsDB event statistics',
      source_verified: true,
      verification: {
        stats_method: observed.method,
        stats_metadata: observed.metadata,
        thesportsdb_checked: sportsDb.checked,
        thesportsdb_matched: sportsDb.matched,
        thesportsdb_event_id: sportsDb.event_id,
        thesportsdb_similarity: sportsDb.similarity ?? null,
      },
      snapshots,
      current: snapshots[snapshots.length - 1],
      updated_at: now,
    });
  }

  const recent = [
    ...(Array.isArray(previous.recent_matches) ? previous.recent_matches : []),
    ...(Array.isArray(previous.matches) ? previous.matches : []),
  ].filter((row) => !active.some((current) => String(current.fixture_id) === String(row.fixture_id)))
    .filter((row) => recentEnough(row.updated_at || row.current?.recorded_at || row.generated_at))
    .sort((a, b) => Date.parse(b.updated_at || b.current?.recorded_at || 0) - Date.parse(a.updated_at || a.current?.recorded_at || 0))
    .slice(0, 12);

  const payload = {
    schema_version: 1,
    generated_at: now,
    timezone: 'Europe/Istanbul',
    status: statsSuccessCount > 0 ? 'ok' : (events.length ? 'no_matching_verified_stats' : 'no_live_matches'),
    source: 'ESPN Scoreboard + ESPN Core/Summary + TheSportsDB event stats',
    source_verified: true,
    sampling: {
      workflow_interval_minutes: 30,
      observed_points_only: true,
      interpolation_used: false,
      max_matches_per_run: MAX_MATCHES,
      paid_api_required: false,
    },
    summary: {
      espn_live_event_count: events.length,
      site_candidate_count: candidates.length,
      matched_fixture_count: matched.length,
      sampled_match_count: statsSuccessCount,
      stats_success_count: statsSuccessCount,
      scoreboard_stats_count: scoreboardStatsCount,
      core_stats_count: coreStatsCount,
      summary_stats_count: summaryStatsCount,
      thesportsdb_stats_count: sportsDbStatsCount,
      thesportsdb_verified_count: sportsDbVerifiedCount,
    },
    message: statsSuccessCount > 0
      ? 'Canlı Team Power ve Goal Power yalnız kaynaklarda gerçekten gözlenen maç istatistiklerinden üretildi; veri kapsamı her snapshotta ayrıca gösterildi.'
      : (events.length
        ? 'Canlı maçlar bulundu ancak ayrıntılı doğrulanmış istatistik yeterli değildi; veri uydurulmadı.'
        : 'Şu anda ESPN kaynağında canlı maç bulunmuyor.'),
    matches: active,
    recent_matches: recent,
    provider_errors: [...new Set(errors)].slice(-24),
  };

  const changed = writeIfChanged(OUTPUT_FILE, previous, payload);
  console.log(`Live power v2: live=${events.length}, matched=${matched.length}, sampled=${statsSuccessCount}, preserved=${active.length - statsSuccessCount}, scoreboard=${scoreboardStatsCount}, core=${coreStatsCount}, summary=${summaryStatsCount}, sportsdb=${sportsDbStatsCount}, changed=${changed}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  ...base,
  extractUidPart,
  extractLeagueId,
  statRowsFromTree,
  parseCoreStats,
  parseSportsDbStats,
  scoreboardTeamStats,
  mergeStats,
  comparableStats,
  safeProviderError,
  competitionParts,
  hasUsefulStats,
};


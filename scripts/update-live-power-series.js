const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'live-power-series.json');
const FULL_BULLETIN_FILE = path.join(DATA_DIR, 'full-bulletin.json');
const LIVE_MATCHES_FILE = path.join(DATA_DIR, 'live-matches.json');
const API_BASE = 'https://v3.football.api-sports.io';
const MAX_MATCHES = Math.max(1, Math.min(12, Number(process.env.LIVE_POWER_MAX_MATCHES || 8)));
const KEEP_RECENT_HOURS = 8;
const MAX_SNAPSHOTS = 40;

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

function finite(value) {
  if (value === null || value === undefined || value === '' || value === '-') return null;
  const number = Number(String(value).replace('%', '').replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function normalizeName(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(fc|cf|sc|sk|fk|afc|club|futbol|football|women|woman|kadin|u21|u20|u19|u18|reserves?|ii)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameSimilarity(a, b) {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  const shortest = Math.min(left.length, right.length);
  if (shortest >= 5 && (left.includes(right) || right.includes(left))) return 0.92;

  const aTokens = left.split(' ').filter((t) => t.length >= 3);
  const bTokens = right.split(' ').filter((t) => t.length >= 3);
  if (!aTokens.length || !bTokens.length) return 0;
  let hits = 0;
  for (const aToken of aTokens) {
    const matched = bTokens.some((bToken) => aToken === bToken || (
      Math.min(aToken.length, bToken.length) >= 4 && (aToken.startsWith(bToken) || bToken.startsWith(aToken))
    ));
    if (matched) hits += 1;
  }
  return (2 * hits) / (aTokens.length + bTokens.length);
}

function teamPairSimilarity(site, apiFixture) {
  const home = nameSimilarity(site.home, apiFixture?.teams?.home?.name);
  const away = nameSimilarity(site.away, apiFixture?.teams?.away?.name);
  return { home, away, total: (home + away) / 2 };
}

function statusToken(value) {
  return String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_');
}

function isLiveStatus(value) {
  return /^(live|canli|inplay|in_play|1h|first_half|ht|half_time|2h|second_half|et|extra_time|bt|break|int|interrupted|susp|suspended|paused)$/.test(statusToken(value));
}

function collectSiteCandidates() {
  const full = readJson(FULL_BULLETIN_FILE, { live_matches: [] });
  const live = readJson(LIVE_MATCHES_FILE, { matches: [] });
  const rows = [
    ...(Array.isArray(full.live_matches) ? full.live_matches : []),
    ...(Array.isArray(live.matches) ? live.matches : []),
  ];
  const map = new Map();
  rows.forEach((row) => {
    const home = row.home || row.home_team_name || row.ev_sahibi;
    const away = row.away || row.away_team_name || row.deplasman;
    if (!home || !away) return;
    const key = `${normalizeName(home)}|${normalizeName(away)}`;
    const priority = (row.include_in_coupon ? 1000 : 0) + Number(row.analysis_score || row.model_score || row.confidence_score || 0);
    const candidate = {
      home: String(home),
      away: String(away),
      league: row.league || row.competition_name || row.lig || 'Lig',
      match_code: row.matchCode || row.match_code || null,
      priority,
      status: row.liveStatus || row.status || '',
    };
    const old = map.get(key);
    if (!old || candidate.priority > old.priority || isLiveStatus(candidate.status)) map.set(key, candidate);
  });
  return [...map.values()].sort((a, b) => b.priority - a.priority);
}

function queryString(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') search.set(key, String(value));
  });
  const text = search.toString();
  return text ? `?${text}` : '';
}

async function apiRequest(endpoint, params, apiKey) {
  const response = await fetch(`${API_BASE}${endpoint}${queryString(params)}`, {
    headers: { 'x-apisports-key': apiKey, Accept: 'application/json' },
  });
  const text = await response.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`API-Football JSON parse error (${response.status})`);
  }
  if (!response.ok) throw new Error(`API-Football HTTP ${response.status}`);
  const errors = body?.errors;
  if (errors && ((Array.isArray(errors) && errors.length) || (!Array.isArray(errors) && Object.keys(errors).length))) {
    throw new Error(`API-Football error: ${JSON.stringify(errors).slice(0, 300)}`);
  }
  return {
    body,
    limit: finite(response.headers.get('x-ratelimit-requests-limit')),
    remaining: finite(response.headers.get('x-ratelimit-requests-remaining')),
  };
}

function statisticsMap(rows) {
  const map = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const key = String(row?.type || '').toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/g, ' ').trim();
    if (key) map.set(key, row?.value);
  });
  return map;
}

function firstStat(map, names) {
  for (const name of names) {
    const value = map.get(name);
    const number = finite(value);
    if (number !== null) return number;
  }
  return 0;
}

function parseTeamStats(teamRow) {
  const map = statisticsMap(teamRow?.statistics);
  return {
    shots_on_goal: firstStat(map, ['shots on goal', 'shots on target']),
    total_shots: firstStat(map, ['total shots']),
    shots_inside_box: firstStat(map, ['shots insidebox', 'shots inside box']),
    blocked_shots: firstStat(map, ['blocked shots']),
    corners: firstStat(map, ['corner kicks', 'corners']),
    possession: firstStat(map, ['ball possession', 'possession']),
    accurate_passes: firstStat(map, ['passes accurate', 'accurate passes']),
    total_passes: firstStat(map, ['total passes', 'passes total']),
    expected_goals: firstStat(map, ['expected goals', 'expected goals xg', 'xg']),
    dangerous_attacks: firstStat(map, ['dangerous attacks']),
  };
}

function attackWeight(stats, goals = 0) {
  return (stats.shots_on_goal * 4.5)
    + (stats.total_shots * 1.25)
    + (stats.shots_inside_box * 1.8)
    + (stats.blocked_shots * 0.35)
    + (stats.corners * 1.1)
    + (stats.possession * 0.05)
    + (stats.expected_goals * 12)
    + (stats.dangerous_attacks * 0.25)
    + (Number(goals || 0) * 7);
}

function goalThreat(stats, minute, goals = 0) {
  const weighted = (stats.shots_on_goal * 5)
    + (stats.total_shots * 1.2)
    + (stats.shots_inside_box * 2)
    + (stats.corners * 1.2)
    + (stats.expected_goals * 18)
    + (stats.dangerous_attacks * 0.25)
    + (Number(goals || 0) * 5);
  const elapsed = Math.max(10, Number(minute || 0));
  return clamp(Math.round((weighted / elapsed) * 32));
}

function deltaValue(current, previous, key) {
  return Math.max(0, Number(current?.[key] || 0) - Number(previous?.[key] || 0));
}

function momentumScore(current, previous, minute, previousMinute, goals, previousGoals) {
  if (!previous || previousMinute === null || previousMinute === undefined) return null;
  const deltaMinutes = Math.max(1, Number(minute || 0) - Number(previousMinute || 0));
  const deltaThreat = (deltaValue(current, previous, 'shots_on_goal') * 12)
    + (deltaValue(current, previous, 'total_shots') * 4)
    + (deltaValue(current, previous, 'shots_inside_box') * 6)
    + (deltaValue(current, previous, 'corners') * 4)
    + (deltaValue(current, previous, 'expected_goals') * 35)
    + (deltaValue(current, previous, 'dangerous_attacks') * 0.6)
    + (Math.max(0, Number(goals || 0) - Number(previousGoals || 0)) * 18);
  return clamp(Math.round((deltaThreat / deltaMinutes) * 10));
}

function computePower(homeStats, awayStats, minute, homeGoals = 0, awayGoals = 0, previousSnapshot = null) {
  const homeRaw = attackWeight(homeStats, homeGoals);
  const awayRaw = attackWeight(awayStats, awayGoals);
  const total = homeRaw + awayRaw;
  const homeShare = total > 0 ? Math.round((homeRaw / total) * 100) : 50;
  const awayShare = 100 - homeShare;
  const previousStats = previousSnapshot?.stats || {};
  const previousScore = previousSnapshot?.score || {};
  return {
    team_power: { home: clamp(homeShare), away: clamp(awayShare) },
    goal_power: {
      home: goalThreat(homeStats, minute, homeGoals),
      away: goalThreat(awayStats, minute, awayGoals),
    },
    momentum: {
      home: momentumScore(homeStats, previousStats.home, minute, previousSnapshot?.minute, homeGoals, previousScore.home),
      away: momentumScore(awayStats, previousStats.away, minute, previousSnapshot?.minute, awayGoals, previousScore.away),
    },
  };
}

function mergeSnapshot(snapshots, snapshot) {
  const list = Array.isArray(snapshots) ? [...snapshots] : [];
  const index = list.findIndex((row) => Number(row.minute) === Number(snapshot.minute));
  if (index >= 0) list[index] = snapshot;
  else list.push(snapshot);
  return list.sort((a, b) => Number(a.minute || 0) - Number(b.minute || 0)).slice(-MAX_SNAPSHOTS);
}

function findStatsRows(statsPayload, fixture) {
  const rows = Array.isArray(statsPayload?.response) ? statsPayload.response : [];
  const homeId = fixture?.teams?.home?.id;
  const awayId = fixture?.teams?.away?.id;
  const home = rows.find((row) => Number(row?.team?.id) === Number(homeId)) || rows[0];
  const away = rows.find((row) => Number(row?.team?.id) === Number(awayId)) || rows[1];
  return { home, away };
}

function bestSiteMatch(fixture, siteCandidates) {
  let best = null;
  for (const site of siteCandidates) {
    const sim = teamPairSimilarity(site, fixture);
    if (sim.home < 0.45 || sim.away < 0.45 || sim.total < 0.6) continue;
    const rank = sim.total + Math.min(0.2, site.priority / 5000);
    if (!best || rank > best.rank) best = { site, sim, rank };
  }
  return best;
}

function recentEnough(iso, hours = KEEP_RECENT_HOURS) {
  const time = Date.parse(String(iso || ''));
  return Number.isFinite(time) && (Date.now() - time) <= hours * 3600 * 1000;
}

async function main() {
  const now = new Date().toISOString();
  const previous = readJson(OUTPUT_FILE, { schema_version: 1, matches: [], recent_matches: [] });
  const apiKey = process.env.API_FOOTBALL_KEY || process.env.API_FOOTBALL_KEY2 || '';
  if (!apiKey) {
    writeJson(OUTPUT_FILE, {
      ...previous,
      schema_version: 1,
      generated_at: previous.generated_at || now,
      last_attempt_at: now,
      status: 'waiting_api_key',
      source: 'API-Football statistics',
      message: 'Canli guc verisi icin API_FOOTBALL_KEY bekleniyor. Eski dogrulanmis veriler korunuyor.',
    });
    console.log('Live power: API key unavailable; preserved previous verified data.');
    return;
  }

  let liveResult;
  try {
    liveResult = await apiRequest('/fixtures', { live: 'all' }, apiKey);
  } catch (error) {
    writeJson(OUTPUT_FILE, {
      ...previous,
      last_attempt_at: now,
      status: 'api_error',
      message: String(error?.message || error).slice(0, 300),
    });
    console.warn('Live power API error:', error?.message || error);
    return;
  }

  const apiFixtures = Array.isArray(liveResult.body?.response) ? liveResult.body.response : [];
  const siteCandidates = collectSiteCandidates();
  const matches = [];
  const usedFixtureIds = new Set();
  for (const fixture of apiFixtures) {
    const best = bestSiteMatch(fixture, siteCandidates);
    if (!best) continue;
    const fixtureId = Number(fixture?.fixture?.id);
    if (!fixtureId || usedFixtureIds.has(fixtureId)) continue;
    usedFixtureIds.add(fixtureId);
    matches.push({ fixture, site: best.site, similarity: best.sim.total });
  }
  matches.sort((a, b) => (b.site.priority - a.site.priority) || (b.similarity - a.similarity));

  const lowQuotaMode = liveResult.limit !== null && liveResult.limit <= 150;
  const remaining = liveResult.remaining;
  let statCap = lowQuotaMode ? 1 : MAX_MATCHES;
  if (remaining !== null) statCap = Math.max(0, Math.min(statCap, Math.floor(remaining - 2)));
  const selected = matches.slice(0, statCap);
  const previousMap = new Map((Array.isArray(previous.matches) ? previous.matches : []).map((row) => [Number(row.fixture_id), row]));
  const activeSeries = [];

  for (const item of selected) {
    const fixture = item.fixture;
    const fixtureId = Number(fixture.fixture.id);
    let statsResult;
    try {
      statsResult = await apiRequest('/fixtures/statistics', { fixture: fixtureId }, apiKey);
    } catch (error) {
      console.warn(`Live power stats skipped fixture ${fixtureId}:`, error?.message || error);
      const old = previousMap.get(fixtureId);
      if (old) activeSeries.push({ ...old, status: 'stats_temporarily_unavailable' });
      continue;
    }
    const rows = findStatsRows(statsResult.body, fixture);
    if (!rows.home || !rows.away) continue;
    const homeStats = parseTeamStats(rows.home);
    const awayStats = parseTeamStats(rows.away);
    const minute = finite(fixture?.fixture?.status?.elapsed);
    if (minute === null) continue;
    const homeGoals = Number(fixture?.goals?.home || 0);
    const awayGoals = Number(fixture?.goals?.away || 0);
    const old = previousMap.get(fixtureId) || {};
    const oldSnapshots = Array.isArray(old.snapshots) ? old.snapshots : [];
    const previousSnapshot = oldSnapshots.length ? oldSnapshots[oldSnapshots.length - 1] : null;
    const power = computePower(homeStats, awayStats, minute, homeGoals, awayGoals, previousSnapshot);
    const snapshot = {
      minute,
      recorded_at: now,
      observed: true,
      interpolated: false,
      score: { home: homeGoals, away: awayGoals },
      ...power,
      stats: { home: homeStats, away: awayStats },
    };
    activeSeries.push({
      fixture_id: fixtureId,
      status: 'live',
      api_status: fixture?.fixture?.status?.short || fixture?.fixture?.status?.long || 'LIVE',
      date: String(fixture?.fixture?.date || '').slice(0, 10),
      league: fixture?.league?.name || item.site.league || 'Lig',
      home: fixture?.teams?.home?.name || item.site.home,
      away: fixture?.teams?.away?.name || item.site.away,
      site_home: item.site.home,
      site_away: item.site.away,
      site_match_code: item.site.match_code,
      match_similarity: Number(item.similarity.toFixed(3)),
      source: 'API-Football live fixture statistics',
      sample_semantics: 'Only observed API snapshots are stored; intermediate minutes are not estimated.',
      last_seen_at: now,
      current: snapshot,
      snapshots: mergeSnapshot(oldSnapshots, snapshot),
    });
  }

  const activeIds = new Set(activeSeries.map((row) => Number(row.fixture_id)));
  const recentPool = [
    ...(Array.isArray(previous.matches) ? previous.matches : []),
    ...(Array.isArray(previous.recent_matches) ? previous.recent_matches : []),
  ];
  const recentMap = new Map();
  recentPool.forEach((row) => {
    const id = Number(row?.fixture_id);
    if (!id || activeIds.has(id) || !recentEnough(row.last_seen_at)) return;
    recentMap.set(id, { ...row, status: row.status === 'live' ? 'recent' : row.status });
  });

  const payload = {
    schema_version: 1,
    generated_at: now,
    timezone: 'Europe/Istanbul',
    status: activeSeries.length ? 'active' : (apiFixtures.length ? 'waiting_site_match' : 'waiting_live_match'),
    source: 'API-Football live fixture statistics',
    source_verified: true,
    sampling: {
      workflow_interval_minutes: 30,
      observed_points_only: true,
      interpolation_used: false,
      low_quota_mode: lowQuotaMode,
      max_matches_per_run: statCap,
    },
    api_quota: {
      request_limit: liveResult.limit,
      request_remaining_after_live_query: liveResult.remaining,
    },
    summary: {
      api_live_fixture_count: apiFixtures.length,
      site_candidate_count: siteCandidates.length,
      matched_fixture_count: matches.length,
      sampled_match_count: activeSeries.length,
    },
    message: activeSeries.length
      ? 'Dogrulanmis canli istatistiklerden Team Power ve Goal Power snapshotlari uretildi.'
      : 'Dogrulanmis canli istatistik eslesmesi bekleniyor; sahte grafik uretilmedi.',
    matches: activeSeries,
    recent_matches: [...recentMap.values()].sort((a, b) => String(b.last_seen_at).localeCompare(String(a.last_seen_at))).slice(0, 12),
  };
  writeJson(OUTPUT_FILE, payload);
  console.log(`Live power updated. API live=${apiFixtures.length}, matched=${matches.length}, sampled=${activeSeries.length}, cap=${statCap}.`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  normalizeName,
  nameSimilarity,
  parseTeamStats,
  computePower,
  mergeSnapshot,
  teamPairSimilarity,
};

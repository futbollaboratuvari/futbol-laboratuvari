const fs = require('fs');
const https = require('https');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'live-power-series.json');
const FULL_BULLETIN_FILE = path.join(DATA_DIR, 'full-bulletin.json');
const LIVE_MATCHES_FILE = path.join(DATA_DIR, 'live-matches.json');
const ESPN_SCOREBOARD_HOSTS = ['site.api.espn.com', 'site.web.api.espn.com'];
const ESPN_SUMMARY_HOSTS = ['site.api.espn.com', 'site.web.api.espn.com'];
const THESPORTSDB_BASE = 'https://www.thesportsdb.com/api/v1/json/123';
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

function writeIfChanged(file, current, next) {
  if (JSON.stringify(current) === JSON.stringify(next)) return false;
  writeJson(file, next);
  return true;
}

function finite(value) {
  if (value === null || value === undefined || value === '' || value === '-') return null;
  const number = Number(String(value).replace('%', '').replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function requestJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; FutbolLaboratuvari-LivePower/2.0)',
        Referer: 'https://www.espn.com/',
        ...headers,
      },
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`HTTP ${response.statusCode}: ${body.slice(0, 180)}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('Veri kaynağı geçerli JSON döndürmedi.'));
        }
      });
    });
    request.setTimeout(25000, () => request.destroy(new Error('Veri kaynağı zaman aşımına uğradı.')));
    request.on('error', reject);
  });
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

function collectSiteCandidates() {
  const rows = [];
  const seen = new Set();
  const push = (item, priority = 0) => {
    const home = item?.home || item?.homeTeam || item?.home_team || item?.home_team_name || item?.teams?.home?.name;
    const away = item?.away || item?.awayTeam || item?.away_team || item?.away_team_name || item?.teams?.away?.name;
    if (!home || !away) return;
    const key = `${normalizeName(home)}|${normalizeName(away)}`;
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

function espnEventTeams(event) {
  const competition = event?.competitions?.[0] || {};
  const competitors = Array.isArray(competition.competitors) ? competition.competitors : [];
  const home = competitors.find((row) => row.homeAway === 'home') || competitors[0] || {};
  const away = competitors.find((row) => row.homeAway === 'away') || competitors[1] || {};
  return {
    home: home?.team?.displayName || home?.team?.shortDisplayName || home?.team?.name || '',
    away: away?.team?.displayName || away?.team?.shortDisplayName || away?.team?.name || '',
    homeScore: finite(home?.score) ?? 0,
    awayScore: finite(away?.score) ?? 0,
  };
}

function teamPairSimilarity(site, event) {
  const teams = espnEventTeams(event);
  const home = nameSimilarity(site.home, teams.home);
  const away = nameSimilarity(site.away, teams.away);
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

function extractMinute(event, summary) {
  const candidates = [
    event?.status?.displayClock,
    event?.competitions?.[0]?.status?.displayClock,
    summary?.header?.competitions?.[0]?.status?.displayClock,
  ];
  for (const value of candidates) {
    const match = String(value || '').match(/(\d{1,3})/);
    if (match) return Number(match[1]);
  }
  const period = finite(event?.status?.period ?? event?.competitions?.[0]?.status?.period);
  if (period === 1) return 45;
  if (period >= 2) return 90;
  return null;
}

function isLiveEspnEvent(event) {
  const status = event?.status?.type || event?.competitions?.[0]?.status?.type || {};
  if (status.completed) return false;
  if (status.state === 'in') return true;
  return /^STATUS_(IN_PROGRESS|HALFTIME|SECOND_HALF|FIRST_HALF|EXTRA_TIME|SHOOTOUT)/.test(String(status.name || ''));
}

async function fetchEspnScoreboard() {
  const errors = [];
  for (const host of ESPN_SCOREBOARD_HOSTS) {
    try {
      const payload = await requestJson(`https://${host}/apis/site/v2/sports/soccer/all/scoreboard?limit=1000`);
      return { payload, host, errors };
    } catch (error) {
      errors.push(`${host}: ${error.message}`);
    }
  }
  throw new Error(errors.join(' | ') || 'ESPN scoreboard unavailable');
}

async function fetchEspnSummary(eventId) {
  const errors = [];
  for (const host of ESPN_SUMMARY_HOSTS) {
    try {
      const payload = await requestJson(`https://${host}/apis/site/v2/sports/soccer/summary?event=${encodeURIComponent(eventId)}`);
      return { payload, host, errors };
    } catch (error) {
      errors.push(`${host}: ${error.message}`);
    }
  }
  throw new Error(errors.join(' | ') || `ESPN summary unavailable for ${eventId}`);
}

function statKey(value) {
  return String(value || '').toLocaleLowerCase('en-US').replace(/[^a-z0-9]+/g, ' ').trim();
}

function statisticsMap(rows) {
  const map = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const key = statKey(row?.name || row?.label || row?.abbreviation || row?.type);
    const display = row?.displayValue ?? row?.value;
    if (key) map.set(key, display);
  });
  return map;
}

function firstStat(map, names) {
  for (const name of names) {
    const value = map.get(statKey(name));
    const number = finite(value);
    if (number !== null) return number;
  }
  return 0;
}

function parseTeamStatsFromRows(rows) {
  const map = statisticsMap(rows);
  return {
    shots_on_goal: firstStat(map, ['shots on target', 'shots on goal', 'shotsontarget']),
    total_shots: firstStat(map, ['total shots', 'shots total', 'shots']),
    shots_inside_box: firstStat(map, ['shots inside box', 'shots insidebox']),
    blocked_shots: firstStat(map, ['blocked shots']),
    corners: firstStat(map, ['corner kicks', 'corners', 'corner kick']),
    possession: firstStat(map, ['possession', 'ball possession', 'possessionpct']),
    accurate_passes: firstStat(map, ['accurate passes', 'passes accurate', 'accuratepasses']),
    total_passes: firstStat(map, ['total passes', 'passes total', 'passes']),
    expected_goals: firstStat(map, ['expected goals', 'expected goals xg', 'xg']),
    dangerous_attacks: firstStat(map, ['dangerous attacks']),
  };
}

function boxscoreTeams(summary) {
  const groups = Array.isArray(summary?.boxscore?.teams) ? summary.boxscore.teams : [];
  const byHomeAway = (side) => groups.find((row) => row?.homeAway === side || row?.team?.homeAway === side);
  const home = byHomeAway('home') || groups[0];
  const away = byHomeAway('away') || groups[1];
  return {
    home: home ? parseTeamStatsFromRows(home.statistics) : null,
    away: away ? parseTeamStatsFromRows(away.statistics) : null,
  };
}

function hasUsefulStats(stats) {
  if (!stats) return false;
  return [
    stats.shots_on_goal,
    stats.total_shots,
    stats.shots_inside_box,
    stats.corners,
    stats.possession,
    stats.expected_goals,
    stats.dangerous_attacks,
  ].some((value) => Number(value || 0) > 0);
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

function recentEnough(iso, hours = KEEP_RECENT_HOURS) {
  const time = Date.parse(String(iso || ''));
  return Number.isFinite(time) && (Date.now() - time) <= hours * 3600 * 1000;
}

async function verifyWithSportsDb(date, home, away) {
  if (!date) return { checked: false, matched: false };
  try {
    const payload = await requestJson(`${THESPORTSDB_BASE}/eventsday.php?d=${encodeURIComponent(date)}&s=Soccer`);
    const events = Array.isArray(payload?.events) ? payload.events : [];
    let best = 0;
    for (const event of events) {
      const homeSim = nameSimilarity(home, event?.strHomeTeam);
      const awaySim = nameSimilarity(away, event?.strAwayTeam);
      const score = (homeSim + awaySim) / 2;
      if (homeSim >= 0.5 && awaySim >= 0.5 && score > best) best = score;
    }
    return { checked: true, matched: best >= 0.65, similarity: Number(best.toFixed(3)) };
  } catch (error) {
    return { checked: false, matched: false, error: String(error.message || error).slice(0, 180) };
  }
}

function stableProviderFailurePayload(previous, now, message, code = null) {
  const payload = {
    ...previous,
    schema_version: 1,
    generated_at: previous.generated_at || now,
    timezone: 'Europe/Istanbul',
    status: 'provider_error',
    source: 'ESPN Scoreboard + ESPN Summary',
    source_verified: false,
    message,
  };
  if (code) payload.provider_error_code = code;
  return payload;
}

async function main() {
  const now = new Date().toISOString();
  const previous = readJson(OUTPUT_FILE, { schema_version: 1, matches: [], recent_matches: [] });
  let scoreboard;
  try {
    scoreboard = await fetchEspnScoreboard();
  } catch (error) {
    const message = String(error?.message || error).slice(0, 300);
    const failure = stableProviderFailurePayload(
      previous,
      now,
      'Ücretsiz ESPN canlı veri kaynağına geçici olarak ulaşılamadı. Eski doğrulanmış veriler korunuyor.',
      message,
    );
    writeIfChanged(OUTPUT_FILE, previous, failure);
    console.warn('Live power ESPN error:', message);
    return;
  }

  const events = (Array.isArray(scoreboard.payload?.events) ? scoreboard.payload.events : []).filter(isLiveEspnEvent);
  const siteCandidates = collectSiteCandidates();
  const previousMap = new Map((Array.isArray(previous.matches) ? previous.matches : []).map((row) => [String(row.fixture_id), row]));
  const matched = [];
  for (const event of events) {
    const best = bestSiteMatch(event, siteCandidates);
    if (!best) continue;
    const eventId = String(event?.id || event?.competitions?.[0]?.id || '').trim();
    if (!eventId) continue;
    matched.push({ event, site: best.site, similarity: best.sim.total, eventId });
  }
  matched.sort((a, b) => {
    const continuityA = previousMap.has(a.eventId) ? 100000 : 0;
    const continuityB = previousMap.has(b.eventId) ? 100000 : 0;
    return (continuityB - continuityA)
      || (b.site.priority - a.site.priority)
      || (b.similarity - a.similarity);
  });

  const selected = matched.slice(0, MAX_MATCHES);
  const activeSeries = [];
  const providerErrors = [...scoreboard.errors];
  let summarySuccessCount = 0;
  let usefulStatsCount = 0;
  let sportsDbVerifiedCount = 0;

  for (const item of selected) {
    const { event, eventId } = item;
    let summaryResult;
    try {
      summaryResult = await fetchEspnSummary(eventId);
      summarySuccessCount += 1;
      providerErrors.push(...summaryResult.errors);
    } catch (error) {
      providerErrors.push(`ESPN summary ${eventId}: ${error.message || error}`);
      const old = previousMap.get(eventId);
      if (old) activeSeries.push({ ...old, status: 'stats_temporarily_unavailable' });
      continue;
    }

    const stats = boxscoreTeams(summaryResult.payload);
    if (!hasUsefulStats(stats.home) && !hasUsefulStats(stats.away)) {
      const old = previousMap.get(eventId);
      if (old) activeSeries.push({ ...old, status: 'stats_not_available_for_match' });
      continue;
    }
    usefulStatsCount += 1;

    const minute = extractMinute(event, summaryResult.payload);
    if (minute === null) continue;
    const teams = espnEventTeams(event);
    const old = previousMap.get(eventId) || {};
    const oldSnapshots = Array.isArray(old.snapshots) ? old.snapshots : [];
    const previousSnapshot = oldSnapshots.length ? oldSnapshots[oldSnapshots.length - 1] : null;
    const power = computePower(stats.home || parseTeamStatsFromRows([]), stats.away || parseTeamStatsFromRows([]), minute, teams.homeScore, teams.awayScore, previousSnapshot);
    const snapshot = {
      minute,
      recorded_at: now,
      observed: true,
      interpolated: false,
      score: { home: teams.homeScore, away: teams.awayScore },
      ...power,
      stats: {
        home: stats.home || parseTeamStatsFromRows([]),
        away: stats.away || parseTeamStatsFromRows([]),
      },
    };
    const snapshots = mergeSnapshot(oldSnapshots, snapshot);
    const matchDate = String(event?.date || '').slice(0, 10);
    const sportsDb = await verifyWithSportsDb(matchDate, teams.home, teams.away);
    if (sportsDb.matched) sportsDbVerifiedCount += 1;

    activeSeries.push({
      fixture_id: eventId,
      provider_event_id: eventId,
      status: 'live',
      api_status: String(event?.status?.type?.name || event?.status?.type?.state || 'LIVE'),
      date: matchDate,
      league: event?.league?.name || event?.competitions?.[0]?.league?.name || item.site.league || '',
      home: teams.home,
      away: teams.away,
      source_match: item.site,
      source_match_similarity: Number(item.similarity.toFixed(3)),
      source: 'ESPN Scoreboard + ESPN Summary',
      source_verified: true,
      verification: {
        espn_summary: true,
        thesportsdb_checked: sportsDb.checked,
        thesportsdb_matched: sportsDb.matched,
        thesportsdb_similarity: sportsDb.similarity ?? null,
      },
      snapshots,
      current: snapshots[snapshots.length - 1],
      updated_at: now,
    });
  }

  const recentFromPrevious = [
    ...(Array.isArray(previous.recent_matches) ? previous.recent_matches : []),
    ...(Array.isArray(previous.matches) ? previous.matches : []),
  ].filter((row) => !activeSeries.some((active) => String(active.fixture_id) === String(row.fixture_id)))
    .filter((row) => recentEnough(row.updated_at || row.current?.recorded_at || row.generated_at))
    .sort((a, b) => Date.parse(b.updated_at || b.current?.recorded_at || 0) - Date.parse(a.updated_at || a.current?.recorded_at || 0))
    .slice(0, 12);

  const payload = {
    schema_version: 1,
    generated_at: now,
    timezone: 'Europe/Istanbul',
    status: activeSeries.length ? 'ok' : (events.length ? 'no_matching_verified_stats' : 'no_live_matches'),
    source: 'ESPN Scoreboard + ESPN Summary',
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
      site_candidate_count: siteCandidates.length,
      matched_fixture_count: matched.length,
      sampled_match_count: activeSeries.length,
      summary_success_count: summarySuccessCount,
      useful_stats_count: usefulStatsCount,
      thesportsdb_verified_count: sportsDbVerifiedCount,
    },
    message: activeSeries.length
      ? 'Canlı Team Power ve Goal Power yalnız ESPN üzerinde gözlenen gerçek maç istatistiklerinden üretildi.'
      : (events.length
        ? 'Canlı maçlar bulundu ancak site eşleşmesi veya ayrıntılı istatistik yeterli değildi; veri uydurulmadı.'
        : 'Şu anda ESPN kaynağında canlı maç bulunmuyor.'),
    matches: activeSeries,
    recent_matches: recentFromPrevious,
    provider_errors: providerErrors.slice(-12),
  };

  const changed = writeIfChanged(OUTPUT_FILE, previous, payload);
  console.log(`Live power: ESPN free-source collector completed. Live=${events.length}, matched=${matched.length}, sampled=${activeSeries.length}, changed=${changed}.`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  finite,
  normalizeName,
  nameSimilarity,
  parseTeamStatsFromRows,
  computePower,
  mergeSnapshot,
  espnEventTeams,
  isLiveEspnEvent,
  boxscoreTeams,
  extractMinute,
};

const fs = require('fs');
const path = require('path');
const {
  classifyBulletinMatch,
  verifiedMinute,
  hasVerifiedStatusEvidence,
} = require('./bulletin-active-filter');

const dataDir = path.join(__dirname, '..', 'data');
const fullBulletinPath = path.join(dataDir, 'full-bulletin.json');
const liveMatchesPath = path.join(dataDir, 'live-matches.json');
const outputPath = path.join(dataDir, 'live-now.json');

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
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function keyOf(m) {
  return [m.date, m.time, m.home || m.home_team_name, m.away || m.away_team_name]
    .map((v) => String(v || '').trim().toLocaleLowerCase('tr-TR')).join('|');
}

function normalize(item, source) {
  const split = String(item.match || item.match_name || '').split(/\s+-\s+|\s+VS\s+/i);
  const date = String(item.date || item.tarih || '').slice(0, 10);
  const time = String(item.time || item.saat || item.start_time || '').trim();
  const home = item.home || item.home_team_name || split[0] || '';
  const away = item.away || item.away_team_name || split[1] || '';
  if (!date || !time || !home || !away) return null;
  const odds = item.odds || item.available_odds || {};
  return {
    date, time, league: item.league || item.competition_name || item.lig || 'Diger', home, away,
    match: `${home} - ${away}`,
    matchCode: item.matchCode || item.match_code || null,
    status: item.status || item.liveStatus || 'scheduled',
    liveStatus: item.liveStatus || item.status || 'scheduled',
    status_verified: item.status_verified === true,
    status_source: item.status_source || '',
    minute: item.minute ?? null,
    homeScore: item.homeScore ?? item.home_score ?? null,
    awayScore: item.awayScore ?? item.away_score ?? null,
    score: item.score || item.skor || '',
    source: item.source || source,
    odds
  };
}

function stateOf(match) {
  const status = classifyBulletinMatch(match);
  return { status, minute: verifiedMinute(match, status) };
}

function collectSources() {
  const full = readJson(fullBulletinPath, { matches: [], live_matches: [] });
  const liveFile = readJson(liveMatchesPath, { matches: [] });
  const liveRootDate = String(liveFile.date || full?.date_window?.main_day || '').slice(0, 10);
  const normalizeLiveFile = (m, source) => normalize({ ...m, date: m.date || m.tarih || liveRootDate }, source);
  const list = [
    ...(Array.isArray(full.matches) ? full.matches.map((m) => normalize(m, 'full-bulletin.json')) : []),
    ...(Array.isArray(full.live_matches) ? full.live_matches.map((m) => normalize(m, 'full-bulletin.json/live_matches')) : []),
    ...(Array.isArray(liveFile.matches) ? liveFile.matches.map((m) => normalizeLiveFile(m, 'live-matches.json')) : [])
  ].filter(Boolean);
  const map = new Map();
  list.forEach((m) => map.set(keyOf(m), m));
  return [...map.values()];
}

const allMatches = collectSources().map((match) => {
  const state = stateOf(match);
  return {
    ...match,
    status: state.status,
    liveStatus: state.status,
    status_verified: ['live', 'finished'].includes(state.status) && hasVerifiedStatusEvidence(match),
    minute: state.minute,
    last_update: new Date().toISOString()
  };
});
const live = allMatches.filter((m) => m.liveStatus === 'live');
const upcoming = allMatches.filter((m) => m.liveStatus === 'scheduled').slice(0, 10);
const discarded = allMatches.filter((m) => ['expired_scheduled', 'unverified', 'unknown'].includes(m.liveStatus));

writeJson(outputPath, {
  generated_at: new Date().toISOString(),
  timezone: 'Europe/Istanbul',
  source: allMatches.length ? 'full-bulletin + live-matches' : 'Canli veri bekleniyor',
  status: live.length ? 'active' : 'waiting',
  message: live.length ? 'Baslayan karsilasmalar listelendi.' : 'Baslayan karsilasma bulunamadi.',
  live_count: live.length,
  upcoming_count: upcoming.length,
  discarded_unverified_count: discarded.length,
  status_policy: 'provider_verified_only',
  matches: live,
  upcoming_matches: upcoming
});

console.log(`live-now.json updated. Live: ${live.length}. Upcoming: ${upcoming.length}.`);

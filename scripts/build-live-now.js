const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const fullBulletinPath = path.join(dataDir, 'full-bulletin.json');
const liveMatchesPath = path.join(dataDir, 'live-matches.json');
const outputPath = path.join(dataDir, 'live-now.json');
const LIVE_WINDOW_MINUTES = 130;
const UPCOMING_WINDOW_MINUTES = 90;

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

function partsTR() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date()).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
}

function todayTR() {
  const p = partsTR();
  return `${p.year}-${p.month}-${p.day}`;
}

function nowMinutesTR() {
  const p = partsTR();
  return Number(p.hour) * 60 + Number(p.minute);
}

function clockMinutes(time) {
  const m = String(time || '').match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
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
    minute: item.minute ?? null,
    score: item.score || '',
    source: item.source || source,
    odds
  };
}

function stateOf(match) {
  const explicit = String(match.status || match.liveStatus || '').toLowerCase();
  if (['live', 'canli', 'canlı', 'inplay', 'in_play', '1h', '2h', 'ht', 'paused'].includes(explicit)) return { status: 'live', minute: Number(match.minute) || null };
  if (['finished', 'cancelled', 'postponed'].includes(explicit)) return { status: explicit, minute: match.minute ?? null };
  const start = clockMinutes(match.time);
  if (match.date !== todayTR() || start === null) return { status: 'scheduled', minute: null };
  const diff = nowMinutesTR() - start;
  if (diff >= 0 && diff <= LIVE_WINDOW_MINUTES) return { status: 'live', minute: Math.max(1, Math.min(90, diff > 60 ? diff - 15 : diff)) };
  if (diff < 0 && Math.abs(diff) <= UPCOMING_WINDOW_MINUTES) return { status: 'upcoming', minute: null };
  if (diff > LIVE_WINDOW_MINUTES) return { status: 'finished', minute: 90 };
  return { status: 'scheduled', minute: null };
}

function collectSources() {
  const full = readJson(fullBulletinPath, { matches: [], live_matches: [] });
  const liveFile = readJson(liveMatchesPath, { matches: [] });
  const list = [
    ...(Array.isArray(full.matches) ? full.matches.map((m) => normalize(m, 'full-bulletin.json')) : []),
    ...(Array.isArray(full.live_matches) ? full.live_matches.map((m) => normalize(m, 'full-bulletin.json/live_matches')) : []),
    ...(Array.isArray(liveFile.matches) ? liveFile.matches.map((m) => normalize(m, 'live-matches.json')) : [])
  ].filter(Boolean);
  const map = new Map();
  list.forEach((m) => map.set(keyOf(m), m));
  return [...map.values()];
}

const allMatches = collectSources().map((match) => {
  const state = stateOf(match);
  return { ...match, status: state.status === 'upcoming' ? 'scheduled' : state.status, liveStatus: state.status, minute: state.minute, last_update: new Date().toISOString() };
});
const live = allMatches.filter((m) => m.liveStatus === 'live');
const upcoming = allMatches.filter((m) => m.liveStatus === 'upcoming').slice(0, 10);

writeJson(outputPath, {
  generated_at: new Date().toISOString(),
  timezone: 'Europe/Istanbul',
  source: allMatches.length ? 'full-bulletin + live-matches' : 'Canli veri bekleniyor',
  status: live.length ? 'active' : 'waiting',
  message: live.length ? 'Baslayan karsilasmalar listelendi.' : 'Baslayan karsilasma bulunamadi.',
  live_count: live.length,
  upcoming_count: upcoming.length,
  matches: live,
  upcoming_matches: upcoming
});

console.log(`live-now.json updated. Live: ${live.length}. Upcoming: ${upcoming.length}.`);

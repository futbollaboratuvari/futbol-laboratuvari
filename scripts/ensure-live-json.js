const fs = require('fs');
const path = require('path');

try {
  require('./update-match-archive.js');
} catch (error) {
  console.warn(`match archive cleanup skipped: ${error.message}`);
}

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const liveFile = path.join(dataDir, 'live-matches.json');
const fixturesFile = path.join(dataDir, 'fixtures.json');
const analysisFile = path.join(dataDir, 'analiz_sonuclari.json');
const focusFile = path.join(dataDir, 'focused_markets.json');

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

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function statusOf(match) {
  return String(match.status || match.liveStatus || match.durum || 'scheduled').toLocaleLowerCase('tr-TR');
}

function isLive(match) {
  return ['live', 'canlı', 'canli', 'in_play', 'inplay', '1h', '2h', 'ht', 'paused'].includes(statusOf(match));
}

function isFinished(match) {
  return ['finished', 'bitti', 'tamamlandı', 'tamamlandi', 'full_time', 'ft', 'ms', 'cancelled', 'canceled', 'iptal'].includes(statusOf(match));
}

function isCurrentWindow(match, today) {
  const date = String(match.date || match.tarih || '').slice(0, 10);
  return date && date >= today;
}

function scoreOf(match) {
  const home = match.homeScore ?? match.home_score ?? match.homeGoals ?? match.home_goals;
  const away = match.awayScore ?? match.away_score ?? match.awayGoals ?? match.away_goals;
  if (home !== undefined && home !== null && home !== '' && away !== undefined && away !== null && away !== '') return `${home}-${away}`;
  return String(match.score || match.skor || match.result_score || match.result || '').trim();
}

function normalizeMatch(match) {
  return {
    date: match.date || match.tarih || '',
    time: match.time || match.saat || '',
    league: match.league || match.competition_name || match.lig || '',
    home: match.home || match.home_team_name || match.ev_sahibi || '',
    away: match.away || match.away_team_name || match.deplasman || '',
    status: statusOf(match),
    liveStatus: statusOf(match),
    minute: match.minute ?? match.elapsed ?? match.matchMinute ?? null,
    score: scoreOf(match),
    source: match.source || match.kaynak || '',
    matchCode: match.matchCode || match.mac_kodu || null,
    oneOdd: match.oneOdd ?? match.one ?? match.ms1 ?? null,
    drawOdd: match.drawOdd ?? match.draw ?? match.msx ?? null,
    twoOdd: match.twoOdd ?? match.two ?? match.ms2 ?? null,
    suggested_option: match.suggested_option || match.selection || match.market || '',
    suggested_odds: match.suggested_odds || match.odds || '',
    raw_market_block_count: match.raw_market_block_count || 0,
    raw_market_value_count: match.raw_market_value_count || 0
  };
}

const today = todayKey();
const fixtures = readJson(fixturesFile, []);
const analysis = readJson(analysisFile, { active_items: [], completed_items: [] });
const focus = readJson(focusFile, { focused_markets: [] });
const fixtureList = Array.isArray(fixtures) ? fixtures : [];
const windowMatches = fixtureList.filter((match) => isCurrentWindow(match, today));
const liveMatches = windowMatches.filter(isLive);
const finishedMatches = windowMatches.filter(isFinished);
const scheduledMatches = windowMatches.filter((match) => !isLive(match) && !isFinished(match));
const activeItems = Array.isArray(analysis.active_items) ? analysis.active_items : [];
const completedItems = Array.isArray(analysis.completed_items) ? analysis.completed_items : [];
const source = windowMatches[0]?.source || fixtureList[0]?.source || analysis.source || 'Güncel veri bekleniyor';
const nextMatch = scheduledMatches.slice().sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')))[0] || liveMatches[0] || null;

const payload = {
  generated_at: new Date().toISOString(),
  date: today,
  timezone: 'Europe/Istanbul',
  source,
  engine: 'Futbol Laboratuvarı Canlı Veri Robotu',
  status: windowMatches.length ? 'active' : 'waiting',
  message: windowMatches.length ? 'Canlı veri alanı güncel maç akışını gösteriyor.' : 'Bugün için güncel veri henüz oluşmadı.',
  counts: {
    total: fixtureList.length,
    current_window: windowMatches.length,
    live: liveMatches.length,
    scheduled: scheduledMatches.length,
    finished: finishedMatches.length,
    active_analysis: activeItems.length,
    completed_analysis: completedItems.length,
    focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets.length : 0
  },
  next_match: nextMatch ? normalizeMatch(nextMatch) : null,
  focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets : [],
  matches: windowMatches.map(normalizeMatch)
};

writeJson(liveFile, payload);
console.log(`live-matches.json updated. Matches: ${payload.counts.current_window}. Live: ${payload.counts.live}. Scheduled: ${payload.counts.scheduled}.`);

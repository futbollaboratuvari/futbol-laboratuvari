const fs = require('fs');
const path = require('path');
const {
  classifyBulletinMatch,
  verifiedMinute,
  hasVerifiedStatusEvidence,
} = require('./bulletin-active-filter');

try {
  require('./update-match-archive.js');
} catch (error) {
  console.warn(`match archive cleanup skipped: ${error.message}`);
}

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const liveFile = path.join(dataDir, 'live-matches.json');
const fixturesFile = path.join(dataDir, 'fixtures.json');
const fullBulletinFile = path.join(dataDir, 'full-bulletin.json');
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

function partsTR() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date()).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
}

function todayKey() {
  const p = partsTR();
  return `${p.year}-${p.month}-${p.day}`;
}

function statusOf(match) {
  return classifyBulletinMatch(match);
}

function minuteOf(match, status) {
  return verifiedMinute(match, status);
}

function scoreOf(match) {
  const home = match.homeScore ?? match.home_score ?? match.homeGoals ?? match.home_goals;
  const away = match.awayScore ?? match.away_score ?? match.awayGoals ?? match.away_goals;
  if (home !== undefined && home !== null && home !== '' && away !== undefined && away !== null && away !== '') return `${home}-${away}`;
  return String(match.score || match.skor || match.result_score || match.result || '').trim();
}

function pickOdd(match, analysis, keys) {
  for (const key of keys) {
    const value = match?.[key]
      ?? match?.available_odds?.[key]
      ?? match?.odds?.[key]
      ?? match?.oranlar?.[key]
      ?? match?.detay_oranlar?.[key]
      ?? match?.raw_market_guess_odds?.[key]
      ?? analysis?.available_odds?.[key]
      ?? analysis?.raw_market_guess_odds?.[key];
    if (value !== undefined && value !== null && value !== '' && value !== '-') return value;
  }
  return null;
}

function availableOdds(match, analysis) {
  const raw = {
    ...(analysis?.available_odds || {}),
    ...(analysis?.raw_market_guess_odds || {}),
    ...(match?.available_odds || {}),
    ...(match?.raw_market_guess_odds || {})
  };
  return {
    ...raw,
    ms1: pickOdd(match, analysis, ['ms1', 'one', 'oneOdd', 'odd1']),
    msx: pickOdd(match, analysis, ['msx', 'draw', 'drawOdd', 'oddX', 'x']),
    ms2: pickOdd(match, analysis, ['ms2', 'two', 'twoOdd', 'odd2']),
    over25: pickOdd(match, analysis, ['over25', 'ust25', 'over', 'ust', 'ust_25']),
    under25: pickOdd(match, analysis, ['under25', 'alt25', 'under', 'alt', 'alt_25']),
    bttsYes: pickOdd(match, analysis, ['bttsYes', 'kgVar', 'kg_var', 'varOdd', 'var']),
    bttsNo: pickOdd(match, analysis, ['bttsNo', 'kgYok', 'kg_yok', 'yokOdd', 'yok'])
  };
}

function decisionFor(analysis) {
  if (!analysis) return 'Analiz bekleniyor';
  const score = Number(analysis.analysis_score ?? analysis.score ?? 0);
  const market = String(analysis.recommended_market || analysis.market || analysis.selection || '').toLocaleLowerCase('tr-TR');
  if (/oynama|filtered_no_value|filtered_old/.test(market)) return 'Oynama';
  if (analysis.include_in_coupon || score >= 65) return 'Kupon Adayı';
  if (score >= 50) return 'İzleme';
  return 'Oynama';
}

function normalizeMatch(match) {
  const odds = availableOdds(match, null);
  const status = statusOf(match);
  const oddsCount = Object.values(odds).filter((value) => value !== undefined && value !== null && value !== '').length;
  return {
    date: match.date || match.tarih || '',
    time: match.time || match.saat || '',
    league: match.league || match.competition_name || match.lig || '',
    home: match.home || match.home_team_name || match.ev_sahibi || '',
    away: match.away || match.away_team_name || match.deplasman || '',
    status,
    liveStatus: status,
    status_verified: ['live', 'finished'].includes(status) && hasVerifiedStatusEvidence(match),
    status_source: match.status_source || (['live', 'finished'].includes(status) ? match.source || match.kaynak || '' : 'schedule_only'),
    minute: minuteOf(match, status),
    homeScore: match.homeScore ?? match.home_score ?? null,
    awayScore: match.awayScore ?? match.away_score ?? null,
    score: scoreOf(match),
    source: match.source || match.kaynak || '',
    matchCode: match.matchCode || match.mac_kodu || match.match_code || null,
    available_odds: odds,
    odds,
    raw_market_guess_odds: match.raw_market_guess_odds || {},
    raw_odds_sequence: match.raw_odds_sequence || [],
    market_odds_inventory: Object.keys(odds),
    wide_market_odds_count: oddsCount,
    raw_market_value_count: match.raw_market_value_count || oddsCount
  };
}

const today = todayKey();
const fixtures = readJson(fixturesFile, []);
const fullBulletin = readJson(fullBulletinFile, { matches: [], live_matches: [] });
const focus = readJson(focusFile, { focused_markets: [] });

const sourceList = [
  ...(Array.isArray(fixtures) ? fixtures : []),
  ...(Array.isArray(fullBulletin.matches) ? fullBulletin.matches : []),
  ...(Array.isArray(fullBulletin.live_matches) ? fullBulletin.live_matches : [])
];
const uniqueMap = new Map();
for (const item of sourceList) {
  const date = String(item.date || item.tarih || '').slice(0, 10);
  if (!date || date < today) continue;
  const key = [date, item.time || item.saat || '', item.home || item.home_team_name || '', item.away || item.away_team_name || '']
    .map((v) => String(v).trim().toLocaleLowerCase('tr-TR')).join('|');
  uniqueMap.set(key, item);
}

const enrichedMatches = [...uniqueMap.values()].map((match) => normalizeMatch(match));
const liveMatches = enrichedMatches.filter((match) => match.status === 'live');
const finishedMatches = enrichedMatches.filter((match) => match.status === 'finished');
const scheduledMatches = enrichedMatches.filter((match) => match.status === 'scheduled');
const unverifiedMatches = enrichedMatches.filter((match) => ['expired_scheduled', 'unverified', 'unknown'].includes(match.status));
const source = fullBulletin.source || 'Güncel veri bekleniyor';
const nextMatch = scheduledMatches.slice().sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')))[0] || liveMatches[0] || null;

const payload = {
  generated_at: new Date().toISOString(),
  date: today,
  timezone: 'Europe/Istanbul',
  source,
  title: 'Futbol Laboratuvarı Canlı Veri',
  status: liveMatches.length ? 'active' : 'waiting',
  message: liveMatches.length ? 'Sağlayıcı tarafından doğrulanan canlı karşılaşmalar listede.' : 'Şu anda doğrulanmış canlı karşılaşma yok.',
  status_policy: 'provider_verified_only',
  counts: {
    total: enrichedMatches.length,
    current_window: enrichedMatches.length,
    live: liveMatches.length,
    scheduled: scheduledMatches.length,
    finished: finishedMatches.length,
    unverified_or_expired: unverifiedMatches.length,
    active_analysis: 0,
    completed_analysis: 0,
    coupon_candidates: 0,
    watch_candidates: 0,
    focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets.length : 0,
    wide_market_odds: enrichedMatches.reduce((sum, match) => sum + Number(match.wide_market_odds_count || 0), 0)
  },
  next_match: nextMatch,
  focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets : [],
  active_items: [],
  completed_items: [],
  matches: liveMatches,
  scheduled_matches: scheduledMatches
};

writeJson(liveFile, payload);
console.log(`live-matches.json updated. Live: ${payload.counts.live}. Scheduled: ${payload.counts.scheduled}.`);

try {
  const { runLearningMemory } = require('./robot-learning-memory.js');
  runLearningMemory();
} catch (error) {
  console.warn(`robot learning memory skipped: ${error.message}`);
}

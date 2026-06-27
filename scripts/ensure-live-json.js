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
const fullBulletinFile = path.join(dataDir, 'full-bulletin.json');
const analysisFile = path.join(dataDir, 'analiz_sonuclari.json');
const robotAnalysisFile = path.join(dataDir, 'robot-analysis.json');
const focusFile = path.join(dataDir, 'focused_markets.json');
const LIVE_WINDOW_MINUTES = 130;

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

function nowMinutesTR() {
  const p = partsTR();
  return Number(p.hour) * 60 + Number(p.minute);
}

function clockMinutes(time) {
  const m = String(time || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function cleanKey(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function titleOf(match) {
  return String(match.match_name || match.match || `${match.home || match.home_team_name || ''} ${match.away || match.away_team_name || ''}`).trim();
}

function keyOf(match) {
  return cleanKey(`${match.home || match.home_team_name || ''} ${match.away || match.away_team_name || ''}`);
}

function robotKey(match) {
  return cleanKey(titleOf(match).replace(/\bVS\b/gi, ' '));
}

function buildAnalysisMap(robotAnalysis) {
  const map = new Map();
  for (const item of robotAnalysis.matches || []) {
    const key = robotKey(item);
    if (key) map.set(key, item);
  }
  return map;
}

function findAnalysis(match, map) {
  const direct = keyOf(match);
  const reverse = cleanKey(`${match.away || match.away_team_name || ''} ${match.home || match.home_team_name || ''}`);
  return map.get(direct) || map.get(reverse) || null;
}

function statusOf(match) {
  const explicit = String(match.status || match.liveStatus || match.durum || 'scheduled').toLocaleLowerCase('tr-TR');
  if (['live', 'canlı', 'canli', 'in_play', 'inplay', '1h', '2h', 'ht', 'paused'].includes(explicit)) return 'live';
  if (['finished', 'bitti', 'tamamlandı', 'tamamlandi', 'full_time', 'ft', 'ms', 'cancelled', 'canceled', 'iptal'].includes(explicit)) return 'finished';
  const date = String(match.date || match.tarih || '').slice(0, 10);
  const start = clockMinutes(match.time || match.saat || match.start_time);
  const today = todayKey();
  if (!date || start === null) return 'scheduled';
  if (date < today) return 'finished';
  if (date > today) return 'scheduled';
  const diff = nowMinutesTR() - start;
  if (diff >= 0 && diff <= LIVE_WINDOW_MINUTES) return 'live';
  if (diff > LIVE_WINDOW_MINUTES) return 'finished';
  return 'scheduled';
}

function minuteOf(match, status) {
  const explicit = Number(match.minute ?? match.elapsed ?? match.matchMinute);
  if (Number.isFinite(explicit) && explicit > 0) return Math.min(120, Math.round(explicit));
  if (status !== 'live') return null;
  const start = clockMinutes(match.time || match.saat || match.start_time);
  if (start === null) return null;
  const diff = nowMinutesTR() - start;
  if (diff <= 0) return null;
  return Math.max(1, Math.min(90, diff > 60 ? diff - 15 : diff));
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

function normalizeMatch(match, analysis = null) {
  const odds = availableOdds(match, analysis);
  const status = statusOf(match);
  const score = analysis ? Number(analysis.analysis_score ?? analysis.score ?? 0) : null;
  const oddsCount = Object.values(odds).filter((value) => value !== undefined && value !== null && value !== '').length;
  return {
    date: match.date || match.tarih || '',
    time: match.time || match.saat || '',
    league: match.league || match.competition_name || match.lig || '',
    home: match.home || match.home_team_name || match.ev_sahibi || '',
    away: match.away || match.away_team_name || match.deplasman || '',
    status,
    liveStatus: status,
    minute: minuteOf(match, status),
    score: scoreOf(match),
    source: match.source || match.kaynak || '',
    matchCode: match.matchCode || match.mac_kodu || match.match_code || null,
    available_odds: odds,
    odds,
    raw_market_guess_odds: match.raw_market_guess_odds || {},
    raw_odds_sequence: match.raw_odds_sequence || [],
    market_odds_inventory: Object.keys(odds),
    wide_market_odds_count: oddsCount,
    suggested_option: analysis?.recommended_market || analysis?.market || analysis?.selection || '',
    suggested_odds: analysis?.estimated_odds || analysis?.odds || '',
    analysis_score: score,
    confidence: analysis?.confidence_score || (score !== null ? `${score}%` : ''),
    risk_level: analysis?.risk_level || '',
    decision: decisionFor(analysis),
    robot_reason: analysis?.robot_comment || analysis?.robot_reason || '',
    include_in_coupon: Boolean(analysis?.include_in_coupon),
    raw_market_value_count: match.raw_market_value_count || oddsCount
  };
}

const today = todayKey();
const fixtures = readJson(fixturesFile, []);
const fullBulletin = readJson(fullBulletinFile, { matches: [], live_matches: [] });
const analysis = readJson(analysisFile, { active_items: [], completed_items: [] });
const robotAnalysis = readJson(robotAnalysisFile, { matches: [], summary: {} });
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

const robotMap = buildAnalysisMap(robotAnalysis);
const enrichedMatches = [...uniqueMap.values()].map((match) => normalizeMatch(match, findAnalysis(match, robotMap)));
const liveMatches = enrichedMatches.filter((match) => match.status === 'live');
const finishedMatches = enrichedMatches.filter((match) => match.status === 'finished');
const scheduledMatches = enrichedMatches.filter((match) => match.status === 'scheduled');
const activeItems = Array.isArray(analysis.active_items) ? analysis.active_items : [];
const completedItems = Array.isArray(analysis.completed_items) ? analysis.completed_items : [];
const source = fullBulletin.source || robotAnalysis.engine || analysis.source || 'Güncel veri bekleniyor';
const nextMatch = scheduledMatches.slice().sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')))[0] || liveMatches[0] || null;

const payload = {
  generated_at: new Date().toISOString(),
  date: today,
  timezone: 'Europe/Istanbul',
  source,
  title: 'Futbol Laboratuvarı Canlı Veri',
  status: liveMatches.length ? 'active' : 'waiting',
  message: liveMatches.length ? 'Başlayan karşılaşmalar canlı listede.' : 'Şu anda başlayan karşılaşma yok.',
  counts: {
    total: enrichedMatches.length,
    current_window: enrichedMatches.length,
    live: liveMatches.length,
    scheduled: scheduledMatches.length,
    finished: finishedMatches.length,
    active_analysis: enrichedMatches.filter((match) => match.analysis_score !== null).length,
    completed_analysis: completedItems.length,
    coupon_candidates: enrichedMatches.filter((match) => match.decision === 'Kupon Adayı').length,
    watch_candidates: enrichedMatches.filter((match) => match.decision === 'İzleme').length,
    focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets.length : 0,
    wide_market_odds: enrichedMatches.reduce((sum, match) => sum + Number(match.wide_market_odds_count || 0), 0)
  },
  next_match: nextMatch,
  focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets : [],
  active_items: activeItems,
  completed_items: completedItems,
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

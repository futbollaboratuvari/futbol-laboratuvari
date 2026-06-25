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
const robotAnalysisFile = path.join(dataDir, 'robot-analysis.json');
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

function cleanKey(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchTitle(match) {
  return String(match.match_name || match.match || `${match.home || match.home_team_name || ''} ${match.away || match.away_team_name || ''}`).trim();
}

function fixtureKey(match) {
  return cleanKey(`${match.home || match.home_team_name || ''} ${match.away || match.away_team_name || ''}`);
}

function robotKey(match) {
  const title = matchTitle(match).replace(/\bVS\b/gi, ' ');
  return cleanKey(title);
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
  const key = fixtureKey(match);
  if (map.has(key)) return map.get(key);
  const reverse = cleanKey(`${match.away || match.away_team_name || ''} ${match.home || match.home_team_name || ''}`);
  if (map.has(reverse)) return map.get(reverse);
  return null;
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

function pickOdd(match, analysis, keys) {
  for (const key of keys) {
    const value = match?.[key]
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
  return {
    ms1: pickOdd(match, analysis, ['ms1', 'one', 'oneOdd', 'odd1']),
    msx: pickOdd(match, analysis, ['msx', 'draw', 'drawOdd', 'oddX', 'x']),
    ms2: pickOdd(match, analysis, ['ms2', 'two', 'twoOdd', 'odd2']),
    over25: pickOdd(match, analysis, ['over25', 'ust25', 'over', 'ust', 'ust_25']),
    under25: pickOdd(match, analysis, ['under25', 'alt25', 'under', 'alt', 'alt_25']),
    over35: pickOdd(match, analysis, ['over35', 'ust35', 'over3_5', 'ust_35']),
    under35: pickOdd(match, analysis, ['under35', 'alt35', 'under3_5', 'alt_35']),
    bttsYes: pickOdd(match, analysis, ['bttsYes', 'kgVar', 'kg_var', 'varOdd', 'var']),
    bttsNo: pickOdd(match, analysis, ['bttsNo', 'kgYok', 'kg_yok', 'yokOdd', 'yok']),
    firstHalfBttsYes: pickOdd(match, analysis, ['firstHalfBttsYes', 'iyKgVar', 'iy_kg_var', 'first_half_btts_yes']),
    secondHalfBttsYes: pickOdd(match, analysis, ['secondHalfBttsYes', 'ikinciYariKgVar', 'ikinci_yari_kg_var', 'second_half_btts_yes'])
  };
}

function decisionFor(analysis) {
  if (!analysis) return 'Analiz bekleniyor';
  const score = Number(analysis.analysis_score ?? analysis.score ?? 0);
  const market = String(analysis.recommended_market || analysis.market || analysis.selection || '').toLocaleLowerCase('tr-TR');
  if (/güncel maç değil|guncel mac degil|değerli market yok|degerli market yok|filtered_no_value|filtered_old|oynama/.test(market)) return 'Oynama';
  if (analysis.include_in_coupon || score >= 65) return 'Kupon Adayı';
  if (score >= 50) return 'İzleme';
  return 'Oynama';
}

function normalizeMatch(match, analysis = null) {
  const odds = availableOdds(match, analysis);
  const score = analysis ? Number(analysis.analysis_score ?? analysis.score ?? 0) : null;
  const recommendedMarket = analysis?.recommended_market || analysis?.market || analysis?.selection || '';
  const estimatedOdds = analysis?.estimated_odds || analysis?.odds || '';
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
    oneOdd: odds.ms1,
    drawOdd: odds.msx,
    twoOdd: odds.ms2,
    available_odds: odds,
    suggested_option: recommendedMarket,
    suggested_odds: estimatedOdds,
    analysis_score: score,
    confidence: analysis?.confidence_score || (score !== null ? `${score}%` : ''),
    risk_level: analysis?.risk_level || '',
    decision: decisionFor(analysis),
    value_label: analysis?.value_label || '',
    data_gap_risk: analysis?.data_gap_risk || '',
    robot_reason: analysis?.robot_comment || analysis?.robot_reason || '',
    expected_scores: analysis?.expected_scores || [],
    include_in_coupon: Boolean(analysis?.include_in_coupon),
    suitable_coupon_type: analysis?.suitable_coupon_type || '',
    band_attention_level: analysis?.band_attention_level || '',
    raw_market_block_count: Array.isArray(match.raw_market_blocks) ? match.raw_market_blocks.length : (match.raw_market_block_count || 0),
    raw_market_value_count: match.raw_market_value_count || 0
  };
}

const today = todayKey();
const fixtures = readJson(fixturesFile, []);
const analysis = readJson(analysisFile, { active_items: [], completed_items: [] });
const robotAnalysis = readJson(robotAnalysisFile, { matches: [], summary: {} });
const focus = readJson(focusFile, { focused_markets: [] });
const fixtureList = Array.isArray(fixtures) ? fixtures : [];
const windowMatches = fixtureList.filter((match) => isCurrentWindow(match, today));
const robotMap = buildAnalysisMap(robotAnalysis);
const enrichedMatches = windowMatches.map((match) => normalizeMatch(match, findAnalysis(match, robotMap)));
const liveMatches = enrichedMatches.filter(isLive);
const finishedMatches = enrichedMatches.filter(isFinished);
const scheduledMatches = enrichedMatches.filter((match) => !isLive(match) && !isFinished(match));
const activeItems = Array.isArray(analysis.active_items) ? analysis.active_items : [];
const completedItems = Array.isArray(analysis.completed_items) ? analysis.completed_items : [];
const source = windowMatches[0]?.source || fixtureList[0]?.source || robotAnalysis.engine || analysis.source || 'Güncel veri bekleniyor';
const nextMatch = scheduledMatches.slice().sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')))[0] || liveMatches[0] || null;

const payload = {
  generated_at: new Date().toISOString(),
  date: today,
  timezone: 'Europe/Istanbul',
  source,
  title: 'Futbol Laboratuvarı Canlı Veri',
  status: windowMatches.length ? 'active' : 'waiting',
  message: windowMatches.length ? 'Canlı veri alanı maç, oran ve robot karar akışını gösteriyor.' : 'Bugün için güncel veri henüz oluşmadı.',
  counts: {
    total: fixtureList.length,
    current_window: windowMatches.length,
    live: liveMatches.length,
    scheduled: scheduledMatches.length,
    finished: finishedMatches.length,
    active_analysis: enrichedMatches.filter((match) => match.analysis_score !== null).length,
    completed_analysis: completedItems.length,
    coupon_candidates: enrichedMatches.filter((match) => match.decision === 'Kupon Adayı').length,
    watch_candidates: enrichedMatches.filter((match) => match.decision === 'İzleme').length,
    focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets.length : 0
  },
  next_match: nextMatch,
  focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets : [],
  active_items: activeItems,
  completed_items: completedItems,
  matches: enrichedMatches
};

writeJson(liveFile, payload);
console.log(`live-matches.json updated. Matches: ${payload.counts.current_window}. Analysis: ${payload.counts.active_analysis}. Coupon candidates: ${payload.counts.coupon_candidates}.`);

try {
  const { runLearningMemory } = require('./robot-learning-memory.js');
  runLearningMemory();
} catch (error) {
  console.warn(`robot learning memory skipped: ${error.message}`);
}

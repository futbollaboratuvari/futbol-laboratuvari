const fs = require('fs');
const path = require('path');
const { buildProAnalysisIndex } = require('./build-pro-analysis-index');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const robotAnalysisFile = path.join(dataDir, 'robot-analysis.json');
const liveMatchesFile = path.join(dataDir, 'live-matches.json');
const analysisResultsFile = path.join(dataDir, 'analiz_sonuclari.json');
const resultsSummaryFile = path.join(dataDir, 'results-summary.json');
const focusFile = path.join(dataDir, 'focused_markets.json');
const learningMemoryFile = path.join(dataDir, 'learning-memory.json');
const MAX_COMPLETED_ITEMS = 250;
const MAX_RESULT_SUMMARY_ITEMS = 30;

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

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function normalizeScore(value) {
  const number = Number(String(value ?? '').replace('%', '').replace(',', '.'));
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 0;
}

function nullableNumber(value) {
  if (value === undefined || value === null || value === '' || value === '-') return null;
  const number = Number(String(value).replace('%', '').replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

function itemTitle(item) {
  return item.match_name || item.match || `${item.home || ''} - ${item.away || ''}`.trim() || 'Maç';
}

function signalsOf(item) {
  const signals = item.signals || item.pro_signals || item.band_attention_notes || [];
  if (Array.isArray(signals) && signals.length) return signals;
  if (item.robot_comment) return [item.robot_comment];
  return ['Robot analizi üretildi fakat güçlü sinyal oluşmadı.'];
}

function toActiveItem(item, index) {
  const score = normalizeScore(item.analysis_score ?? item.score ?? item.confidence_score);
  const market = item.recommended_market || item.market || item.selection || item.suggested_option || 'Analiz bekleniyor';
  const risk = item.risk_level || item.risk || '-';
  const title = itemTitle(item);
  return {
    id: `auto-${index + 1}`,
    date: item.date || todayKey(),
    time: item.start_time || item.time || '',
    league: item.league || item.competition_name || '',
    title,
    match: title,
    market,
    prediction: market,
    decision: item.include_in_coupon ? 'Kupon Adayı' : score >= 50 ? 'İzleme' : 'Oynama',
    score: `${score}%`,
    confidence: `${score}%`,
    confidence_score: `${score}%`,
    model_score: normalizeScore(item.model_score ?? item.analysis_score ?? item.score),
    score_type: item.score_type || 'signal_strength',
    estimated_probability: nullableNumber(item.estimated_probability),
    market_probability: nullableNumber(item.market_probability),
    edge_percent: nullableNumber(item.edge_percent),
    data_completeness: nullableNumber(item.data_completeness) || 0,
    model_version: item.model_version || '',
    risk,
    risk_level: risk,
    status: item.status || item.liveStatus || 'scheduled',
    estimated_odds: item.estimated_odds || item.odds || '-',
    available_odds: item.available_odds || {},
    raw_market_guess_odds: item.raw_market_guess_odds || {},
    detail_market_candidates: item.detail_market_candidates || [],
    expected_scores: item.expected_scores || [],
    value_label: item.value_label || '-',
    commentary: item.robot_comment || signalsOf(item).slice(0, 3).join(' | '),
    robot_comment: item.robot_comment || '',
    pro_signals: signalsOf(item),
    signals: signalsOf(item),
    source: item.odds_source || item.source || 'Robot analiz akışı'
  };
}

function sortItems(a, b) {
  return normalizeScore(b.score) - normalizeScore(a.score) || String(a.time || '').localeCompare(String(b.time || ''), 'tr');
}

function outcomeStatus(value) {
  const status = String(value || '').toLocaleLowerCase('tr-TR');
  if (['won', 'kazandı', 'kazandi', 'doğru', 'dogru'].includes(status)) return 'won';
  if (['lost', 'kaybetti', 'yanlış', 'yanlis'].includes(status)) return 'lost';
  if (['void', 'iptal', 'iade'].includes(status)) return 'void';
  return 'pending';
}

function marketGroup(value) {
  const market = String(value || '').toLocaleLowerCase('tr-TR');
  if (/^ms\s|maç sonucu|mac sonucu|çş|cs|çifte şans|cifte sans/.test(market)) return { key: 'match_result', label: 'Maç Sonucu' };
  if (/kg|karşılıklı gol|karsilikli gol|btts/.test(market)) return { key: 'btts', label: 'Karşılıklı Gol' };
  if (/üst|ust|alt|gol/.test(market)) return { key: 'goals', label: 'Gol Marketleri' };
  return { key: 'other', label: 'Diğer Marketler' };
}

function toCompletedItem(item) {
  const status = outcomeStatus(item.status || item.result);
  const group = marketGroup(item.market || item.prediction);
  return {
    id: item.id || [item.date, item.match_name || item.match, item.market || item.prediction].join('|'),
    date: String(item.date || '').slice(0, 10),
    time: item.start_time || item.time || '',
    title: item.match_name || item.match || item.title || 'Maç',
    match: item.match_name || item.match || item.title || 'Maç',
    market: item.market || item.prediction || '-',
    prediction: item.market || item.prediction || '-',
    odds: item.odds || item.estimated_odds || '-',
    score: item.result_score || item.final_score || item.score || '-',
    result_score: item.result_score || item.final_score || item.score || '-',
    confidence: item.confidence_score || item.confidence || '-',
    confidence_score: item.confidence_score || item.confidence || '-',
    model_score: normalizeScore(item.model_score ?? item.analysis_score ?? item.confidence_score ?? item.confidence),
    estimated_probability: nullableNumber(item.estimated_probability),
    market_probability: nullableNumber(item.market_probability),
    edge_percent: nullableNumber(item.edge_percent),
    data_completeness: nullableNumber(item.data_completeness) || 0,
    model_version: item.model_version || '',
    risk: item.risk_level || item.risk || '-',
    status,
    result: status,
    market_group: group.key,
    market_group_label: group.label,
    finalized_at: item.finalized_at || item.updated_at || '',
    source: item.source || 'Robot öğrenme hafızası',
  };
}

function completedSort(a, b) {
  return `${b.date || ''} ${b.time || ''} ${b.finalized_at || ''}`.localeCompare(`${a.date || ''} ${a.time || ''} ${a.finalized_at || ''}`, 'tr');
}

function buildCompletedItems(memory, previousItems = []) {
  const verified = (memory.predictions || [])
    .filter((item) => ['won', 'lost', 'void'].includes(outcomeStatus(item.status)))
    .map(toCompletedItem);
  const map = new Map();
  (Array.isArray(previousItems) ? previousItems : [])
    .map(toCompletedItem)
    .filter((item) => ['won', 'lost', 'void'].includes(item.status))
    .forEach((item) => map.set(item.id, item));
  verified.forEach((item) => map.set(item.id, item));
  return [...map.values()].sort(completedSort).slice(0, MAX_COMPLETED_ITEMS);
}

function buildPerformance(memory) {
  const predictions = Array.isArray(memory.predictions) ? memory.predictions : [];
  const won = predictions.filter((item) => outcomeStatus(item.status) === 'won');
  const lost = predictions.filter((item) => outcomeStatus(item.status) === 'lost');
  const voidItems = predictions.filter((item) => outcomeStatus(item.status) === 'void');
  const pending = predictions.filter((item) => outcomeStatus(item.status) === 'pending');
  const measured = won.length + lost.length;
  const probabilityRows = [...won, ...lost]
    .map((item) => ({
      probability: nullableNumber(item.estimated_probability),
      outcome: outcomeStatus(item.status) === 'won' ? 1 : 0,
    }))
    .filter((item) => item.probability !== null && item.probability >= 0 && item.probability <= 100);
  const brierScore = probabilityRows.length
    ? probabilityRows.reduce((sum, item) => sum + (((item.probability / 100) - item.outcome) ** 2), 0) / probabilityRows.length
    : null;
  const calibrationMap = new Map();
  probabilityRows.forEach((item) => {
    const lower = Math.min(90, Math.floor(item.probability / 10) * 10);
    const row = calibrationMap.get(lower) || { lower, upper: lower + 9, predictions: 0, won: 0, average_probability: 0, observed_rate: null };
    row.predictions += 1;
    row.won += item.outcome;
    row.average_probability += item.probability;
    calibrationMap.set(lower, row);
  });
  const calibrationBuckets = [...calibrationMap.values()].map((row) => ({
    ...row,
    average_probability: Number((row.average_probability / row.predictions).toFixed(1)),
    observed_rate: Number(((row.won / row.predictions) * 100).toFixed(1)),
  })).sort((a, b) => a.lower - b.lower);
  const groups = new Map();
  [...won, ...lost].forEach((item) => {
    const group = marketGroup(item.market || item.prediction);
    const row = groups.get(group.key) || { key: group.key, label: group.label, measured: 0, won: 0, lost: 0, success_rate: null };
    row.measured += 1;
    if (outcomeStatus(item.status) === 'won') row.won += 1;
    else row.lost += 1;
    row.success_rate = Math.round((row.won / row.measured) * 100);
    groups.set(group.key, row);
  });
  const verifiedAt = predictions
    .map((item) => item.finalized_at || '')
    .filter(Boolean)
    .sort()
    .at(-1) || null;
  return {
    prediction_count: predictions.length,
    measured_count: measured,
    pending_count: pending.length,
    won_count: won.length,
    lost_count: lost.length,
    void_count: voidItems.length,
    success_rate: measured ? Math.round((won.length / measured) * 100) : null,
    probability_sample_count: probabilityRows.length,
    brier_score: brierScore === null ? null : Number(brierScore.toFixed(4)),
    calibration_status: probabilityRows.length >= 30 ? 'measured' : 'collecting_probability_history',
    calibration_buckets: calibrationBuckets,
    verified_at: verifiedAt,
    groups: [...groups.values()].sort((a, b) => b.measured - a.measured || b.success_rate - a.success_rate),
  };
}

function buildResultsSummary(payload) {
  return {
    generated_at: payload.generated_at,
    date: payload.date,
    timezone: payload.timezone || 'Europe/Istanbul',
    source: payload.source || 'Doğrulanmış sonuç akışı',
    completed_items: (Array.isArray(payload.completed_items) ? payload.completed_items : [])
      .slice(0, MAX_RESULT_SUMMARY_ITEMS),
    performance: payload.performance || {
      prediction_count: 0,
      measured_count: 0,
      pending_count: 0,
      won_count: 0,
      lost_count: 0,
      void_count: 0,
      success_rate: null,
      probability_sample_count: 0,
      brier_score: null,
      calibration_status: 'collecting_probability_history',
      calibration_buckets: [],
      groups: [],
    },
  };
}

function main() {
  const today = todayKey();
  const robotAnalysis = readJson(robotAnalysisFile, { matches: [], summary: {} });
  const liveMatches = readJson(liveMatchesFile, { matches: [], active_items: [], completed_items: [] });
  const previous = readJson(analysisResultsFile, { active_items: [], completed_items: [] });
  const focus = readJson(focusFile, { focused_markets: [] });
  const learningMemory = readJson(learningMemoryFile, { predictions: [] });

  const sourceMatches = Array.isArray(robotAnalysis.matches) && robotAnalysis.matches.length
    ? robotAnalysis.matches
    : Array.isArray(liveMatches.matches)
      ? liveMatches.matches
      : [];

  const activeItems = sourceMatches
    .map(toActiveItem)
    .sort(sortItems);

  const completedItems = buildCompletedItems(learningMemory, previous.completed_items);
  const performance = buildPerformance(learningMemory);
  const couponCandidates = activeItems.filter((item) => item.decision === 'Kupon Adayı').length;
  const watchCandidates = activeItems.filter((item) => item.decision === 'İzleme').length;

  const payload = {
    generated_at: new Date().toISOString(),
    date: today,
    timezone: 'Europe/Istanbul',
    source: robotAnalysis.engine || liveMatches.source || 'Robot analiz akışı',
    status: activeItems.length ? 'active' : 'waiting',
    summary: {
      fixture_count: robotAnalysis.summary?.fixture_count ?? sourceMatches.length,
      scored_match_count: robotAnalysis.summary?.scored_match_count ?? sourceMatches.length,
      active_item_count: activeItems.length,
      coupon_candidate_count: couponCandidates,
      watch_candidate_count: watchCandidates
    },
    active_items: activeItems,
    completed_items: completedItems,
    performance,
    focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets : (previous.focused_markets || []),
    focused_market_note: previous.focused_market_note || 'Robot analiz çıktısı siteye bağlandı.'
  };

  writeJson(analysisResultsFile, payload);
  writeJson(resultsSummaryFile, buildResultsSummary(payload));
  buildProAnalysisIndex();
  console.log(`analiz_sonuclari.json synced. Active: ${activeItems.length}. Coupon: ${couponCandidates}. Watch: ${watchCandidates}.`);
}

if (require.main === module) main();

module.exports = { buildCompletedItems, buildPerformance, buildResultsSummary, main, marketGroup, outcomeStatus, toCompletedItem };

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const robotAnalysisFile = path.join(dataDir, 'robot-analysis.json');
const liveMatchesFile = path.join(dataDir, 'live-matches.json');
const analysisResultsFile = path.join(dataDir, 'analiz_sonuclari.json');
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

function main() {
  const today = todayKey();
  const robotAnalysis = readJson(robotAnalysisFile, { matches: [], summary: {} });
  const liveMatches = readJson(liveMatchesFile, { matches: [], active_items: [], completed_items: [] });
  const previous = readJson(analysisResultsFile, { active_items: [], completed_items: [] });
  const focus = readJson(focusFile, { focused_markets: [] });

  const sourceMatches = Array.isArray(robotAnalysis.matches) && robotAnalysis.matches.length
    ? robotAnalysis.matches
    : Array.isArray(liveMatches.matches)
      ? liveMatches.matches
      : [];

  const activeItems = sourceMatches
    .map(toActiveItem)
    .sort(sortItems);

  const completedItems = Array.isArray(previous.completed_items) ? previous.completed_items : [];
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
    focused_markets: Array.isArray(focus.focused_markets) ? focus.focused_markets : (previous.focused_markets || []),
    focused_market_note: previous.focused_market_note || 'Robot analiz çıktısı siteye bağlandı.'
  };

  writeJson(analysisResultsFile, payload);
  console.log(`analiz_sonuclari.json synced. Active: ${activeItems.length}. Coupon: ${couponCandidates}. Watch: ${watchCandidates}.`);
}

if (require.main === module) main();

module.exports = { main };
